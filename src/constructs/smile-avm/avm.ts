import * as path from 'path';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecr from '@aws-cdk/aws-ecr';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

import * as smile from '../../';
import { SmileEksCluster } from '../smile-eks/cluster';

/**
 * The Account Vending Machine (AVM) Properties
 */
export interface ISmileAVMProps {
  /**
   * What Vpc to use
   */
  vpc: ec2.IVpc;

  /**
   * This will be the base domain for Jenkins in the AVM
   * i.e. jenkins.`$tld`
   */
  tld: smile.ISmileTld;
  /**
   * This will determine the number of AZs EKS uses
   * This will match vpc.maxAzs b/c thats how we pass it
   * @default 3
   */
  capacity: number;
}

/**
 * The Account Vending Machine
 */
export class SmileAVM extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: ISmileAVMProps) {
    super(scope, id);

    /**
     * Store the Results in DynamoDB
     * XXX: This needs encryption from smile-kms
     */
    new dynamodb.Table(this, 'Smile-Accounts', {
      partitionKey: { name: 'alias', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // encryption: TableEncryption.CUSTOMER_MANAGED,
      // encryptionKey, // This will be exposed as table.encryptionKey
    });

    /**
     * This forms the basis of our Container Eco System
     */
    new ecr.Repository(this, 'trexsolutions/smile-builder', {
      repositoryName: 'trexsolutions/smile-builder',
      // XXX: this doesn't actually work, the repo has to also be empty
      // XXX: we'll need a Custom Resource here
      // XXX: AWS refuses to do this b/c if you delete in prod........
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true,
    });

    /**
     * This is the real container we use to do provisioning
     */
    new ecr.Repository(this, 'trexsolutions/smile-provisioner', {
      repositoryName: 'trexsolutions/smile-provisioner',
      // XXX: this doesn't actually work, the repo has to also be empty
      // XXX: we'll need a Custom Resource here
      // XXX: AWS refuses to do this b/c if you delete in prod........
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true,
    });

    /**
     * The EKS Cluster Smile Style
     * XXX: This is in the 2021 Roadmap to make its Own Construct
     */
    new SmileEksCluster(this, 'Eks', {
      vpc: props.vpc,
      tld: props.tld,
      capacity: props.capacity,
    });

    /**
     * The AVM needs these permissions to do its job
     * It uses both of these Today
     */
    const policy = new iam.PolicyStatement({
      actions: [
        'organizations:CreateAccount',
        'organizations:DescribeCreateAccountStatus',
      ],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });

    /**
     * This lambda actually creates the account based on passed in
     * Config via --payload inside of Jenkins
     * Arguably, this could be shell code in a Jenkins Job too
     * or an EKS Task
     */
    const fn = new lambda.Function(this, 'accountVendingMachine', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.minutes(15),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../resources/lambda/AvmAccountCreate'),
      ),
    });

    /**
     * Give the Lambda the perms
     */
    fn.addToRolePolicy(policy);
  }
}
