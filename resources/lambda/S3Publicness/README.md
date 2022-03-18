# Lambda: >> Remediations >< S3Publicness

- [Remediation - Lambda: S3 Publicness](#remediation---lambda-s3_bucket_public_ness)
  - [Intro](#intro)
    - [Scenarios](#scenarios)
    - [Conflicts](#conflicts)
    - [Limitations](#limitations)
    - [RFC2119](#rfc2119)

## Intro

![Flow](../../../assets/remediations/LambdaRemediations/s3PublicNess.png)

### Scenarios

- [X] Account Level BlockConfiguration
- [X] Bucket Level BlockConfiguration
- [X] Bucket Level Grantees
- [X] Bucket Level ACLs
- [X] Object Level Grantees
- [X] Object Level ACLs
- [ ] Bucket Policy
- [ ] Cross Account (non org)
- [ ] Cross Account (within the org)
- ~~[ ] VPC Endpoint (access)~~
- ~~[ ] S3 AccessPoint (access)~~

### Conflicts

- Works hand in hand with `AWS Config + AWS SSM` remediations (frequency)

### Limitations

- Some Scenarios can not be fixed automatically (triage via `SNS` to e-mail or `Jira`)
- Don't trigger a `Lambda` storm (errors, loops)

### RFC2119

```sh
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
RFC 2119.
```
