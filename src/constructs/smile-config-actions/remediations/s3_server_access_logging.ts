import * as config from '@aws-cdk/aws-config';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import * as SmileS3 from '../../smile-s3';

/**
 * Properties
 */
export interface S3ServerAccessLoggingProps extends config.RuleProps {
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
export class S3ServerAccessLogging extends config.ManagedRule {
  public readonly role: iam.IRole;
  public readonly ssmRole: iam.IRole;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(
    scope: cdk.Construct,
    id: string,
    props: S3ServerAccessLoggingProps = {},
  ) {
    super(scope, id, {
      ...props,
      identifier: 'S3_BUCKET_LOGGING_ENABLED',
      ruleScope: config.RuleScope.fromResource(config.ResourceType.S3_BUCKET),
      description:
        'Checks that your Amazon S3 Bucket Logging Enabled. The rule checks the policy, and applies a bucket policy snippet if needed.',
    });

    /**
     * Use or Create
     * XXX: ?? vs ||
     */
    this.role =
      props.role ||
      new iam.Role(this, 'Role', {
        assumedBy: new iam.ServicePrincipal('config.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess'),
        ],
      });

    /**
     * Use or create
     * XXX: missing param
     */
    this.ssmRole = new iam.Role(this, 'SSMRole', {
      roleName: 'S3OperationsAutomationsExecutionRole-Log',
      assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      ],
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
      targetId: 'AWS-ConfigureS3BucketLogging',
      targetType: 'SSM_DOCUMENT',
      targetVersion: '1',
      parameters: {
        AutomationAssumeRole: {
          StaticValue: {
            Values: [this.ssmRole.roleArn],
          },
        },
        BucketName: {
          ResourceValue: {
            Value: 'RESOURCE_ID',
          },
        },
        TargetBucket: {
          StaticValue: {
            Values: [SmileS3.SmileS3Log.getInstance(this).bucketName],
          },
        },
        GrantedPermission: {
          StaticValue: {
            Values: ['Full Control'],
          },
        },
        GranteeType: {
          StaticValue: {
            Values: ['Group'],
          },
        },
        GranteeUri: {
          StaticValue: {
            Values: ['http://acs.amazonaws.com/groups/s3/LogDelivery'],
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
