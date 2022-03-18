import * as kms from '@aws-cdk/aws-kms';
import * as cdk from '@aws-cdk/core';

/**
 * Central KMS Keys here
 * These are a singleton to avoid the .node.tryChild.find crap
 */
export class SmileKms extends cdk.Construct {
  /**
   *
   * Singleton is returned or created and returned
   * @param scope
   */
  public static getInstance(scope: cdk.Construct): SmileKms {
    if (!SmileKms.instance) {
      SmileKms.instance = new SmileKms(scope, 'Smile/Kms');
    }

    return SmileKms.instance;
  }

  /**
   * The Singleton instance
   */
  private static instance: SmileKms;

  /**
   * The keys (those listed are in use), the others are planned
   */
  public readonly s3Default: kms.Key;
  public readonly s3CloudTrail: kms.Key;
  public readonly s3Logging: kms.Key;
  public readonly ebsDefault: kms.Key;
  public readonly dynamoDefault: kms.Key;
  public readonly imagebuilderDefault: kms.Key;
  public readonly eksDefault: kms.Key;

  /**
   *
   * @param scope
   * @param id
   */
  private constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.s3Default = new kms.Key(this, 'S3/Default', {
      description: 'Key used for S3 buckets',
      enableKeyRotation: true,
      alias: 'smile/s3/default',
    });
    this.s3CloudTrail = new kms.Key(this, 'S3/CloudTrail', {
      description: 'Key used for S3 Cloud Trail buckets',
      enableKeyRotation: true,
      alias: 'smile/s3/cloudtrail',
    });
    this.s3Logging = new kms.Key(this, 'S3/Logging', {
      description: 'Key used for S3 Logging buckets',
      enableKeyRotation: true,
      alias: 'smile/s3/logging',
    });
    this.ebsDefault = new kms.Key(this, 'Ebs/default', {
      description: 'Key used for Ebs',
      enableKeyRotation: true,
      alias: 'smile/ebs/default',
    });
    this.dynamoDefault = new kms.Key(this, 'Dynamo/default', {
      description: 'Key used for Ebs',
      enableKeyRotation: true,
      alias: 'smile/dynamo/default',
    });
    this.imagebuilderDefault = new kms.Key(this, 'ImageBuilder/default', {
      description: 'Key used for ImageBuilder AMIs',
      enableKeyRotation: true,
      alias: 'smile/imagebuilder/default',
    });
    this.eksDefault = new kms.Key(this, 'Eks/default', {
      description: 'Key used for envelope encryption of Kubernetes secrets',
      enableKeyRotation: true,
      alias: 'smile/eks/default',
    });
  }
}
