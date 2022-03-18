# Lambda: >> Remediations >> AmiAmnz2Latest

- [Lambda: >> Remediations >> AmiAmnz2Latest](#lambda--remediations--amiamnz2latest)
  - [Intro](#intro)
  - [Summary](#summary)
    - [RFC2119](#rfc2119)

## Intro

![Flow](../../../assets/Lambda/AmiAmnz2Latest.png)

## Summary

Returns the Newest Amazon 2 AMI in _this_ region. The criteria are currently:

```python
    data = ec2.describe_images(
        Filters=[
            {'Name': 'name',  'Values': ['amzn2-ami-hvm-2.0.2020*-x86_64-gp2']},
            {'Name': 'state', 'Values': ['available']},
        ],
        Owners=['amazon']
    )
```

### RFC2119

```sh
The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
RFC 2119.
```
