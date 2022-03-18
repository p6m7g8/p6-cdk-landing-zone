import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';

import * as smile from '../../';

/**
 * Properties
 */
export interface SmileVpcProps {
  /**
   * A list of Vpcs that got made
   */
  vpcs: smile.ISmileVpc[];
}

/**
 * SmileVpc Object
 */
export class SmileVpc extends cdk.Resource {
  /**
   * Other classes/stack need to lookup the Vpcs
   */
  public vpcs: ec2.IVpc[];

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileVpcProps) {
    super(scope, id);

    /**
     * Initialize the Array
     * XXX: this is done better in the member variable above
     */
    this.vpcs = [];

    /**
     * For each Vpc in the config/network.vpcs
     */
    for (const theVpc of props.vpcs) {
      // ******************************** VPC *******************************
      const newVpc = new ec2.Vpc(this, theVpc.vpcName, {
        cidr: theVpc.cidr,
        maxAzs: theVpc.maxAzs,
      });
      this.vpcs.push(newVpc);

      // ******************************** VPC Flow Logs *********************
      if (theVpc.flowlogs) {
        newVpc.addFlowLog('FlowLog');
      }

      // ******************************** VPC Bastions **********************
      if (theVpc.bastion) {
        const host = new ec2.BastionHostLinux(this, 'BastionHost', {
          vpc: newVpc,
          subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
        });

        for (const sshCidr of theVpc.bastion.ssh) {
          host.allowSshAccessFrom(ec2.Peer.ipv4(sshCidr.cidr));
        }
      }

      // ******************************** VCP Endpoints *********************
      if (theVpc.endpoints) {
        if (theVpc.endpoints.gateway) {
          // *****> Gateways
          const gateways = theVpc.endpoints.gateway;
          for (const gateway of gateways) {
            const endPoint = gateway.name;
            new ec2.GatewayVpcEndpoint(this, 'Gateway' + endPoint, {
              service: new ec2.GatewayVpcEndpointAwsService(endPoint),
              vpc: newVpc,
            });
          }
        }
        if (theVpc.endpoints.interface) {
          // ****> Interface
          const interfaces = theVpc.endpoints.interface;
          for (const inf of interfaces) {
            const endPoint = inf.name;
            new ec2.InterfaceVpcEndpoint(this, 'Interface' + endPoint, {
              service: new ec2.InterfaceVpcEndpointAwsService(endPoint),
              vpc: newVpc,
            });
          }
        }
      }
    }
  }
}
