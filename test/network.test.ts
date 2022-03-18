import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

import * as smile from '../src';

test('NetworkStack runs', () => {
  // GIVEN
  const app = new cdk.App();
  // WHEN
  const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

  const smileAccountStack = new smile.SmileAccountStack(
    app,
    'SmileTESTAccountStack',
    smileStackProps.account,
  );

  const stack = new smile.SmileNetworkStack(
    app,
    'SmileTESTNetworkStack',
    smileStackProps.network,
    smileAccountStack,
  );

  expectCDK(stack).to(
    haveResource('AWS::EC2::Instance', {
      Tags: [{ Key: 'Name', Value: 'BastionHost' }],
    }),
  );

  if (smileStackProps.network.vpcs[0].transitGw) {
    // THEN
    expectCDK(stack).to(
      haveResource('AWS::EC2::TransitGateway'),
    );
  }
});
