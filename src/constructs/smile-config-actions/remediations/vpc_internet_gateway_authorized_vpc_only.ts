import * as config from '@aws-cdk/aws-config';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

/**
 * Properties
 */
export interface VpcInternetGatewayAuthorizedVpcOnlyProps extends config.RuleProps {
  /**
   * The IAM Role the Check will run as
   * @default ReadOnlyAccess
   */
  readonly role?: iam.IRole;
}

/**
 * The Remediation of Public S3 Reads
 */
export class VpcInternetGatewayAuthorizedVpcOnly extends config.ManagedRule {
  public readonly role: iam.IRole;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: VpcInternetGatewayAuthorizedVpcOnlyProps = {}) {
    super(scope, id, {
      ...props,
      identifier: 'INTERNET_GATEWAY_AUTHORIZED_VPC_ONLY',
      ruleScope: config.RuleScope.fromResource(config.ResourceType.EC2_INTERNET_GATEWAY),
      description:
				'Checks that Internet gateways (IGWs) are only attached to an authorized Amazon Virtual Private Cloud (VPCs). The rule is NON_COMPLIANT if IGWs are not attached to an authorized VPC.',
    });

    /**
     * Use or Create
     * XXX: ?? vs ||
     */
    this.role =
			props.role ||
			new iam.Role(this, 'Role', {
			  assumedBy: new iam.ServicePrincipal('config.amazonaws.com'),
			  managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
			});

    /**
     * XXX: Need an SSM Implementation
     */
  }
}
