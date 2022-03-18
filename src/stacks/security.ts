import * as config from '@aws-cdk/aws-config';
import * as targets from '@aws-cdk/aws-events-targets';
import * as cdk from '@aws-cdk/core';

import { SmileCloudWatchRemediations } from '../constructs/smile-cloudwatch-actions';
import { SmileS3 } from '../constructs/smile-s3';
import { SmileSNSAlertTopic } from '../constructs/smile-sns';
import { SmileSecurityProps } from '../types/securityprops';
import { SmileAccountStack } from './account';

/**
 * The Smile Governance Stack
 */
export class SmileSecurityStack extends cdk.Stack {
  /**
   *
   * @param scope
   * @param id
   * @param props
   * @param accountStack
   */
  public constructor(
    scope: cdk.Construct,
    id: string,
    props: SmileSecurityProps,
    accountStack: SmileAccountStack,
  ) {
    super(scope, id, props);

    /**
     * A Smile S3 Bucket (aka with Best Practices on)
     */
    new SmileS3(this, 'Smile/S3');

    /**
     * XXX: Move me to the Account Stack
     * Makes the SNS Alert Topic
     */
    const topic = new SmileSNSAlertTopic(this, 'Smile/SNS/Alert', {
      snsSubscriptions: props.alertSubscriptions,
    }).topic;

    /**
     * This deploys our Near Real-Time, Event-Driven Remediations
     * Alerts go to the alertTopic (above)
     */
    new SmileCloudWatchRemediations(this, 'Smile/CloudWatch/Remediations', {
      alertTopic: topic,
    });

    /**
     * Stack Event Notifications
     * Messages go to the Governance Topic
     */
    new config.CloudFormationStackNotificationCheck(
      this,
      'Smile/Config/StackNotification',
      {
        topics: [accountStack.governanceTopic],
      },
    );

    /**
     * Drift Detection. NOT all resource types are supported
     * If they were, AWS Config would be less useful
     * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resource-import-supported-resources.html
     * Alerts go to Governance Topic
     */
    const driftRule = new config.CloudFormationStackDriftDetectionCheck(
      this,
      'Smile/Config/StackDrift',
    );
    driftRule.onComplianceChange('Smile/Config/StackComplianceChange', {
      target: new targets.SnsTopic(accountStack.governanceTopic),
    });
  }
}
