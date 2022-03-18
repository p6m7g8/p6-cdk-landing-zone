import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

import * as smile from '../src';

test('GovernanceStack runs', () => {
  // GIVEN
  const app = new cdk.App();
  // WHEN
  const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

  const smileAccountStack = new smile.SmileAccountStack(
    app,
    'SmileAccountStack',
    smileStackProps.account,
  );

  const smileGovernanceProps: smile.SmileGovernanceProps = new smile.SmileGovernanceProps(
    smileStackProps.env,
    smileStackProps.governance,
  );
  const stack = new smile.SmileGovernanceStack(
    app,
    'TESTSmileGovernanceStack',
    smileGovernanceProps,
    smileAccountStack,
  );
  // THEN
  expectCDK(stack).to(haveResource('AWS::CloudTrail::Trail'));
});
