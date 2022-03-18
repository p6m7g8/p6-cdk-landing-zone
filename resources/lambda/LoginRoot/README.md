# Remediation - Lambda: root_login

- [Intro](#intro)
- [RFC2119](#rfc2119)

## Intro

![Flow](../../../assets/remediations/LambdaRemediations/LoginRoot.png)

## Summary

The following tasks require you to sign in as the AWS account root user. We
recommend that you use a standard IAM user with appropriate permissions
to perform all normal user or administrative tasks. However, you can perform
the tasks listed below only when you sign in as the root user of an account.

If you cannot complete any of the following tasks using your root user
credentials, your account might be a member of an organization in AWS
Organizations. If your organizational administrator used a service control
policy (SCP) to limit the permissions of your account, then your root user
permissions might be affected. For more information about SCPs, see Service
Control Policies in the AWS Organizations User Guide. For more information
about SCP limitations see Tasks and Entities Not Restricted by SCPs in the
AWS Organizations User Guide.

## Why

However, there are certain actions that can only be performed by the root
user. To be certain that all root user activity is authorized and expected,
it is important to monitor root API calls to a given AWS account and to
notify when this type of activity is detected. This notification gives you
the ability to take any necessary steps when an illegitimate root API
activity is detected or it can simply be used as a record for any future
auditing needs.

## Root Tasks

- Change your account settings. This includes the account name, root user
  password, and email address. Other account settings, such as contact
  information, payment currency preference, and Regions, do
  not require root user credentials.

- View certain tax invoices. An IAM user with the aws-portal:ViewBilling
  permission can view and download VAT invoices from AWS Europe, but not
  AWS Inc or Amazon Internet Services Pvt. Ltd (AISPL).

- Close your AWS account.

- Restore IAM user permissions. If the only IAM administrator accidentally
  revokes their own permissions, you can sign in as the root user to edit
  policies and restore those permissions.

- Change your AWS Support plan or Cancel your AWS Support plan. For more information,
  see IAM for AWS Support.

- Register as a seller in the Reserved Instance Marketplace.

- Create a CloudFront key pair.

- Configure an Amazon S3 bucket to enable MFA (multi-factor authentication) Delete.

- Edit or delete an Amazon S3 bucket policy that includes an invalid VPC ID or
  VPC endpoint ID.

- Sign up for GovCloud.

### RFC2119

```sh
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
RFC 2119.
```
