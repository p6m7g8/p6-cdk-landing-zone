"""Event Driven Lambda to alert on Root Login or API calls in Real-Time.

T-Rex SMILE
"""
import logging
import botocore
import boto3
import json
import os

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info(
    'Logging setup complete - set to log level %s',
    log.getEffectiveLevel()
)

iam = boto3.client('iam')
sns = boto3.client('sns')
sts = boto3.client('sts')


def smile_login_root_process(event):
    """
    """
    sns_arn = os.environ['SNSARN']

    event_name = event['detail']['eventName']

    response = sts.get_caller_identity()
    logging.info(response)
    account_id = response['Account']

    response = iam.list_account_aliases()
    logging.info(response)

    try:
        if not response['AccountAliases']:
            logging.info("Alias is not defined. Account ID is: %s", account_id)
        else:
            alias = response['AccountAliases'][0]
            logging.info("Account is %s(%s)", alias, account_id)
    except botocore.exceptions.ClientError as error:
        logging.error("Client Error occurred %s", error)

    try:
        subject = "[ACTION REQUIRED]: ALERT - ROOT ACTIVITY [{}] detected in [{}({})]".format(
            event_name, alias, account_id)[:100]
        message = json.dumps({'default': json.dumps(event)})
        snspublish = sns.publish(
            TargetArn=sns_arn,
            Subject=subject,
            Message=message,
            MessageStructure='json'
        )
        logging.info("SNS publish response is-- %s", snspublish)
    except botocore.exceptions.ClientError as error:
        logging.error("An error occurred: %s", error)


def handler(event, context):
    """Lambda Entry Point."""
    smile_login_root_process(event)

    return True


def main():
    """Developer Entry Point."""
    logging.debug("handler()")
    handler({}, {})


if __name__ == "__main__":
    main()
