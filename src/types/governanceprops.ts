import { SnsSubscription } from './accountprops';
import { SmileEnv } from './envprops';

/**
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dlm-lifecyclepolicy-policydetails.html
 */
export type SmileDlmPolicy = number;

/**
 * The Smile (Governance) Stack Properties
 * This needs a lot of additions
 */
export interface ISmileGovernanceProps {

  /**
   * List of Subscription E-mail addresses
   */
  snsSubscriptions: SnsSubscription[];

  /**
   * List of Dlm Policies
   */
  dlmPolicies: SmileDlmPolicy[];

  /**
   * Optional AwsEnvironment info
   * @default undefined
   */
  env: SmileEnv;
}

/**
 * The Smile Governance Properties loaded from YAML Config
 * They are now strongly typed instead of `any`
 */
export class SmileGovernanceProps implements ISmileGovernanceProps {
  public snsSubscriptions: SnsSubscription[];
  public dlmPolicies: SmileDlmPolicy[];
  public env: SmileEnv;

  /**
   *
   * @param env
   * @param request
   */
  constructor(env: SmileEnv, request: any) {
    this.snsSubscriptions = request.snsSubscriptions;
    this.dlmPolicies = request.dlmPolicies;
    this.env = env;
  }
}
