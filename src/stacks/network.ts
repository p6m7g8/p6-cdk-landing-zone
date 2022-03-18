import * as config from '@aws-cdk/aws-config';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as targets from '@aws-cdk/aws-events-targets';
import * as cdk from '@aws-cdk/core';

import * as smile from '../';
import { SmileCICDAmiGolden } from '../constructs/smile-devlib/ami';
import { SmileVpc } from '../constructs/smile-ec2/vpc';

/**
 * The Smile Governance Stack
 */
export class SmileNetworkStack extends cdk.Stack {
  /**
   * The Vpcs Managed by SMILE
   */
  public smileVpc: SmileVpc;

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
    props: smile.SmileNetworkProps,
    accountStack: smile.SmileAccountStack,
  ) {
    super(scope, id, props);

    /**
     * Make the Vpcs based on the Config
     * This could be 0, 1, or N
     */
    this.smileVpc = new SmileVpc(this, 'Smile/Vpc', {
      vpcs: props.vpcs,
    });

    if (props.vpcs[0].transitGw) {
      new ec2.CfnTransitGateway(this, 'Smile/TGW', {
        autoAcceptSharedAttachments: 'enable',
        defaultRouteTableAssociation: 'enable',
        defaultRouteTablePropagation: 'enable',
        dnsSupport: 'enable',
        vpnEcmpSupport: 'enable',
      });
    }

    /**
     * If GoldenAmi (ec2ImageBuilder) is on for this Vpc
     * Make it
     */
    if (props.vpcs[0].amiPipeline) {
      new SmileCICDAmiGolden(this, 'SmileCICDAmi', {
        vpc: this.smileVpc.vpcs[0],
        topic: accountStack.networkTopic,
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
