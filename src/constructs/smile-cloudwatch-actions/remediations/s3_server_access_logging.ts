import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

import * as smileS3 from '../../smile-s3';


/**
 * Prevent tampering with the ServerAccessLogging
 */
export class SmileS3ServerAccessLogging extends cdk.Resource {
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
    const fn = new lambda.Function(this, 'S3ServerAccessLogging', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(
        path.join(
          __dirname,
          '../../../../resources/lambda/S3ServerAccessLogging',
        ),
      ),
    });

    /**
     * Pass the Central logging bucket as an Environment Variable
     */
    fn.addEnvironment(
      'LOGBUCKET',
      smileS3.SmileS3Log.getInstance(this).bucketName,
    );
    /**
     * Assign perms
     */
    fn.addToRolePolicy(policy);

    /**
     * What Events (Rule) to send to the above lambda
     * XXX: this is leaky, an api is coming
     */
    const rule = new events.Rule(this, 's3PublicRule', {
      description:
        'Detect S3 Buckets without ServerAccessLogging and Remediate',
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['s3.amazonaws.com'],
          eventName: ['PutBucketLogging'],
        },
      },
    });

    /**
     * Send them
     */
    rule.addTarget(new targets.LambdaFunction(fn));
  }
}
