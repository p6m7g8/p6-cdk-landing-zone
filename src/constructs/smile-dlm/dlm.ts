import * as dlm from '@aws-cdk/aws-dlm';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import * as smile from '../../';

/**
 * Properties
 */
export interface SmileDlmProps {
  /**
   * List of DLM Policies
   */
  dlmPolicies: smile.SmileDlmPolicy[];
}

export class SmileDlm extends cdk.Resource {

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileDlmProps) {
    super(scope, id);

    /**
     * XXX: I think this can go away as its a service-linked-role
     * XXX: Well know bugs
     * XXX: bin/smilectl takes care of this now
     * https://github.com/aws/aws-cdk/issues/4468
     */
    const dlmRole = new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal('dlm.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSDataLifecycleManagerServiceRole',
        ),
      ],
    });

    /**
     * Loop over policies
     */
    for (const policy of props.dlmPolicies) {
      /**
       * How many to keep?
       */
      const rRule: dlm.CfnLifecyclePolicy.RetainRuleProperty = {
        count: policy,
      };

      /**
       * How frequently to make backups
       * XXX: needs to come from config
       */
      const cRule: dlm.CfnLifecyclePolicy.CreateRuleProperty = {
        interval: 24,
        intervalUnit: 'HOURS',
      };

      /**
       * Uses AWS Tag Macros $() which are evaluated by AWS at run-time outside of SMILE
       */
      const instanceTag = new cdk.Tag('instance-id', '$(instance-id)');
      const timestampTag = new cdk.Tag('timestamp', '$(timestamp)');

      /**
       * The Schedule Container
       */
      const dlmDailySchedule: dlm.CfnLifecyclePolicy.ScheduleProperty = {
        name: 'Daily',
        createRule: cRule,
        retainRule: rRule,
        variableTags: [instanceTag, timestampTag],
        copyTags: true,
      };

      /**
       * Point it at EC2
       */
      const targetTag = new cdk.Tag('Backup', 'Daily' + policy);
      const thePolicyDetails: dlm.CfnLifecyclePolicy.PolicyDetailsProperty = {
        schedules: [dlmDailySchedule],
        targetTags: [targetTag],
        resourceTypes: ['INSTANCE'],
      };

      /**
       * How many days to retain
       */
      const dlmProps: dlm.CfnLifecyclePolicyProps = {
        description: 'Daily ' + policy + ' Day Retention',
        state: 'ENABLED',
        policyDetails: thePolicyDetails,
        executionRoleArn: dlmRole.roleArn,
      };

      /**
       * The shebang
       */
      new dlm.CfnLifecyclePolicy(this, 'Policy' + policy, dlmProps);
    }
  }
}
