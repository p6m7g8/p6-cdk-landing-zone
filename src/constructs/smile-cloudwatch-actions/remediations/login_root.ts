import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';

/**
 * Properties
 */
export interface SmileRootLoginProps {
  /**
   * SNS Topic to send alerts to
   */
  alertTopic: sns.ITopic;
}

/**
 * Root Login Remediation Construct
 * https://github.com/trexsolutions/smile-cdk/blob/master/resources/lambda/LoginRoot/README.md
 */
export class SmileLoginRoot extends cdk.Construct {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileRootLoginProps) {
    super(scope, id);

    /**
     * The account lookup has to be runtime not deploytime
     * or we will force an account context hence iam:ListAccountAliases
     * The lambda needs to be able to send the alert to SNS
     */
    const policy = new iam.PolicyStatement({
      actions: ['sns:Publish', 'iam:ListAccountAliases'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });

    /**
     * The Lambda
     */
    const fn = new lambda.Function(this, 'loginRoot', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../resources/lambda/LoginRoot'),
      ),
    });

    /**
     * Pass the SNS Topic Arn in as an Environment Variable
     */
    fn.addEnvironment('SNSARN', props.alertTopic.topicArn);

    /**
     * Assign perms
     */
    fn.addToRolePolicy(policy);

    /**
     * What Events (Rule) to send to the above lambda
     * XXX: this is leaky, an api is coming
     */
    const rule = new events.Rule(this, 'LoginRoot', {
      description: 'Detect Root Logins and Alert',
      eventPattern: {
        detailType: [
          'AWS Console Sign In via CloudTrail',
          'AWS API Call via CloudTrail',
        ],
        detail: {
          userIdentity: {
            type: [
              'Root',
            ],
          },
        },
      },
    });

    /**
     * Send them
     */
    rule.addTarget(new targets.LambdaFunction(fn));
  }
}
