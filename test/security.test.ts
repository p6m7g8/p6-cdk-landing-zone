import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';

import * as smile from '../src';

test('SecurityStack runs', () => {
  // GIVEN
  const app = new cdk.App();
  // WHEN
  const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

  const smileAccountStack = new smile.SmileAccountStack(
    app,
    'SmileAccountStack',
    smileStackProps.account,
  );
  const smileSecurityProps: smile.SmileSecurityProps = new smile.SmileSecurityProps(
    smileStackProps.env,
    smileStackProps.security,
  );

  const stack = new smile.SmileSecurityStack(
    app,
    'TESTSmileSecurityStack',
    smileSecurityProps,
    smileAccountStack,
  );
  // THEN
  expectCDK(stack).to(haveResource('AWS::Config::ConfigRule'));
});
