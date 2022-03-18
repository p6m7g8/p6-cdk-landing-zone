import * as cloudtrail from '@aws-cdk/aws-cloudtrail';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { SmileS3 } from './../smile-s3/bucket';

/**
 * This will not be empty for long
 */
export interface SmileTrailProps {}

export class SmileTrail extends cdk.Resource {

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props?: SmileTrailProps) {
    super(scope, id, props);

    /**
     * cloudTrail.Trail will do this but no for 1yr or configurable eventually
     * We need this for compliance reasons
     * This should become its own Construct
     */
    const cloudWatchLogGroup = new logs.LogGroup(this, 'LogGroup', {
      retention: logs.RetentionDays.ONE_YEAR,
    });

    /**
     * Setup CloudTrail and log it to S3 and CloudWatch
     * The S3 Bucket is a Smile Bucket, if we didn't do that
     * the bucket would be public and not encrypted
     */
    const trail = new cloudtrail.Trail(this, 'Main', {
      bucket: new SmileS3(this, 'Central'),
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup,
    });

    /**
     * This needs to become configurable
     * These are not cheap. But you really don't want to not have these
     * if you are doing Proactive Event Driven Security Threat hunting
     */
    trail.logAllS3DataEvents();
    trail.logAllLambdaDataEvents();
  }
}
