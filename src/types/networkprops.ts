import { SnsSubscription } from './accountprops';
import { SmileEnv } from './envprops';

/**
 * What to Tag the VPC ass
 */
export type SmileVpcName = string;

/**
 * What CIDR to give the VPC
 */
export type SmileVpcCidr = string;

/**
 * How many AZs
 */
export type SmileVpcMaxAzs = number;

/**
 * Whether to put an Smile EKS Cluster in this VPC
 */
export type SmileVpcEks = boolean;

/**
 * Whether to turn on Vpc Flow logs
 */
export type SmileVpcFlowLogs = boolean;

/**
 * Whether to put an Ec2ImageBuilder in this Vpc
 */
export type SmileAmiPipeline = boolean;

/**
 * Whether to put the Account Vending Machine in this Vpc
 */
export type SmileAccountVendingMachine = boolean;

/**
 * Whether to create a transit GW in this account
 */
export type SmileTransitGateway = boolean;

/**
 * What CIDRs can SSH to the Bastion Host in this Vpc
 */
export interface SmileVpcBastionCidr {
  cidr: SmileVpcCidr;
}

/**
 * Container for the Bastion CIDRs
 */
export interface SmileVpcBastion {
  ssh: SmileVpcBastionCidr[];
}

/**
 * A Vpc Endpoint Service name
 * XXX: This should be an emum
 */
export interface SmileVpcEndPointService {
  name: string;
}

/**
 * There are two types of Endpoints
 * Provide a container for lists of each
 */
export interface SmileVpcEndpoint {
  gateway: SmileVpcEndPointService[];
  interface: SmileVpcEndPointService[];
}

/**
 * The YAML config interface for Vpcs
 */
export interface ISmileVpc {
  vpcName: SmileVpcName;
  cidr: SmileVpcCidr;
  maxAzs: SmileVpcMaxAzs;
  amiPipeline?: SmileAmiPipeline;
  accountVendingMachine?: SmileAccountVendingMachine;
  eks?: SmileVpcEks;
  flowlogs?: SmileVpcFlowLogs;
  bastion?: SmileVpcBastion;
  endpoints?: SmileVpcEndpoint;
  transitGw: SmileTransitGateway;
}

/**
 * The Smile (Network) Stack Properties
 * This needs a lot of additions
 */
export interface ISmileNetworkProps {

  /**
   * List of Subscription E-mail addresses
   */
  snsSubscriptions: SnsSubscription[];

  /**
   * Optional AwsEnvironment info
   * @default undefined
   */
  env: SmileEnv;

  /**
   * The Vpc Configs, a list
   * The config defaults to 1 Vpc per Account
   * Not sure how to say that with an @ default
   */
  vpcs: ISmileVpc[];
}

/**
 * The Smile Network Properties loaded from YAML Config
 * They are now strongly typed instead of `any`
 */
export class SmileNetworkProps implements ISmileNetworkProps {
  public snsSubscriptions: SnsSubscription[];
  public env: SmileEnv;
  public vpcs: ISmileVpc[];

  /**
   *
   * @param env
   * @param request
   */
  constructor(env: SmileEnv, request: any) {
    this.snsSubscriptions = request.snsSubscriptions;
    this.env = env;
    this.vpcs = request.vpcs;
  }
}
