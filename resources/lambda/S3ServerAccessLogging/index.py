"""Event Driven Lambda to remediate ServerAccessLogging in S3 in Real-Time.

T-Rex SMILE
"""
import logging
import boto3
import os

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info(
    'Logging setup complete - set to log level %s', log.getEffectiveLevel()
)

s3c = boto3.client('s3')


def smile_s3_logging_main(event, account_id):
    """T-Rex SMILE® entry point.

    Dispatch
    """
    if 'detail' not in event or 'eventName' not in event['detail']:
        return False

    params = event['detail']['requestParameters']
    bucket = params['bucketName']
    log.info("bucket: %s", bucket)
    log.info("%s", params)

    log_bucket = os.environ['LOGBUCKET']
    log_prefix = "logs/" + account_id + "/" + bucket + "/"

    # Loop protection
    bls = params['BucketLoggingStatus']
    if 'LoggingEnabled' in bls and bls['LoggingEnabled']['TargetBucket'] == log_bucket:
        return False

    log.info("Setting/Resetting Logging back to the correct bucket and prefix")
    s3c.put_bucket_logging(
        Bucket=bucket,
        BucketLoggingStatus={
            'LoggingEnabled': {
                'TargetBucket': log_bucket,
                'TargetPrefix': log_prefix
            }
        }
    )

    return True


def handler(event, context):
    """Lambda Entry Point."""
    account_id = context.invoked_function_arn.split(":")[4]

    return smile_s3_logging_main(event, account_id)


def main():
    """Developer Entry Point."""
    logging.debug("handler()")
    handler({}, {})


if __name__ == "__main__":
    main()
