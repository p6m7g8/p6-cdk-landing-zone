"""Event Driven Lambda to remediate Public things about S3 in Real-Time.

T-Rex SMILE
"""
import logging
import boto3
import json

log = logging.getLogger()
log.setLevel(logging.INFO)
log.info('Logging setup complete - set to log level %s',
         log.getEffectiveLevel())

s3r = boto3.resource('s3')
s3c = boto3.client('s3')
s3control = boto3.client('s3control')
sts = boto3.client('sts')


def smile_short_circuit_should(event):
    """Return true if the change is asking to make it private."""
    if 'x-amz-acl' in event['detail']['requestParameters']:
        logging.info(
            'ACL is currently { %s }',
            event['detail']['requestParameters']['x-amz-acl'][0]
        )
        if event['detail']['requestParameters']['x-amz-acl'][0] == "private":
            logging.info('ACL is already private.  Ending.')
            return True
    return False


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


def smile_s3_bucket_acl_get(event):
    """Get the ACL for the bucket in event."""
    try:
        bucket_name = event['detail']['requestParameters']['bucketName']
        logging.info("Describing the current ACL: s3://%s", bucket_name)
        bucket_acl = s3r.Bucket(bucket_name).Acl()
        logging.info(bucket_acl)
        return bucket_acl
    except Exception as err:
        logging.error('Error was: {%s} Manual followup recommended', err)
        return False


def smile_log_delivery_preserve(bucket_acl):
    """Determine if LogDelivery needs to be preserved."""
    uri_list = ""
    preserve_log_delivery = []

    for grant in bucket_acl.grants:
        if "URI" in grant['Grantee']:
            logging.info("Found Grant: %s ", grant)
            uri_list += grant['Grantee']["URI"]
            if "LogDelivery" in str(grant):
                preserve_log_delivery.append(grant)

    if not preserve_log_delivery:
        preserve_log_delivery = False

    return [uri_list, preserve_log_delivery]


def smile_s3_bucket_acl_violation(uri_list):
    """Determine if there is an ACL violation."""
    if "AllUsers" in uri_list or "AuthenticatedUsers" in uri_list:
        logging.info("Violation found.  Grant ACL greater than Private")
        return True

    logging.info("ACL is correctly already private")
    return False


def smile_s3_bucket_acl_correct(bucket_acl, preserve_log_delivery):
    """Correct the bucket ACL."""
    logging.info("Attempting Automatic Resolution")
    try:
        # > 1 + LogDelivery, Keep LogDelivery
        if preserve_log_delivery:
            logging.info("ACL resetting ACL to LogDelivery")
            logging.info("Preserve was: %s", preserve_log_delivery)

            owner = bucket_acl.owner
            acl_string = {}
            acl_string['Grants'] = []

            for grant in preserve_log_delivery:
                acl_string['Grants'].append(grant)

            acl_string['Owner'] = owner
            logging.info("Preserving")

            # Correct the ACL
            response = bucket_acl.put(AccessControlPolicy=acl_string)
            logging.info(response)
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                logging.info("Reverted to only contain LogDelivery")
            else:
                logging.error('PutBucketACL failed. Manual followup')
        else:
            logging.info("ACL resetting ACL to Private")
            # Correct the ACL
            response = bucket_acl.put(ACL='private')
            logging.info(response)
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                logging.info("Bucket ACL has been changed to Private")
            else:
                logging.error('PutBucketACL failed. Manual followup')
    except Exception as err:
        logging.info('Unable resolve violation automatically')
        logging.info('Error was: %s', err)


def smile_s3_public_bucket_acl(event):
    """Set this Bucket's ACL to private unless that what it already was."""
    if smile_short_circuit_should(event):
        return True

    if smile_loop_prevent(event):
        return True

    bucket_acl = smile_s3_bucket_acl_get(event)
    if not bucket_acl:
        return False

    uri_list, preserve_log_delivery = smile_log_delivery_preserve(bucket_acl)

    if smile_s3_bucket_acl_violation(uri_list):
        smile_s3_bucket_acl_correct(bucket_acl, preserve_log_delivery)
        return True

    return False


