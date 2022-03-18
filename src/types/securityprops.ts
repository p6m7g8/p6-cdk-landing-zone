import { SnsSubscription } from './accountprops';
import { SmileEnv } from './envprops';

/**
 * The Smile (Security) Stack Properties
 * This needs a lot of additions
 */
export interface ISmileSecurityProps {

  /**
   * Optional AwsEnvironment info
   * @default undefined
   */
  env: SmileEnv;

  /**
   * List of Subscription E-mail addresses
   */
  snsSubscriptions: SnsSubscription[];

  /**
   * Your root, admin, SysOps, oh-shit go here
   * List of Subscription E-mail addresses
   */
  alertSubscriptions: SnsSubscription[];
}

/**
 * The Smile Security Properties loaded from YAML Config
 * They are now strongly typed instead of `any`
 */
export class SmileSecurityProps implements ISmileSecurityProps {
  public snsSubscriptions: SnsSubscription[];
  public alertSubscriptions: SnsSubscription[];
  public env: SmileEnv;

  /**
   *
   * @param env
   * @param request
   */
  constructor(env: SmileEnv, request: any) {
    this.snsSubscriptions = request.snsSubscriptions;
    this.alertSubscriptions = request.alertSubscriptions;
    this.env = env;
  }
}
