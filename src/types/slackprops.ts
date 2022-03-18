/**
 * Slack Config
 * Will be used by ci/cd, jenkins, and run-time
 * This gives us ChatOps
 * This is not yet implemented or used
 */

export type SmileSlackBotToken = string;
export type SmileSlackSigningSecret = string;
export type SmileSlackChannelName = string;
export type SmileSlackChannelId = string;

/**
 * A container for the Slack Config
 * https://github.com/cloudcomponents/cdk-constructs/blob/master/packages/cdk-codepipeline-slack/src/slack-approval-action.ts
 */
export type SmileSlack = {
  token: SmileSlackBotToken;
  secret: SmileSlackSigningSecret;
  channelName: SmileSlackChannelName;
  channelId: SmileSlackChannelId;
};
