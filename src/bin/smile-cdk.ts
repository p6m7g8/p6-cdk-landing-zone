#!/usr/bin/env node

import * as cdk from '@aws-cdk/core';
import * as smile from '../';

/**
 * This is the entryPoint for AWS-CDK
 */

/**
 * The CDK App
 */
const app = new cdk.App();

/**
 * Read the YAML Config from Disk
 */
const smileStackProps: smile.SmileStackProps = smile.SmileStack.setup();

/**
 * Run the Smile Account Stack
 * It is returned for use in depend Stacks below
 */
const smileAccountStack = new smile.SmileAccountStack(
  app,
  'SmileAccountStack',
  smileStackProps.account,
);

/**
 * Run the Smile Governance Stack
 * It is not used by other stack, but it uses the Smile Account Stack
 * AND the Smile Account Stack Properties
 */
new smile.SmileGovernanceStack(
  app,
  'SmileGovernanceStack',
  smileStackProps.governance,
  smileAccountStack,
);

/**
 * Runs the Network Smile Stack
 * It is used by the Smile AVM Stack AND it uses the Smile Account Stack
 * AND the Smile Account Stack Properties AND the Smile Network properties
 */
const smileNetworkStack = new smile.SmileNetworkStack(
  app,
  'SmileNetworkStack',
  smileStackProps.network,
  smileAccountStack,
);

/**
 * Runs the AVM Smile Stack
 * It is not used by other stack, but it uses the Smile Network stack
 * AND the Smile Account Stack Properties AND the Smile Network properties
 */
new smile.SmileAVMStack(
  app,
  'SmileAVMStack',
  smileStackProps.network,
  smileAccountStack,
  smileNetworkStack,
  smileStackProps.account,
);

/**
 * Runs the Security Smile Stack
 * It uses the Smile Account
 */
new smile.SmileSecurityStack(
  app,
  'SmileSecurityStack',
  smileStackProps.security,
  smileAccountStack,
);