import * as config from '@aws-cdk/aws-config';
import * as targets from '@aws-cdk/aws-events-targets';
import * as cdk from '@aws-cdk/core';

import * as smile from '../';
import { SmileTrail } from '../constructs/smile-cloudtrail/trail';
import { SmileConfigPack } from '../constructs/smile-config-actions/pack';
import { SmileDlm } from '../constructs/smile-dlm/dlm';

/**
 * The Smile Governance Stack
 */
export class SmileGovernanceStack extends cdk.Stack {
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
    props: smile.SmileGovernanceProps,
    accountStack: smile.SmileAccountStack,
  ) {
    super(scope, id, props);

    /**
     * Setups up Cloud Trail (for *this account*)
     * Landing Zone Cloud Trail will be another Construct
     */
    new SmileTrail(this, 'Smile/Trail');

    /**
     * Configures Data Life Cycle Manager
     * https://docs.aws.amazon.com/dlm/latest/APIReference/Welcome.html
     */
    new SmileDlm(this, 'Smile/Dlm', {
      dlmPolicies: props.dlmPolicies,
    });

    /**
     * Deploys our Config Pack
     * https://docs.aws.amazon.com/config/latest/developerguide/conformancepack-sample-templates.html
     */
    new SmileConfigPack(this, 'Smile/ConfigRules');

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
