
import * as fs from 'fs';
import * as cdk from '@aws-cdk/core';

import * as yaml from 'js-yaml';
import * as smile from './';

/**
 * This holds the YAML config from the config system
 * One for each stack
 * Plus the AwsEnvironment which is a region/account combo
 */
export interface SmileStackProps extends cdk.StackProps {
  env: smile.SmileEnv;
  account: smile.SmileAccountProps;
  security: smile.SmileSecurityProps;
  governance: smile.SmileGovernanceProps;
  network: smile.SmileNetworkProps;
}

/**
 *
 */
export class SmileStack extends cdk.Stack {

  /**
   * Calls `readYaml()`
   * Makes the `AwsEnvironment`
   * Then constructs `SmileStackProps`
   */
  public static setup(): SmileStackProps {
    const yml = SmileStack.readYaml();


    // the AwsEnvironment
    const theEnv: smile.SmileEnv = {
      account:
        process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
    };

    const smileAccountProps = new smile.SmileAccountProps(theEnv, yml.account);
    const smileSecurityProps = new smile.SmileSecurityProps(
      theEnv,
      yml.security,
    );
    const smileGovernanceProps = new smile.SmileGovernanceProps(
      theEnv,
      yml.governance,
    );

    const smileNetworkProps = new smile.SmileNetworkProps(theEnv, yml.network);

    // The full stack properties object
    const props: SmileStackProps = {
      env: theEnv,
      account: smileAccountProps,
      security: smileSecurityProps,
      governance: smileGovernanceProps,
      network: smileNetworkProps,
    };

    return props;
  }

  /**
   *
   * Reads the YAML config at `dist/config.yml`
   * This is returned as any and will be strongly
   * typed by Each Stack by its Propper
   */
  public static readYaml(): any {
    const cf: string = 'dist/config.yml';

    const yml = yaml.safeLoad(fs.readFileSync(cf, 'utf8'));

    return yml;
  }

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}
