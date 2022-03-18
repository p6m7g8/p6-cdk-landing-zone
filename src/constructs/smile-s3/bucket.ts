import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

import { SmileKms } from '../smile-kms';
import { SmileS3Log } from './logging';

/**
 * A Smile S3 Bucket
 * This needs to be its own Construct
 * XXX: Pass in SmileS3Log and SmileKms instances
 * Need a lot of config/ work here
 */
export class SmileS3 extends s3.Bucket {

  /**
   *
   * @param scope
   * @param id
   */
  constructor(scope: cdk.Construct, id: string) {
    /**
     * S3 Best Practices Centralized here
     * nine hundred twenty five thousand six hundred to add
     */
    super(scope, id, {
      serverAccessLogsBucket: SmileS3Log.getInstance(scope),
      encryptionKey: SmileKms.getInstance(scope).s3Default,
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
