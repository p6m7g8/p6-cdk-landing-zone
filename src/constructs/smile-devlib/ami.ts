import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';

import * as SmileS3 from '../smile-s3';

/**
 * Properties
 */
export interface SmileCICDAmiGoldenProps extends cdk.ResourceProps {
  /**
   * What Vpc to Build in
   */
  vpc: ec2.IVpc;

  /**
   * What topic to send messages too
   */
  topic: sns.ITopic;
}

/**
 * The AMI Builder
 */
export class SmileCICDAmiGolden extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(
    scope: cdk.Construct,
    id: string,
    props: SmileCICDAmiGoldenProps,
  ) {
    super(scope, id, props);

    /**
     * Deploy a Lambda to tell us the Newest AMI Linux 2 AMI
     */
    this.amiAmz2Latest();

    /**
     * The ec2ImageBuilder
     */
    this.amiGoldenBuilder(props);
  }

  private amiGoldenBuilder(props: SmileCICDAmiGoldenProps) {
    // XXX: CFT has published the L1s and they are in CDK as of well before 11/21/2020
    // XXX: Region is hard coded
    const recipe = new cdk.CfnResource(this, 'GoldenAmi', {
      type: 'AWS::ImageBuilder::ImageRecipe',
      properties: {
        Name: 'Smile Amazon2 Linux Golden',
        Description:
          'Smile: Base AMI - CIS, FedRamp High, Medium, Low Stig, AWS Chrony',
        Version: '2020.05.27',
        Components: [
          {
            ComponentArn:
              'arn:aws:imagebuilder:us-east-1:aws:component/update-linux/1.0.0/1',
          },
          {
            ComponentArn:
              'arn:aws:imagebuilder:us-east-1:aws:component/stig-build-linux-high/2.6.0/1',
          },
        ],
        ParentImage:
          'arn:aws:imagebuilder:us-east-1:aws:image/amazon-linux-2-x86/2020.5.27',
      },
    });

    const sg = new ec2.SecurityGroup(this, 'ImageBuilder', {
      vpc: props.vpc,
      description: 'For EC2 Image Builder Infrastructure',
      allowAllOutbound: true,
    });
    sg.addIngressRule(sg, ec2.Port.allTraffic(), 'Traffic to myself');

    /**
     * XXX: SmileIB is a boggie, it needs to be made by Smile
     * XXX: The InstanceProfileName may be more friendly now that the L1 is here
     * XXX: Add CloudWatch Logging which released AFTER this was written
     */
    const ic = new cdk.CfnResource(this, 'GoldenAmiIC', {
      type: 'AWS::ImageBuilder::InfrastructureConfiguration',
      properties: {
        Name: 'Smile Amazon2 Linux Golden IC',
        Description: 'Golden AMI IC',
        InstanceProfileName: 'SmileIB',
        Logging: { S3Logs: { S3BucketName: SmileS3.SmileS3Log.getInstance(this).bucketName } },
        SecurityGroupIds: [sg.securityGroupId],
        SubnetId: props.vpc.publicSubnets[0].subnetId,
        TerminateInstanceOnFailure: 'true',
        SnsTopicArn: props.topic.topicArn,
      },
    });

    /**
     * Regions are hard coded
     */
    const dc = new cdk.CfnResource(this, 'GoldenAmiDC', {
      type: 'AWS::ImageBuilder::DistributionConfiguration',
      properties: {
        Name: 'Smile Amazon2 Linux Golden DC',
        Description:
          'Smile: Base AMI - CIS, FedRamp High, Medium, Low Stig, AWS Chrony ',
        Distributions: [
          {
            AmiDistributionConfiguration: {
              Name: 'Smile Amazon2 Linux Golden {{ imagebuilder:buildDate }}',
            },
            Region: 'us-east-1',
          },
          {
            AmiDistributionConfiguration: {
              Name: 'Smile Amazon2 Linux Golden {{ imagebuilder:buildDate }}',
            },
            Region: 'us-east-2',
          },
          {
            AmiDistributionConfiguration: {
              Name: 'Smile Amazon2 Linux Golden {{ imagebuilder:buildDate }}',
            },
            Region: 'us-west-1',
          },
          {
            AmiDistributionConfiguration: {
              Name: 'Smile Amazon2 Linux Golden {{ imagebuilder:buildDate }}',
            },
            Region: 'us-west-2',
          },
        ],
      },
    });

    /**
     * This is the Pipeline (the whole package)
     */
    new cdk.CfnResource(this, 'GoldenAMIPipeline', {
      type: 'AWS::ImageBuilder::ImagePipeline',
      properties: {
        Name: 'Smile Amazon2 Linux Golden Pipeline',
        Description: 'Golden AMI Pipeline',
        InfrastructureConfigurationArn: ic.ref,
        DistributionConfigurationArn: dc.ref,
        ImageRecipeArn: recipe.ref,
        ImageTestsConfiguration: {
          ImageTestsEnabled: true,
          TimeoutMinutes: '60',
        },
        Status: 'ENABLED',
      },
    });
  }

  private amiAmz2Latest() {
    /**
     * Need to be able to describe amis
     */
    const policy = new iam.PolicyStatement({
      actions: ['ec2:DescribeImages'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    });

    /**
     * The Lambda
     */
    const fn = new lambda.Function(this, 'AmiAmnz2Latest', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(2),
      tracing: lambda.Tracing.ACTIVE,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../resources/lambda/amiAmnz2Latest'),
      ),
    });

    /**
     * Assign perms
     */
    fn.addToRolePolicy(policy);
  }
}
