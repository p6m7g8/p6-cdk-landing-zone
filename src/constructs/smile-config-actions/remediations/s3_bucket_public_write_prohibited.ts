import * as config from '@aws-cdk/aws-config';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

/**
 * Properties
 */
export interface S3BucketPublicWriteProhibitedProps extends config.RuleProps {
  /**
   * The IAM Role the Check will run as
   * @default ReadOnlyAccess
   */
  readonly role?: iam.IRole;

  /**
   * The IAM Role the SSM Remediation will run as
   * @default AmazonS3FullAccess
   */
  readonly ssmRole?: iam.IRole;
}

/**
 * The Remediation of Public S3 Reads
 */
export class S3BucketPublicWriteProhibited extends config.ManagedRule {
  public readonly role: iam.IRole;
  public readonly ssmRole: iam.IRole;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: S3BucketPublicWriteProhibitedProps = {}) {
    super(scope, id, {
      ...props,
      identifier: 'S3_BUCKET_PUBLIC_WRITE_PROHIBITED',
      ruleScope: config.RuleScope.fromResource(config.ResourceType.S3_BUCKET),
      description:
				'Checks that your Amazon S3 buckets do not allow public write access. The rule checks the Block Public Access settings, the bucket policy, and the bucket access control list (ACL).',
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
     * Use or create
     * XXX: missing param
     */
    this.ssmRole = new iam.Role(this, 'SSMRole', {
      roleName: 'S3OperationsAutomationsExecutionRole-Write',
      assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')],
    });

    this.configRemediationConfiguration();
  }

  /**
   * Converted to TS from
   * This needs to be configurable for runtime in large installations
   * https://github.com/awslabs/aws-config-rules/blob/master/aws-config-conformance-packs/Operational-Best-Practices-for-Amazon-S3-with-Remediation.yaml
   * https://docs.aws.amazon.com/config/latest/developerguide/conformancepack-sample-templates.html
   * https://docs.aws.amazon.com/config/latest/developerguide/templateswithremediation.html
   * https://docs.aws.amazon.com/config/latest/developerguide/conformance-packs.html
   */
  private configRemediationConfiguration() {
    new config.CfnRemediationConfiguration(this, 'RemediationConfiguration', {
      configRuleName: this.configRuleName,
      resourceType: 'AWS::S3::Bucket',
      targetId: 'AWS-DisableS3BucketPublicReadWrite',
      targetType: 'SSM_DOCUMENT',
      targetVersion: '1',
      parameters: {
        AutomationAssumeRole: {
          StaticValue: {
            Values: [this.ssmRole.roleArn],
          },
        },
        S3BucketName: {
          ResourceValue: {
            Value: 'RESOURCE_ID',
          },
        },
      },
      executionControls: {
        ssmControls: {
          concurrentExecutionRatePercentage: 10,
          errorPercentage: 10,
        },
      },
      automatic: true,
      maximumAutomaticAttempts: 10,
      retryAttemptSeconds: 600,
    });
  }
}
