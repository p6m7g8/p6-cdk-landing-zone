import { SmileEnv } from './envprops';

/**
 * This is the Strong Typing for the account.yml Configs
 */

/**
 * the IAM Account Alias Name
 */
export type AccountAlias = string;

/**
 * An E-mail to subscribe to the SNS (Account) Topic
 */
export type SnsSubscription = string;

/**
 * The E-mail used for the new account added to the org
 * This must never have been used in the AWS Partition before
 * Existing accounts must use the current setting
 * This is changeable in the Console post facto
 */
export type OrgEmail = string;

/**
 * I.e. trexcoe.com
 */
export type TldName = string;

/**
 * XXX: Replace me with Route53.HostedZone?
 * The Route53 Zone ID
 */
export type TldId = string;

/**
 * Flag
 */
export type OrgAccountProvisioningEnabled = boolean;

/**
 * IAM Group Name
 */
export type GroupName = string;

/**
 * IAM Policy Name
 */
export type PolicyName = string;

export type SmileGroup = {
  name: GroupName;
  policies: PolicyName[];
}

/**
 * Package up the Name and Id
 */
export interface ISmileTld {
  name: TldName;
  id: TldId;
}

/**
 * Maps the full account.yml setup
 */
export interface ISmileAccountProps {
  /**
   * The IAM Account Alias
   */
  alias: AccountAlias;

  /**
   * List of Subscription E-mail addresses
   */
  snsSubscriptions: SnsSubscription[];

  /**
   * Whether to run the provisioner in this account
   */
  orgAccountProvisioningEnabled: OrgAccountProvisioningEnabled;

  /**
   * The Organization Account root E-mail
   */
  orgEmail: OrgEmail;

  /**
   * The DNS information
   */
  tld: ISmileTld;

  /**
   * List of IAM Groups to Make
   * XXX: Temp until IdP w/ Okta
   */
  groups: SmileGroup[];

  /**
   * Optional AwsEnvironment info
   * @default undefined
   */
  env?: SmileEnv;
}

/**
 * The Smile Account Properties loaded from YAML Config
 * They are now strongly typed instead of `any`
 */
export class SmileAccountProps implements ISmileAccountProps {
  public alias: AccountAlias;
  public snsSubscriptions: SnsSubscription[];
  public orgAccountProvisioningEnabled: OrgAccountProvisioningEnabled;
  public orgEmail: OrgEmail;
  public tld: ISmileTld;
  public groups: SmileGroup[];
  public env: SmileEnv;

  /**
   *
   * @param env
   * @param request
   */
  constructor(env: SmileEnv, request: any) {
    this.alias = request.alias;
    this.snsSubscriptions = request.snsSubscriptions;
    this.orgAccountProvisioningEnabled = request.orgAccountProvisioningEnabled;
    this.orgEmail = request.orgEmail;
    this.tld = request.tld;
    this.groups = request.groups;
    this.env = env;
  }
}
