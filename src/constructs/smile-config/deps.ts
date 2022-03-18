import * as config from '@aws-cdk/aws-config';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import { SmileS3 } from '../smile-s3';

/**
 * This will not be empty for long
 */
export interface SmileConfigProps {}

/**
 * Smile AWS Config setup (the core parts)
 */
export class SmileConfig extends cdk.Resource {

  /**
   *
   * @param scope
   * @param id
   */
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // XXX: this bucket needs to be its own Construct

    /**
     * Use our own Smile S3 bucket but a dedicated one
     */
    const awsConfigBucket = new SmileS3(this, 'BucketAwsConfig');

    /**
     * The DENY is ok BECAUSE of the condition
     * https://docs.amazonaws.cn/en_us/IAM/latest/UserGuide/images/PolicyEvaluationHorizontal.png
     * This blocks non SSL things
     */
    const policyStatement1 = new iam.PolicyStatement({
      effect: iam.Effect.DENY, // Note the DENY
      actions: ['s3:*'],
      principals: [new iam.AnyPrincipal()],
      resources: [`${awsConfigBucket.bucketArn}/*`],
      conditions: { Bool: { 'aws:SecureTransport': false } },
    });
    awsConfigBucket.addToResourcePolicy(policyStatement1);

    /**
     * We need to be able to put the logs in the Bucket
     * The bucket-owner-full-control is critical and the most common screw up
     */
    const policyStatement2 = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:PutObject'],
      principals: [new iam.ServicePrincipal('config.amazonaws.com')],
      resources: [`${awsConfigBucket.bucketArn}/*`],
      conditions: {
        StringEquals: { 's3:x-amz-acl': 'bucket-owner-full-control' },
      },
    });
    awsConfigBucket.addToResourcePolicy(policyStatement2);

    /**
     * AWS Config Needs to be able to view the Bucket Perms
     */
    const policyStatement3 = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetBucketAcl'],
      principals: [new iam.ServicePrincipal('config.amazonaws.com')],
      resources: [awsConfigBucket.bucketArn],
    });
    awsConfigBucket.addToResourcePolicy(policyStatement3);

    /**
     * Build a Role with the Policies that AWS Config can Sts:AssumeRole
     */
    const awsConfigRole = new iam.Role(this, 'RoleAwsConfig', {
      assumedBy: new iam.ServicePrincipal('config.amazonaws.com'),
    });
    /**
     * Add the AWS Config built in Policy
     */
    awsConfigRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSConfigRole'),
    );

    /**
     * https://github.com/aws/aws-cdk/issues/3577
     * This whole file is temporary until the above is fixed
     */
    new config.CfnDeliveryChannel(this, 'DeliveryChannel', {
      s3BucketName: awsConfigBucket.bucketName,
    });
    new config.CfnConfigurationRecorder(this, 'Recorder', {
      name: 'default',
      roleArn: awsConfigRole.roleArn,
    });
  }
}
