import * as config from '@aws-cdk/aws-config';
import * as targets from '@aws-cdk/aws-events-targets';
import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';

import { P6Namer } from 'p6-namer';

import { SmileConfig } from '../constructs/smile-config/deps';
import { SmileIam } from '../constructs/smile-iam/groups';
import {
  SmileSNSAccountTopic,
  SmileSNSGovernanceTopic,
  SmileSNSSecurityTopic,
  SmileSNSNetworkTopic,
} from '../constructs/smile-sns/topic';
import { SmileAccountProps } from '../types/accountprops';

/**
 * The Smile Account Stack
 * This must be run first in an AwsEnvironment (SmileEnv)
 * The AWS Config Recorder is in here which must be a Singleton
 * https://github.com/aws/aws-cdk/issues/3492
 */
export class SmileAccountStack extends cdk.Stack {
  /**
   * The SNS Topic for the Network Stack
   */
  public networkTopic: sns.ITopic;

  /**
   * The SNS Topic for the Governance Stack
   */
  public governanceTopic: sns.ITopic;

  public constructor(
    scope: cdk.Construct,
    id: string,
    props: SmileAccountProps,
  ) {
    super(scope, id, props);

    /**
     * L3 Third Party Construct to set the
     * IAM Account Alias which is pulled from the yaml config
     * account.alias
     */
    new P6Namer(this, 'p6-namer', {
      accountAlias: props.alias,
    });

    /**
     * Setups of AWS Config
     * The AWS Config Recorder is in here which must be a Singleton
     * https://github.com/aws/aws-cdk/issues/3492
     * This will need a lookup to work in brownfield
     */
    const smileConfig = new SmileConfig(this, 'Smile/Config');

    /**
     * The 4 SNS Topics, 1 per Stack
     * The Account One can't be used until its made
     * The cdk deploy for Account will run 2x b/c of this
     * So that we can setup drift detection
     * This is a bug in CloudFormation and a Gap in AWS-CDK
     */
    new SmileSNSAccountTopic(this, 'Smile/SNS/Account', {
      snsSubscriptions: props.snsSubscriptions,
    });

    this.governanceTopic = new SmileSNSGovernanceTopic(
      this,
      'Smile/SNS/Governance',
      {
        snsSubscriptions: props.snsSubscriptions,
      },
    ).topic;

    new SmileSNSSecurityTopic(this, 'Smile/SNS/Security', {
      snsSubscriptions: props.snsSubscriptions,
    });

    this.networkTopic = new SmileSNSNetworkTopic(this, 'Smile/SNS/Network', {
      snsSubscriptions: props.snsSubscriptions,
    }).topic;

    /**
     * Setup IAM for the account
     * XXX: This is global, but we're in a regional context here
     */
    new SmileIam(this, 'Smile/IAM', {
      groups: props.groups,
    });

    /**
     * Stack Event Notifications
     * The Config Recorder must finish creating first hence the dependency
     * Messages go to the Governance Topic
     */
    new config.CloudFormationStackNotificationCheck(
      this,
      'Smile/Config/StackNotification',
      {
        topics: [this.governanceTopic],
      },
    ).node.addDependency(smileConfig);

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
    driftRule.node.addDependency(smileConfig);
    driftRule.onComplianceChange('Smile/Config/StackComplianceChange', {
      target: new targets.SnsTopic(this.governanceTopic),
    });
  }
}
