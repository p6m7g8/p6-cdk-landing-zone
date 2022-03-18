import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { SmileKms } from '../smile-kms';

/**
 * The Smile S3 Central Log Bucket as a singleton
 */
export class SmileS3Log extends s3.Bucket {
  /**
   *
   * @param scope
   */
  public static getInstance(scope: cdk.Construct): SmileS3Log {
    if (!SmileS3Log.instance) {
      SmileS3Log.instance = new SmileS3Log(scope, 'Smile/S3/Logging');
    }

    return SmileS3Log.instance;
  }

  /**
   * The singleton instance
   */
  private static instance: SmileS3Log;

  /**
   *
   * @param scope
   * @param id
   */
  private constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    /**
     * XXX: this duplicates A ton from SmileS3Bucket to avoid
     * XXX: a cyclic log loop and use a different encryption key
     * XXX: compliance required they be different keys
     * XXX: this is fixable with OOP
     */
    new s3.Bucket(this, id, {
      encryptionKey: SmileKms.getInstance(scope).s3Logging,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(365),
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
    });
  }
}
