import boto3
import json
import uuid


def lambda_handler(event, context):
    '''
    Extract the EC2 instance ID from the Cloud Watch Event, and stop the instance.
    '''
    try:
        print(event)
        # TODO: Refactor to Get Instance Method
        instance_id = event['detail']['requestParameters']['evaluations'][0]['complianceResourceId']
        print("Instance: " + instance_id)

        client = boto3.client('ec2')

        instance = _get_instance_from_instance_id(client, instance_id)
        _stop_instance(client, instance)
        _snapshot_instance(client, instance)
        _quarantine_instance(client, instance)

        print('Quarantined instance: %s' % instance_id)

    except Exception as e:
        print('Error - reason "%s"' % str(e))


def _stop_instance(client, instance):
    client.stop_instances(
        InstanceIds=[
            instance["InstanceId"],
        ]
    )


def _get_instance_from_instance_id(client, instance_id):
    reservations = client.describe_instances(
        InstanceIds=[
            instance_id,
        ]
    )

    if len(reservations['Reservations']) == 1:
        instance = reservations['Reservations'][0]['Instances'][0]
    else:
        instance = None

    return instance


def _get_instance_from_ip(client, ip_address):

    public_ip_filter = [
        {
            'Name': 'ip-address',
            'Values': [
                ip_address,
            ]
        },
    ]

    reservations = client.describe_instances(Filters=public_ip_filter)

    if len(reservations['Reservations']) == 0:
        private_ip_filter = [
            {
                'Name': 'private-ip-address',
                'Values': [
                    ip_address,
                ]
            },
        ]
        reservations = client.describe_instances(Filters=private_ip_filter)

    if len(reservations['Reservations']) == 1:
        instance = reservations['Reservations'][0]['Instances'][0]
    else:
        instance = None

    return instance


def _snapshot_instance(client, instance):
    instance_id = instance["InstanceId"]
    blockmappings = instance["BlockDeviceMappings"]
    for device in blockmappings:
        snapshot = client.create_snapshot(
            VolumeId=device["Ebs"]["VolumeId"], Description="Created by Smile for " + instance_id)
        _add_tag(client, snapshot["SnapshotId"],
                 "Name", "Quarantine Snaphot " + instance_id)


def _quarantine_instance(client, instance):
    instance_id = instance["InstanceId"]
    vpc_id = instance["VpcId"]

    # Create a quarantine security with no ingress or egress rules
    sg = client.create_security_group(
        GroupName='Quarantine-' + str(uuid.uuid4().fields[-1])[:6],
        Description="Quarantine for " + instance_id,
        VpcId=vpc_id
    )
    sg_id = sg["GroupId"]

    # Remove the default egress group
    client.revoke_security_group_egress(
        GroupId=sg_id,
        IpPermissions=[
            {
                'IpProtocol': '-1',
                'FromPort': 0,
                'ToPort': 65535,
                'IpRanges': [
                    {
                        'CidrIp': '0.0.0.0/0'
                    },
                ]
            }]
    )

    # Assign security group to intstance
    client.modify_instance_attribute(InstanceId=instance_id, Groups=[sg_id])
    _add_tag(client, instance_id, "Smile", "Quarantined")
    _add_tag(client, sg_id, "Name", "Smile Quarantine " + instance_id)


def _add_tag(client, resource_id, tag_key, tag_value):
    client.create_tags(
        Resources=[
            resource_id,
        ],
        Tags=[
            {
                'Key': tag_key,
                'Value': tag_value
            },
        ]
    )
