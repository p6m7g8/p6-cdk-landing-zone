import * as sns from '@aws-cdk/aws-sns';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as cdk from '@aws-cdk/core';

import * as smile from '../../';

/**
 * Properties
 */
export interface SmileSNSProps {
  /**
   * List of E-mails to subscribe to the topics
   */
  snsSubscriptions: smile.SnsSubscription[];
}

/**
 * XXX: there should be an implements here
 * The Alert Topic
 */
export class SmileSNSAlertTopic extends cdk.Construct {
  public readonly topic: sns.Topic;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileSNSProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'Alert');

    /**
     * Subscribe, note they have to click it in e-mail
     */
    for (const email of props.snsSubscriptions) {
      const emailSubscription = new snsSubscriptions.EmailSubscription(
        email.toString(),
      );
      this.topic.addSubscription(emailSubscription);
    }
  }
}

/**
 * Account Topic
 */
export class SmileSNSAccountTopic extends cdk.Construct {
  public readonly topic: sns.Topic;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileSNSProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'Account');

    /**
     * Subscribe, note they have to click it in e-mail
     */
    for (const email of props.snsSubscriptions) {
      const emailSubscription = new snsSubscriptions.EmailSubscription(
        email.toString(),
      );
      this.topic.addSubscription(emailSubscription);
    }
  }
}

/**
 * Governance Topic
 */
export class SmileSNSGovernanceTopic extends cdk.Construct {
  public readonly topic: sns.Topic;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileSNSProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'Governance');

    /**
     * Subscribe, note they have to click it in e-mail
     */
    for (const email of props.snsSubscriptions) {
      const emailSubscription = new snsSubscriptions.EmailSubscription(
        email.toString(),
      );
      this.topic.addSubscription(emailSubscription);
    }
  }
}

/**
 * Network Topic
 */
export class SmileSNSNetworkTopic extends cdk.Construct {
  public readonly topic: sns.Topic;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileSNSProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'Network');

    /**
     * Subscribe, note they have to click it in e-mail
     */
    for (const email of props.snsSubscriptions) {
      const emailSubscription = new snsSubscriptions.EmailSubscription(
        email.toString(),
      );
      this.topic.addSubscription(emailSubscription);
    }
  }
}

/**
 * Security Topic
 */
export class SmileSNSSecurityTopic extends cdk.Construct {
  public readonly topic: sns.Topic;

  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props: SmileSNSProps) {
    super(scope, id);

    this.topic = new sns.Topic(this, 'Security');

    /**
     * Subscribe, note they have to click it in e-mail
     */
    for (const email of props.snsSubscriptions) {
      const emailSubscription = new snsSubscriptions.EmailSubscription(
        email.toString(),
      );
      this.topic.addSubscription(emailSubscription);
    }
  }
}
