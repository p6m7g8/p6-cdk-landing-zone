"""Return the latest Amazon 2 Linux HVM AMI.

T-Rex SMILE
"""
import logging
import boto3
import json

ec2 = boto3.client('ec2')

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info('Logging setup complete - set to log level %s', log.getEffectiveLevel())


def trex_ami_latest_amazon2():
    """Calls EC2.describeImages() and returns the NEWEST amazon2 AMI-id"""

    data = ec2.describe_images(
        Filters=[
            {'Name': 'name',  'Values': ['amzn2-ami-hvm-2.0.2020*-x86_64-gp2']},
            {'Name': 'state', 'Values': ['available']},
        ],
        Owners=['amazon']
    )

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': '{}'.format(data['Images'][0]['ImageId'])
    }


def handler(event, context):
    """Lambda Entry Point."""
    logging.info('request: %s', json.dumps(event))

    return trex_ami_latest_amazon2()

def main():
    """Developer Entry Point."""
    handler({}, {})


if __name__ == "__main__":
    main()
