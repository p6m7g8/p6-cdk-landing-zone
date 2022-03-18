"""Event Driven Lambda for the Account Vending Machine.

T-Rex SMILE
"""
import logging
import boto3
import time

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info(
    'Logging setup complete - set to log level %s',
    log.getEffectiveLevel()
)

org = boto3.client('organizations')
dyn = boto3.client('dynamodb')


def smile_avm_account_create(event):
    """Account Vending Machine: Account Create"""
    response = org.create_account(
        Email=event['email'], AccountName=event['accountName'])
    logging.info(response)

    create_account_request_id = response.get('CreateAccountStatus').get('Id')

    response = {}
    while (True):
        response = org.describe_create_account_status(
            CreateAccountRequestId=create_account_request_id)
        logging.info(response)
        status = response.get('CreateAccountStatus').get('State')
        logging.info("status: [%s]" % status)
        if status == 'SUCCEEDED':
            break
        elif status == 'FAILED':
            return False
        time.sleep(5)


def handler(event, context):
    """Lambda Entry Point"""
    logging.info(event)
    result = smile_avm_account_create(event)
    return result


def main():
    """Developer Entry Point."""
    logging.debug("handler()")
    handler({}, {})


if __name__ == "__main__":
    main()
