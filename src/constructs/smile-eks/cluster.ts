import * as fs from 'fs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import * as yaml from 'js-yaml';
import { ISmileTld } from '../../types/accountprops';
import { SmileKms } from '../smile-kms';
import { SmileVpcMaxAzs } from './../../types/networkprops';

/**
 * Properties
 * XXX: ISmileTld should be internal to SMILE and public Construct APIs
 */
export interface SmileEksClusterProps {
  vpc: ec2.IVpc;
  tld: ISmileTld;
  capacity: number;
}

/**
 * V1_18 is available and GA, but the Ecosystem isn't ready yet
 * awslabs/cdk8s is pegged at 1_17 as of 11/20/2020 for CNCF AWS Container Day
 * https://aws.amazon.com/about-aws/whats-new/2020/10/amazon-eks-supports-kubernetes-version-1-18/
 */
const CLUSTER_VERSION = eks.KubernetesVersion.V1_17;

/**
 * The Smile EKS Cluster
 * This will be come its own Construct
 * This needs battle testing
 * https://trexcoe.atlassian.net/browse/TLP-18
 */
export class SmileEksCluster extends cdk.Construct {
  public readonly cluster: eks.ICluster;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileEksClusterProps) {
    super(scope, id);

    /**
     * Create the EKS Cluster
     */
    this.cluster = this.eks_cluster(scope, props.vpc, props.capacity);

    /**
     * Setup Charts in the kube-system namespace
     */
    this.kube_system(props.tld);

    /**
     * Setup Jenkins Chart in the Jenkins namespace
     * This needs to be its Own Construct that builds on TLP-18
     * https://trexcoe.atlassian.net/browse/TLP-19
     */
    this.jenkins();
  }

  /**
   *
   * https://github.com/helm/charts/issues/233
   * https://github.com/helm/helm/issues/6006
   * https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/aws-eks-legacy/lib/helm-chart.ts#L87
   * https://github.com/awslabs/cdk8s/issues/48
   *
   * @param scope
   * @param theVpc
   * @param capacity
   */
  private eks_cluster(
    scope: cdk.Construct,
    theVpc: ec2.IVpc,
    capacity: SmileVpcMaxAzs,
  ): eks.ICluster {
    /**
     * This only makes Managed Node Groups
     * https://trexcoe.atlassian.net/browse/DI-1172
     * eventID=arn:aws:health:us-east-1::event/EKS/AWS_EKS_OPERATIONAL_NOTIFICATION/AWS_EKS_OPERATIONAL_NOTIFICATION_01189435-4e8f-4108-9716-0fbdb77a3ad
     */
    return new eks.Cluster(this, 'Cluster', {
      // XXX: this is here for the 63 char limit
      clusterName: 'Smile-Main',
      defaultCapacity: capacity,
      version: CLUSTER_VERSION,
      vpc: theVpc,
      secretsEncryptionKey: SmileKms.getInstance(scope).eksDefault,
    });
  }

  /**
   *
   * @param tld
   */
  private cluster_dns(tld: ISmileTld) {

    /**
     * The pod will use this role to update Route53 when
     * Services request an Ingress in kubernetes speak
     */
    const role = new iam.Role(this, 'External-DNS', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    /**
     * We need to be able to add A, CNAME records to the Zone
     */
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['arn:aws:route53:::hostedzone/*'],
        actions: ['route53:ChangeResourceRecordSets'],
      }),
    );

    /**
     * Need to know what zones exist and what records are in them
     */
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['route53:ListHostedZones', 'route53:ListResourceRecordSets'],
      }),
    );

    /**
     * This should come from config and the version needs to be pinned
     */
    this.cluster.addHelmChart('external-dns', {
      chart: 'external-dns',
      repository: 'https://charts.bitnami.com/bitnami',
      namespace: 'kube-system',
      release: 'external-dns',
      values: {
        policy: 'sync',
        logLevel: 'debug',
        txtOwnerId: tld.id,
        aws: {
          assumeRoleArn: role.roleArn,
        },
      },
    });
  }

  /**
   *
   * @param tld
   */
  private kube_system(tld: ISmileTld) {

    /**
     * Core-DNS, External-DNS, etc...
     */
    this.cluster_dns(tld);

    /**
     * Nginx Ingress Controller
     * XXX: Replace or Add AWS Ingress Controller
     * XXX: Announced CNCF AWS Container Day 11/17/2020
     * https://github.com/kubernetes-sigs/aws-load-balancer-controller
     * https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html
     */
    this.cluster.addHelmChart('nginx-ingress', {
      chart: 'nginx-ingress',
      repository: 'https://helm.nginx.com/stable',
      namespace: 'nginx-ingress',
      release: 'nginx-ingress',
    });

    this.cluster.addHelmChart('metrics-server', {
      chart: 'metrics-server',
      repository: 'https://charts.bitnami.com/bitnami',
      namespace: 'kube-system',
      release: 'metrics-server',
    });

    /**
     * Pull from config, the dashboard will help Newbies
     * Real metrics should come from prometheus and graphana
     * pin the version
     */
    this.cluster.addHelmChart('kubernetes-dashboard', {
      chart: 'kubernetes-dashboard',
      repository: 'https://kubernetes.github.io/dashboard/',
      namespace: 'kube-system',
      release: 'kubernetes-dashboard',
    });

    /**
     * Monitoring, depends on metrics server above
     * Pull from config
     * pin the version
     */
    this.cluster.addHelmChart('prometheus', {
      chart: 'prometheus',
      repository: 'https://prometheus-community.github.io/helm-charts',
      namespace: 'kube-system',
      release: 'prometheus',
    });
  }

  /**
   * The config needs to passed in as props and not read here
   * XXX: move this to the Stack Level
   * XXX: this will then become its Own Construct
   */
  private jenkins() {
    const cf: string = 'dist/jenkins-chart-values.yaml';
    const yml: any = yaml.safeLoad(fs.readFileSync(cf, 'utf8'));

    /**
     * The version is pinned because going past this breaks
     * ALL hell loose in EKS due to the GitHub Security scanner
     * https://www.jenkins.io/security/advisory/2020-11-04/
     * https://www.theregister.com/2020/11/05/githubs_security_scanner_works/
     * This should be our first CDK8s app!
     */
    this.cluster.addHelmChart('jenkins', {
      chart: 'jenkins',
      repository: 'https://charts.jenkins.io',
      namespace: 'jenkins',
      release: 'jenkins',
      values: {
        controller: yml.controller,
      },
    });
  }
}