def aws_is_private(bucket, key):
    """Determine if the Object(key) in bucket is private."""
    # Get the object ACL from S3
    logging.info("Describing the ACL: s3://%s/%s", bucket, key)
    acl = s3c.get_object_acl(Bucket=bucket, Key=key)

    # Private should have only one grant which is the owner of the object
    if (len(acl['Grants']) > 1):
        logging.info("Greater than one Grant")
        return False

    # If canonical owner != grantee ids then not private
    owner_id = acl['Owner']['ID']
    grantee_id = acl['Grants'][0]['Grantee']['ID']
    if (owner_id != grantee_id):
        logging.info("owner:[%s], grantee[%s] do not match",
                     owner_id, grantee_id)
        return False

    return True


def aws_make_private(bucket, key):
    """Make the key in bucket private."""
    logging.info("Making s3://%s/%s private", bucket, key)
    s3c.put_object_acl(Bucket=bucket, Key=key, ACL="private")


def smile_s3_public_bucket_object_acl(event):
    """If Needed, make object private."""
    key = event['detail']['requestParameters']['key']
    bucket = event['detail']['requestParameters']['bucketName']

    if not (aws_is_private(bucket, key)):
        aws_make_private(bucket, key)


def smile_s3_public_bucket_access_block(event):
    """Set Bucket Public Access block if any of the four are turned off."""
    pbc = event['detail']['requestParameters']['PublicAccessBlockConfiguration']
    logging.info(pbc)
    if not pbc['RestrictPublicBuckets'] or not pbc['BlockPublicPolicy'] or not pbc['BlockPublicAcls'] or not pbc['IgnorePublicAcls']:
        bucket = event['detail']['requestParameters']['bucketName']
        logging.info("s3://%s now not private, fixing...", bucket)
        response = s3c.put_public_access_block(
            Bucket=bucket,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': True,
                'RestrictPublicBuckets': True
            })
        logging.info(response)


def smile_s3_public_access_block(event):
    """Set Account Public Access block if any of the four are turned off."""
    pbc = event['detail']['requestParameters']['PublicAccessBlockConfiguration']
    logging.info(pbc)
    if not pbc['RestrictPublicBuckets'] or \
            not pbc['BlockPublicPolicy'] or \
            not pbc['BlockPublicAcls'] or \
            not pbc['IgnorePublicAcls']:
        account = sts.get_caller_identity()
        logging.info("%s", account)

        response = s3control.put_public_access_block(
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': True,
                'RestrictPublicBuckets': True
            },
            AccountId=account['Account']
        )
        logging.info(response)


def smile_s3_public_fusebox(event):
    """T-Rex SMILE® entry point.

    Dispatch
    """
    if 'detail' not in event or 'eventName' not in event['detail']:
        return False

    events = [
        'PutBucketAcl',
        'PutObjectAcl',
        'PutBucketPublicAccessBlock',
        'PutAccountPublicAccessBlock'
    ]
    event_name = event['detail']['eventName']
    if event_name in events:
        logging.info(
            "======================================================================================")
        logging.info("eventName: %s", event_name)

    if event_name == 'PutBucketAcl':
        smile_s3_public_bucket_acl(event)
    elif event_name == 'PutObjectAcl':
        smile_s3_public_bucket_object_acl(event)
    elif event_name == 'PutBucketPublicAccessBlock':
        smile_s3_public_bucket_access_block(event)
    elif event_name == 'PutAccountPublicAccessBlock':
        smile_s3_public_access_block(event)

    return True


def handler(event, context):
    """Lambda Entry Point."""
    smile_s3_public_fusebox(event)

    return True


def main():
    """Developer Entry Point."""
    logging.debug("Reading fixtures/putBucketAcl.json")
    with open('fixtures/putBucketAcl.json') as json_file:
        data = json.load(json_file)

    logging.debug("handler()")
    handler(data, {})


if __name__ == "__main__":
    main()
