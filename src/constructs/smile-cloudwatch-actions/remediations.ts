import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';

import * as smile from './remediations/';

/**
 * Where to send Alerts too when a remediation
 * finds something
 */
export interface SmileCloudWatchRemediationsProps {
  alertTopic: sns.ITopic;
}

/**
 * The Remediations
 */
export class SmileCloudWatchRemediations extends cdk.Construct {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(
    scope: cdk.Construct,
    id: string,
    props: SmileCloudWatchRemediationsProps,
  ) {
    super(scope, id);

    /**
     * Each of these should become its own 3rd Party Construct
     * As we make L1 -> L2 -> L3
     */

    /**
     * If a bucket is public, deal with it
     * https://github.com/trexsolutions/smile-cdk/blob/master/resources/lambda/S3Publicness/README.md
     */
    new smile.SmileS3Publicness(this, 'S3/Public');

    /**
     * Prevent tampering with the logging setup
     * https://github.com/trexsolutions/smile-cdk/blob/master/resources/lambda/S3ServerAccessLogging/README.md
     */
    new smile.SmileS3ServerAccessLogging(this, 'S3/Logging');

    /**
     * Prevent new IGWs, this needs some config work
     * https://github.com/trexsolutions/smile-cdk/blob/master/resources/lambda/S3ServerAccessLogging/README.md
     */
    new smile.SmileVpcInternetGatewayAuthorizedVpcOnly(this, 'Vpc/IGW');

    /**
     * If root does something, allowed or not, send us an e-mail
     * https://github.com/trexsolutions/smile-cdk/blob/master/resources/lambda/LoginRoot/README.md
     */
    new smile.SmileLoginRoot(this, 'Login/Root', {
      alertTopic: props.alertTopic,
    });
  }
}
