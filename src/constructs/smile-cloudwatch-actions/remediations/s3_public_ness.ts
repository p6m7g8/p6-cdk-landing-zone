import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

/**
 * Prevent/Return public Buckets, ACLs, Objects to Private
 * XXX: We will need an allow list from Config (or DB) eventually
 */
export class SmileS3Publicness extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   */
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    /**
     * XXX: InfoSec review, we do not need ALL S3 perms
     */
    const policy = new iam.PolicyStatement({
      actions: ['s3:*'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });

    /**
     * The lambda
     */
    const fn = new lambda.Function(this, 'S3ProhibitPublicRead', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../resources/lambda/S3Publicness')),
    });

    /**
     * Assign perms
     */
    fn.addToRolePolicy(policy);

    /**
     * What Events (Rule) to send to the above lambda
     * XXX: this is leaky, an api is coming
     */
    const rule = new events.Rule(this, 's3PublicRule', {
      description: 'Detect S3 Public Buckets and Remediate',
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['s3.amazonaws.com'],
          eventName: [
            'PutBucketAcl',
            'PutObjectAcl',
            'PutAccountPublicAccessBlock',
            'PutBucketPublicAccessBlock',
          ],
        },
      },
    });

    /**
     * Send them
     */
    rule.addTarget(new targets.LambdaFunction(fn));
  }
}
