import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import { SmileGroup } from '../../types/accountprops';

export interface ISmileIamProps {
  groups: SmileGroup[];
}

export class SmileIam extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   */
  constructor(scope: cdk.Construct, id: string, props: ISmileIamProps) {
    super(scope, id);

    for (const group of props.groups) {
      const path: string = `/Smile/Groups/${group.name}`;
      const g = new iam.Group(this, path, {
        groupName: group.name,
      });
      for (const policy of group.policies) {
        g.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(policy));
      }
    }
  }
}