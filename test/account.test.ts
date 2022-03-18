import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

import * as smile from '../src/';

test('AccountStack runs', () => {
  // GIVEN
  const app = new cdk.App();
  // WHEN
  const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

  const smileAccountProps: smile.SmileAccountProps = new smile.SmileAccountProps(
    smileStackProps.env,
    smileStackProps.account,
  );
  const stack = new smile.SmileAccountStack(
    app,
    'TESTSmileAccountStack',
    smileAccountProps,
  );
  // THEN
  expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
});
