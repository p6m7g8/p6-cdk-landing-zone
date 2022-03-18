"""Event Driven Lambda to remediate VPC Internet Gateways in Real-Time.

T-Rex SMILE
"""
import logging
import boto3

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info(
    'Logging setup complete - set to log level %s',
    log.getEffectiveLevel()
)

ec2 = boto3.resource('ec2')


def smile_loop_prevent(event):
    """Prevents Lambda lopops."""
    # Loop protection
    if 'errorCode' in event['detail']:
        logging.info('Previous API call resulted in an error. Ending')
        return True
    if 'errorMessage' in event['detail']:
        logging.info('Previous API call resulted in an error. Ending')
        return True

    return False


def smile_ec2_vpc_internet_gateway_authorized_vpc_only(event):
    """Detach and Delete IGW from the VPC."""
    if smile_loop_prevent(event):
        return

    igw = ec2.InternetGateway(
        event['detail']['requestParameters']['internetGatewayId'])
    logging.info(igw)

    response = igw.detach_from_vpc(
        VpcId=event['detail']['requestParameters']['vpcId'])
    logging.info(response)

    response = igw.delete()
    logging.info(response)


def handler(event, context):
    """Lambda Entry Point."""
    smile_ec2_vpc_internet_gateway_authorized_vpc_only(event)

    return True


def main():
    """Developer Entry Point."""
    logging.debug("handler()")
    handler({}, {})


if __name__ == "__main__":
    main()
