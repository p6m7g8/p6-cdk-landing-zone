import * as config from '@aws-cdk/aws-config';
import * as cdk from '@aws-cdk/core';

import * as smileR from './remediations';

/**
 * https://docs.aws.amazon.com/config/latest/developerguide/conformancepack-sample-templates.html
 */
export class SmileConfigPack extends cdk.Resource {
  /**
   *
   * @param scope
   * @param id
   * @param props
   */
  constructor(scope: cdk.Construct, id: string, props?: cdk.ResourceProps) {
    super(scope, id, props);

    /**
     * The goal is have these all be L3 then split out to their own Construct
     * We should also support config/ driven arbitrary rules (see 1st 100 commits of smile)
     * props subsections need to get passed through too
     */

    /**
     * Own Construct
     */

    /**
     * L3
     */
    new smileR.S3BucketPublicReadProhibited(this, 'S3BucketPublicReadProhibited');
    new smileR.S3BucketPublicWriteProhibited(this, 'S3BucketPublicWriteProhibited');
    new smileR.S3ServerAccessLogging(this, 'S3ServerAccessLogging');
    new smileR.VpcInternetGatewayAuthorizedVpcOnly(this, 'VpcInternetGatewaysAllowed');

    /**
     * L2
     */
    new config.AccessKeysRotated(this, 'IamAccessKeysRotated', {
      configRuleName: 'IamAccessKeysRotated',
      description:
				'Checks whether the active access keys are rotated within the number of days specified in maxAccessKeyAge. The rule is non-compliant if the access keys have not been rotated for more than maxAccessKeyAge number of days.',
      maxAge: cdk.Duration.days(30),
    });

    /**
     * L1
     * We need a plan to generate these jsii style from the samples and skip the converted ones
     */

    /**
     * Vpc
     */
    new config.CfnConfigRule(this, 'Ec2VpcFlowLogsEnabled', {
      configRuleName: 'Ec2VpcFlowLogsEnabled',
      description: 'Checks whether Amazon Virtual Private Cloud flow logs are found and enabled for Amazon VPC.',
      inputParameters: {
        trafficType: 'REJECT',
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'VPC_FLOW_LOGS_ENABLED',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });
    new config.CfnConfigRule(this, 'Ec2VpcDefaultSecurityGroupClosed', {
      configRuleName: 'Ec2VpcDefaultSecurityGroupClosed',
      description:
				'Checks that the default security group of any Amazon Virtual Private Cloud (VPC) does not allow inbound or outbound traffic. The rule is non-compliant if the default security group has one or more inbound or outbound traffic.',
      scope: {
        complianceResourceTypes: ['AWS::EC2::SecurityGroup'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'VPC_DEFAULT_SECURITY_GROUP_CLOSED',
      },
    });

    /**
     * EC2
     */
    new config.CfnConfigRule(this, 'Ec2EbsOptimizedInstance', {
      configRuleName: 'Ec2EbsOptimizedInstance',
      description:
				'Disallow launch of EC2 instance types that are not EBS-optimized - Checks whether EBS optimization is enabled for your EC2 instances that can be EBS-optimized',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EBS_OPTIMIZED_INSTANCE',
      },
      scope: {
        complianceResourceTypes: ['AWS::EC2::Instance'],
      },
    });
    new config.CfnConfigRule(this, 'Ec2VolumesInUse', {
      configRuleName: 'Ec2VolumesInUs',
      description:
				'Disallow EBS volumes that are unattached to an EC2 instance - Checks whether EBS volumes are attached to EC2 instances',
      inputParameters: {
        deleteOnTermination: true,
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EC2_VOLUME_INUSE_CHECK',
      },
      scope: {
        complianceResourceTypes: ['AWS::EC2::Volume'],
      },
    });
    new config.CfnConfigRule(this, 'Ec2VolumeEncrypte', {
      configRuleName: 'Ec2VolumeEncrypted',
      description:
				'Enable encryption for EBS volumes attached to EC2 instances - Checks whether EBS volumes that are in an attached state are encrypted.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ENCRYPTED_VOLUMES',
      },
      scope: {
        complianceResourceTypes: ['AWS::EC2::Volume'],
      },
    });
    new config.CfnConfigRule(this, 'Ec2InstanceManagedBySsm', {
      configRuleName: 'Ec2InstanceManagedBySsm',
      description: 'Checks whether the Amazon EC2 instances in your account are managed by AWS Systems Manager.',
      scope: {
        complianceResourceTypes: ['AWS::EC2::Instance', 'AWS::SSM::ManagedInstanceInventory'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EC2_INSTANCE_MANAGED_BY_SSM',
      },
    });
    new config.CfnConfigRule(this, 'Ec2InstanceNoPublicIp', {
      configRuleName: 'Ec2InstanceNoPublicIp',
      description:
				'Checks whether Amazon Elastic Compute Cloud (Amazon EC2) instances have a public IP association. The rule is NON_COMPLIANT if the publicIp field is present in the Amazon EC2 instance configuration item. This rule applies only to IPv4.',
      scope: {
        complianceResourceTypes: ['AWS::EC2::Instance'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EC2_INSTANCE_NO_PUBLIC_IP',
      },
    });
    new config.CfnConfigRule(this, 'Ec2ManagedinstanceAssociationComplianceStatusCheck', {
      configRuleName: 'Ec2ManagedinstanceAssociationComplianceStatusCheck',
      description:
				'Checks whether the compliance status of the AWS Systems Manager association compliance is COMPLIANT or NON_COMPLIANT after the association execution on the instance. The rule is compliant if the field status is COMPLIANT.',
      scope: {
        complianceResourceTypes: ['AWS::SSM::AssociationCompliance'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EC2_MANAGEDINSTANCE_ASSOCIATION_COMPLIANCE_STATUS_CHECK',
      },
    });
    new config.CfnConfigRule(this, 'Ec2SgSshDisabled', {
      configRuleName: 'Ec2SshDisabled',
      description:
				'Disallow internet connection through SSH - Checks whether security groups that are in use disallow unrestricted incoming SSH traffic.',
      scope: {
        complianceResourceTypes: ['AWS::EC2::SecurityGroup'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'INCOMING_SSH_DISABLED',
      },
    });
    new config.CfnConfigRule(this, 'Ec2SgCommonPortsDisabled', {
      configRuleName: 'Ec2SgCommonPortsDisabled',
      description:
				'Disallow internet connection through RDP - Checks whether security groups that are in use disallow unrestricted incoming TCP traffic to the specified ports.',
      inputParameters: {
        blockedPort1: 20,
        blockedPort2: 21,
        blockedPort3: 3389,
        blockedPort4: 3306,
        blockedPort5: 4333,
      },
      scope: {
        complianceResourceTypes: ['AWS::EC2::SecurityGroup'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'RESTRICTED_INCOMING_TRAFFIC',
      },
    });

    new config.CfnConfigRule(this, 'ElbAcmCertificateRequired', {
      configRuleName: 'ElbAcmCertificateRequired',
      description:
				'This rule checks whether the Elastic Load Balancer(s) uses SSL certificates provided by AWS Certificate Manager. You must use an SSL or HTTPS listener with your Elastic Load Balancer to use this rule.',
      scope: {
        complianceResourceTypes: ['AWS::ElasticLoadBalancing::LoadBalancer'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ELB_ACM_CERTIFICATE_REQUIRED',
      },
    });

    /**
     * RDS
     */
    new config.CfnConfigRule(this, 'RdsPublicAccess', {
      configRuleName: 'RdsPublicAccess',
      description:
				'Disallow public access to RDS database instances - Checks whether the Amazon Relational Database Service (RDS) instances are not publicly accessible. The rule is non-compliant if the publiclyAccessible field is true in the instance configuration item.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'RDS_INSTANCE_PUBLIC_ACCESS_CHECK',
      },
      scope: {
        complianceResourceTypes: ['AWS::RDS::DBInstance'],
      },
    });
    new config.CfnConfigRule(this, 'RdsSnapshots', {
      configRuleName: 'RdsSnapshots',
      description:
				'Disallow public access to RDS database snapshots - Checks if Amazon Relational Database Service (Amazon RDS) snapshots are public. The rule is non-compliant if any existing and new Amazon RDS snapshots are public.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'RDS_SNAPSHOTS_PUBLIC_PROHIBITED',
      },
      scope: {
        complianceResourceTypes: ['AWS::RDS::DBSnapshot'],
      },
    });
    new config.CfnConfigRule(this, 'RdsStorageEncryption', {
      configRuleName: 'RdsStorageEncryption',
      description:
				'Disallow RDS database instances that are not storage encrypted - Checks whether storage encryption is enabled for your RDS DB instances.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'RDS_STORAGE_ENCRYPTED',
      },
      scope: {
        complianceResourceTypes: ['AWS::RDS::DBInstance'],
      },
    });

    /**
     * DynamoDB
     */
    new config.CfnConfigRule(this, 'DynamoDbAutoscalingEnabled', {
      configRuleName: 'DynamoDbAutoscalingEnabled',
      description:
				'This rule checks whether Auto Scaling is enabled on your DynamoDB tables. Optionally you can set the read and write capacity units for the table.',
      maximumExecutionFrequency: 'Six_Hours',
      scope: {
        complianceResourceTypes: ['AWS::DynamoDB::Table'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'DYNAMODB_AUTOSCALING_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'DynamoDbTableEncryptionEnabled', {
      configRuleName: 'DynamoDbTableEncryptionEnabled',
      description:
				'Checks whether the Amazon DynamoDB tables are encrypted and checks their status. The rule is compliant if the status is enabled or enabling.',
      scope: {
        complianceResourceTypes: ['AWS::DynamoDB::Table'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'DYNAMODB_TABLE_ENCRYPTION_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'DynamoDbThroughputLimitCheck', {
      configRuleName: 'DynamoDbThroughputLimitCheck',
      description:
				'Checks whether provisioned DynamoDB throughput is approaching the maximum limit for your account.',
      maximumExecutionFrequency: 'Six_Hours',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'DYNAMODB_THROUGHPUT_LIMIT_CHECK',
      },
    });

    /**
     * S3
     */
    new config.CfnConfigRule(this, 'S3VersioningEnabled', {
      configRuleName: 'S3VersioningEnabled',
      description:
				'Disallow S3 buckets that are not versioning enabled - Checks whether versioning is enabled for your S3 buckets.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_VERSIONING_ENABLED',
      },
      scope: {
        complianceResourceTypes: ['AWS::S3::Bucket'],
      },
    });
    new config.CfnConfigRule(this, 'S3BucketReplicationEnabled', {
      configRuleName: 'S3BucketReplicationEnabled',
      description: 'Checks whether the Amazon S3 buckets have cross-region replication enabled.',
      scope: {
        complianceResourceTypes: ['AWS::S3::Bucket'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_REPLICATION_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'S3BucketSSLRequestsOnly', {
      configRuleName: 'S3BucketSSLRequestsOnly',
      description:
				'Checks whether S3 buckets have policies that require requests to use Secure Socket Layer (SSL).',
      scope: {
        complianceResourceTypes: ['AWS::S3::Bucket'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_SSL_REQUESTS_ONLY',
      },
    });
    new config.CfnConfigRule(this, 'S3ServerSideReplicationEnabled', {
      configRuleName: 'S3ServerSideReplicationEnabled',
      description:
				'Checks that your Amazon S3 bucket either has S3 default encryption enabled or that the S3 bucket policy explicitly denies put-object requests without server side encryption.',
      scope: {
        complianceResourceTypes: ['AWS::S3::Bucket'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'S3BucketPolicyGranteeCheck', {
      configRuleName: 'S3BucketPolicyGranteeCheck',
      description:
				'Checks that the access granted by the Amazon S3 bucket is restricted to any of the AWS principals, federated users, service principals, IP addresses, or VPCs that you provide. The rule is COMPLIANT if a bucket policy is not present.',
      scope: {
        complianceResourceTypes: ['AWS::S3::Bucket'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'S3_BUCKET_POLICY_GRANTEE_CHECK',
      },
    });

    /**
     * Root
     */
    new config.CfnConfigRule(this, 'IamRootMfa', {
      configRuleName: 'IamRootMfa',
      description:
				'Enable MFA for the root user - Checks whether the root user of your AWS account requires multi-factor authentication for console sign-in.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ROOT_ACCOUNT_MFA_ENABLED',
      },
      maximumExecutionFrequency: 'One_Hour',
    });
    new config.CfnConfigRule(this, 'IamRootAccountHardwareMFAEnabled', {
      configRuleName: 'IamRootAccountHardwareMFAEnabled',
      description:
				'Checks whether your AWS account is enabled to use multi-factor authentication (MFA) hardware device to sign in with root credentials.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ROOT_ACCOUNT_HARDWARE_MFA_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'IamRootAccessKeyCheck', {
      configRuleName: 'IamRootAccessKeyCheck',
      description:
				'Checks whether the root user access key is available. The rule is compliant if the user access key does not exist.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_ROOT_ACCESS_KEY_CHECK',
      },
      maximumExecutionFrequency: 'One_Hour',
    });

    /**
     * IAM
     */
    new config.CfnConfigRule(this, 'IamUserMFA', {
      configRuleName: 'IamUserMFA',
      description:
				'Disallow access to IAM users without MFA - Checks whether the AWS Identity and Access Management users have multi-factor authentication (MFA) enabled. The rule is COMPLIANT if MFA is enabled.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_USER_MFA_ENABLED',
      },
      maximumExecutionFrequency: 'One_Hour',
    });
    new config.CfnConfigRule(this, 'IamUserConsoleMFA', {
      configRuleName: 'IamUserConsoleMFA',
      description:
				'Disallow console access to IAM users without MFA - Checks whether AWS Multi-Factor Authentication (MFA) is enabled for all AWS Identity and Access Management (IAM) users that use a console password. The rule is COMPLIANT if MFA is enabled.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'MFA_ENABLED_FOR_IAM_CONSOLE_ACCESS',
      },
      maximumExecutionFrequency: 'One_Hour',
    });
    new config.CfnConfigRule(this, 'IamPasswordPolicy', {
      configRuleName: 'IamPasswordPolicy',
      description: 'Checks whether the account password policy for IAM users meets the specified requirements.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_PASSWORD_POLICY',
      },
    });
    new config.CfnConfigRule(this, 'IamPolicyNoStatementsWithAdminAccess', {
      configRuleName: 'IamPolicyNoStatementsWithAdminAccess',
      description:
				'Checks whether the default version of AWS Identity and Access Management (IAM) policies do not have administrator access. If any statement has "Effect": "Allow" with "Action": "*" over "Resource": "*", the rule is non-compliant.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_POLICY_NO_STATEMENTS_WITH_ADMIN_ACCESS',
      },
    });
    new config.CfnConfigRule(this, 'IamMUserGroupMembershipCheck', {
      configRuleName: 'IamUserGroupMembershipCheck',
      description: 'Checks whether IAM users are members of at least one IAM group.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_USER_GROUP_MEMBERSHIP_CHECK',
      },
    });
    new config.CfnConfigRule(this, 'IamGroupHasUsersCheck', {
      configRuleName: 'IamGroupHasUsersCheck',
      description: 'Checks whether IAM groups have at least one IAM user.',
      scope: {
        complianceResourceTypes: ['AWS::IAM::Group'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_GROUP_HAS_USERS_CHECK',
      },
    });
    new config.CfnConfigRule(this, 'IamUserUnusedCredentialsCheck', {
      configRuleName: 'IamUserUnusedCredentialsCheck',
      description:
				'Checks whether your AWS Identity and Access Management (IAM) users have passwords or active access keys that have not been used within the specified number of days you provided.',
      inputParameters: {
        maxCredentialUsageAge: '30',
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_USER_UNUSED_CREDENTIALS_CHECK',
      },
    });
    new config.CfnConfigRule(this, 'IamUserNoPoliciesCheck', {
      configRuleName: 'IamUserNoPoliciesCheck',
      description:
				'Checks that none of your IAM users have policies attached. IAM users must inherit permissions from IAM groups or roles.',
      scope: {
        complianceResourceTypes: ['AWS::IAM::User'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_USER_NO_POLICIES_CHECK',
      },
    });
    new config.CfnConfigRule(this, 'IamSupportPolicyInUse', {
      configRuleName: 'IamSupportPolicyInUse',
      description:
				"Checks that the 'AWSSupportAccess' managed policy is attached to any IAM user, group, or role",
      inputParameters: {
        policyARN: 'arn:aws:iam::aws:policy/AWSSupportAccess',
        policyUsageType: 'ANY',
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'IAM_POLICY_IN_USE',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });

    /**
     * Cloud Trail
     */
    new config.CfnConfigRule(this, 'CloudTrailMultiRegionEnabled', {
      configRuleName: 'CloudTrailMultiRegionEnabled',
      description:
				'Checks that there is at least one multi-region AWS CloudTrail. The rule is non-compliant if the trails do not match input parameters',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'MULTI_REGION_CLOUD_TRAIL_ENABLED',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });
    new config.CfnConfigRule(this, 'CloudTrailLogFileValidationEnabled', {
      configRuleName: 'CloudTrailLogFileValidationEnabled',
      description: 'Checks whether AWS CloudTrail creates a signed digest file with logs',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CLOUD_TRAIL_LOG_FILE_VALIDATION_ENABLED',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });
    new config.CfnConfigRule(this, 'CloudTrailCloudWatchLogsEnabled', {
      configRuleName: 'CloudTrailCloudWatchLogsEnabled',
      description: 'Checks whether AWS CloudTrail trails are configured to send logs to Amazon CloudWatch logs.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CLOUD_TRAIL_CLOUD_WATCH_LOGS_ENABLED',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });
    new config.CfnConfigRule(this, 'CloudTrailEnabled', {
      configRuleName: 'CloudTrailEnabled',
      description: 'Checks whether AWS CloudTrail is enabled in your AWS account.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CLOUD_TRAIL_ENABLED',
      },
    });
    new config.CfnConfigRule(this, 'CloudTrailEncryptionEnabled', {
      configRuleName: 'CloudTrailEncryptionEnabled',
      description:
				'Checks whether AWS CloudTrail is configured to use the server side encryption (SSE) AWS Key Management Service (AWS KMS) customer master key (CMK) encryption. The rule is compliant if the KmsKeyId is defined.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CLOUD_TRAIL_ENCRYPTION_ENABLED',
      },
    });

    /**
     * KMS
     */
    new config.CfnConfigRule(this, 'KmsCmkBackingKeyRotationEnabled', {
      configRuleName: 'KmsCmkBackingKeyRotationEnabled',
      description:
				'Checks that key rotation is enabled for each key and matches to the key ID of the customer created customer master key (CMK). The rule is compliant, if the key rotation is enabled for specific key object.',
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CMK_BACKING_KEY_ROTATION_ENABLED',
      },
      maximumExecutionFrequency: 'Twelve_Hours',
    });

    /**
     * ACM
     */
    new config.CfnConfigRule(this, 'AcmCertificateExpirationCheck', {
      configRuleName: 'AcmCertificateExpirationCheck',
      description:
        'Checks whether ACM Certificates in your account are marked for expiration within the specified number of days. Certificates provided by ACM are automatically renewed. ACM does not automatically renew certificates that you import.',
      inputParameters: {
        daysToExpiration: '14',
      },
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {
        complianceResourceTypes: ['AWS::ACM::Certificate'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ACM_CERTIFICATE_EXPIRATION_CHECK',
      },
    });

    /**
     * CloudWatch
     */
    new config.CfnConfigRule(this, 'CloudwatchLogGroupEncrypted', {
      configRuleName: 'CloudwatchLogGroupEncrypted',
      description:
				'Checks whether a log group in Amazon CloudWatch Logs is encrypted. The rule is NON_COMPLIANT if CloudWatch Logs has log group without encryption enabled.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'CLOUDWATCH_LOG_GROUP_ENCRYPTED',
      },
    });

    /**
     * EFS
     */
    new config.CfnConfigRule(this, 'EfsEncryptedCheck', {
      configRuleName: 'EfsEncryptedCheck',
      description:
				'Checks whether Amazon EFS are configured to encrypt file data using AWS KMS. The rule is NON_COMPLIANT if the Encrypted key is set to False on DescribeFileSystems or, if specified, KmsKeyId key on DescribeFileSystems is not matching KmsKeyId parameter.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EFS_ENCRYPTED_CHECK',
      },
    });

    /**
     * ES
     */
    new config.CfnConfigRule(this, 'ElasticsearchEncryptedAtRest', {
      configRuleName: 'ElasticsearchEncryptedAtRest',
      description:
				'Checks whether Amazon Elasticsearch Service (Amazon ES) domains have encryption at rest configuration enabled. The rule is NON_COMPLIANT if EncryptionAtRestOptions field is not enabled.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'ELASTICSEARCH_ENCRYPTED_AT_REST',
      },
    });

    /**
     * EMR
     */
    new config.CfnConfigRule(this, 'EmrMasterNoPublicIp', {
      configRuleName: 'EmrMasterNoPublicIp',
      description:
				"Checks whether Amazon Elastic MapReduce (EMR) clusters' master nodes have public IPs. The rule is NON_COMPLIANT if the master node has a public IP.",
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {
        complianceResourceTypes: [],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'EMR_MASTER_NO_PUBLIC_IP',
      },
    });

    /**
     * Lambda
     */
    new config.CfnConfigRule(this, 'LambdaFunctionPublicAccessProhibited', {
      configRuleName: 'LambdaFunctionPublicAccessProhibited',
      description: 'Checks whether the Lambda function policy prohibits public access.',
      scope: {
        complianceResourceTypes: ['AWS::Lambda::Function'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'LAMBDA_FUNCTION_PUBLIC_ACCESS_PROHIBITED',
      },
    });

    /**
     * Redshift
     */
    new config.CfnConfigRule(this, 'RedshiftClusterPublicAccessCheck', {
      configRuleName: 'RedshiftClusterPublicAccessCheck',
      description:
				'Checks whether Amazon Redshift clusters are not publicly accessible. The rule is NON_COMPLIANT if the publiclyAccessible field is true in the cluster configuration item.',
      scope: {
        complianceResourceTypes: ['AWS::Redshift::Cluster'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'REDSHIFT_CLUSTER_PUBLIC_ACCESS_CHECK',
      },
    });

    /**
     * Sagemaker
     */
    new config.CfnConfigRule(this, 'SagemakerNotebookInstanceKmsKeyConfigured', {
      configRuleName: 'SagemakerNotebookInstanceKmsKeyConfigured',
      description:
				"Check whether an AWS Key Management Service (KMS) key is configured for an Amazon SageMaker notebook instance. The rule is NON_COMPLIANT if 'KmsKeyId' is not specified for the Amazon SageMaker notebook instance.",
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'SAGEMAKER_NOTEBOOK_INSTANCE_KMS_KEY_CONFIGURED',
      },
    });
    new config.CfnConfigRule(this, 'SagemakerNotebookNoDirectInternetAccess', {
      configRuleName: 'SagemakerNotebookNoDirectInternetAccess',
      description:
				'Checks whether direct internet access is disabled for an Amazon SageMaker notebook instance. The rule is NON_COMPLIANT if Amazon SageMaker notebook instances are internet-enabled.',
      maximumExecutionFrequency: 'TwentyFour_Hours',
      scope: {},
      source: {
        owner: 'AWS',
        sourceIdentifier: 'SAGEMAKER_NOTEBOOK_NO_DIRECT_INTERNET_ACCESS',
      },
    });

    /**
     * Secrets Manager
     */
    new config.CfnConfigRule(this, 'SecretsmanagerRotationEnabledCheck', {
      configRuleName: 'SecretsmanagerRotationEnabledCheck',
      description:
				'Checks whether AWS Secret Manager secret has rotation enabled. If the maximumAllowedRotationFrequency parameter is specified, the rotation frequency of the secret is compared with the maximum allowed frequency.',
      scope: {
        complianceResourceTypes: ['AWS::SecretsManager::Secret'],
      },
      source: {
        owner: 'AWS',
        sourceIdentifier: 'SECRETSMANAGER_ROTATION_ENABLED_CHECK',
      },
    });
  }
}
