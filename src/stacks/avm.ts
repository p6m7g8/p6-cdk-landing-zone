import * as config from '@aws-cdk/aws-config';
import * as targets from '@aws-cdk/aws-events-targets';
import * as cdk from '@aws-cdk/core';

import * as smile from '../';
import { SmileAVM } from '../constructs/smile-avm/avm';

/**
 * The Smile AVM Stack
 */
export class SmileAVMStack extends cdk.Stack {
  public constructor(
    scope: cdk.Construct,
    id: string,
    props: smile.SmileNetworkProps,
    accountStack: smile.SmileAccountStack,
    networkStack: smile.SmileNetworkStack,
    accountProps: smile.SmileAccountProps,
  ) {
    super(scope, id, props);

    /**
     * If the Account Vending Machine is on for this Vpc
     * Make it
     */
    if (props.vpcs[0].accountVendingMachine) {
      new SmileAVM(this, 'Smile/AVM', {
        vpc: networkStack.smileVpc.vpcs[0],
        tld: accountProps.tld,
        capacity: props.vpcs[0].maxAzs,
      });
    }

    /**
     * Stack Event Notifications
     * Messages go to the Network Topic
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
     * Alerts go to Network Topic
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
