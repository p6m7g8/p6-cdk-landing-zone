import boto3
import json


def lambda_handler(event, context):
    '''
    Extract the EC2 instance ID from the Cloud Watch Event, and stop the instance.
    '''

    try:
        print(event)
        ''' TODO: Refactor to Get Instance Method '''
        instance = event['detail']['requestParameters']['evaluations'][0]['complianceResourceId']
        print("Instance: " + instance)

        ec2 = boto3.client('ec2')
        ec2.stop_instances(InstanceIds=[instance])

        print('Stopped instance: %s' % instance)

    except Exception as e:
        print('Error - reason "%s"' % str(e))
