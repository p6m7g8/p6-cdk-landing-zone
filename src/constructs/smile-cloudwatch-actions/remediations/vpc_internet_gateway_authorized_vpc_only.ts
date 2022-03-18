import * as path from 'path';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

/**
 * Detach, Delete unknown Vpc Internet Gateways
 * This will prevent ALL new Vpcs from Attaching an IGW after the 1st SMILE run
 * in the account. This will need an allow list (using Tags) in the config or a DB
 */
export class SmileVpcInternetGatewayAuthorizedVpcOnly extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   */
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    /**
     * XXX: InfoSec review, we do not need ALL EC2 perms
     */
    const policy = new iam.PolicyStatement({
      actions: ['ec2:*'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });

    /**
     * The Lambda
     */
    const fn = new lambda.Function(this, 'vpcInternetGatewayAuthorizedVpcOnlyLambda', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../resources/lambda/VpcInternetGatewayAuthorizedVpcOnly'),
      ),
    });

    /**
     * Assign perms
     */
    fn.addToRolePolicy(policy);

    /**
     * What Events (Rule) to send to the above lambda
     * XXX: this is leaky, an api is coming
     */
    const rule = new events.Rule(this, 'vpcInternetGatewayAuthorizedVpcOnlyRule', {
      description: 'Detect unexpected Vpc Internet Gateways and remediates',
      eventPattern: {
        source: ['aws.ec2'],
        detail: {
          eventSource: ['ec2.amazonaws.com'],
          eventName: ['AttachInternetGateway'],
        },
      },
    });

    /**
     * Send them
     */
    rule.addTarget(new targets.LambdaFunction(fn));
  }
}
