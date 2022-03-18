import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

import * as smile from '../src';

test('AVMStack runs', () => {
  // GIVEN
  const app = new cdk.App();
  // WHEN
  const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

  const smileAccountStack = new smile.SmileAccountStack(
    app,
    'SmileTESTAccountStack',
    smileStackProps.account,
  );

  const smileNetworkStack = new smile.SmileNetworkStack(
    app,
    'SmileTESTNetworkStack',
    smileStackProps.network,
    smileAccountStack,
  );

  const stack = new smile.SmileAVMStack(
    app,
    'SmileTESTAVMStack',
    smileStackProps.network,
    smileAccountStack,
    smileNetworkStack,
    smileStackProps.account,
  );

  // THEN
  if (smileStackProps.network.vpcs[0].accountVendingMachine) {
    expectCDK(stack).to(
      haveResource('AWS::EKS::Nodegroup'),
    );
  }
});