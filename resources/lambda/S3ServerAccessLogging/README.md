# Lambda: >> Remediations >> S3ServerAccessLogging

- [Lambda: >> Remediations >> S3ServerAccessLogging](#lambda--remediations--s3serveraccesslogging)
  - [Intro](#intro)
    - [Scenarios](#scenarios)
    - [Conflicts](#conflicts)
    - [Limitations](#limitations)
    - [RFC2119](#rfc2119)

## Intro

![Flow](../../../assets/remediations/LambdaRemediations/s3ServerAccessLogging.png)

### Scenarios

- [x] Disable Logging
- [x] Changes Logging Bucket
- [ ] Create bucket without logging

### Conflicts

- To handle create bucket this lambda needs to be hook CreateBucket event too

### Limitations

- [x] Intentionally not handling changing prefix

### RFC2119

```sh
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
RFC 2119.
```
