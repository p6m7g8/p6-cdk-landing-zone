
/**
 * XXX: this should pull AwsEnvironment
 * from projen
 * https://github.com/projen/projen/blob/197fad9ec4dd3ffcee49d727ae9d0471a4752391/src/awscdk/aws-environment.ts
 */

/**
 * The AWS Account ID
 */
export type SmileAccount = string;

/**
 * The AWS Region
 * XXX: This should be an enum for validation
 * https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_region-info.RegionInfo.html
 */
export type SmileRegion = string;

/**
 * The AwsEnvironment Container
 */
export type SmileEnv = {
  account?: SmileAccount;
  region?: SmileRegion;
};
