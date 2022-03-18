# T-Rex SMILE®

- [T-Rex SMILE®](#t-rex-smile)
  - [Badges](#badges)
  - [Distributions](#distributions)
  - [Intro](#intro)
    - [Greenfield](#greenfield)
    - [Brownfield](#brownfield)
  - [Description](#description)
  - [Contributing](#contributing)
  - [Code of Conduct](#code-of-conduct)
  - [Changes](#changes)
  - [Release Notes](#release-notes)
  - [Author](#author)

## Badges

[![License](https://img.shields.io/badge/License-Apache%202.0-yellowgreen.svg)](https://opensource.org/licenses/Apache-2.0)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/trexsolutions/smile-cdk)
[![Mergify](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/trexsolutions/smile-cdk/&style=flat)](https://mergify.io)
![Build](https://github.com/trexsolutions/smile-cdk/workflows/Build/badge.svg)
![Release](https://github.com/trexsolutions/smile-cdk/workflows/Release/badge.svg)

## Distributions

[![npm version](https://badge.fury.io/js/smile-cdk.svg)](https://badge.fury.io/js/smile-cdk)
[![PyPI version](https://badge.fury.io/py/smile-cdk.svg)](https://badge.fury.io/py/smile-cdk)
[![NuGet version](https://badge.fury.io/nu/trexsolutions.SmileCDK.svg)](https://badge.fury.io/nu/trexsolutions.SmileCDK)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/trexsolutions.SmileCDK/SmileCDK/badge.svg)](https://maven-badges.herokuapp.com/maven-central/trexsolutions.SmileCDK/SmileCDK)

## Intro

This the cornerstone of **T-Rex Solutions LLC's (T-REX)**
**Centers of Excellence (COE)** _Technology Lab Projects (TLP)_.

### Greenfield

The Account Vending Machine (AVM) is responsible for making the
Landing Zone Hubs and Spokes and handing them off to the provisioner.

The provisioner, **this application**, is an `AWS CDK (node js)` app, will deploy
the 4 Stacks after receiving them from the AVM.

This requires bootstrapping the Central Account via your laptop. v2.0.0
will feature an AWS Marketplace Entry

### Brownfield

Directly provision an account you can login to with `AdministratorAccess`.
This needs to be battle tested with many different environments; however,
it does work in MANY environments.

## Description

**T-Rex SMILE®** enables faster, simpler, more secure, and cheaper cloud
migrations by providing **Secured, Managed Infrastructures, Landing Zones, and
Environments** (_SMILE)_ via **Infrastructure as Code (IaC)** and **Continuous
Configuration Automation (CCA)** that aligns to current best practices as a
pre-built solution.

## Contributing

- [How to Contribute](https://github.com/trexsolutions/smile-docs/blob/main/README.md)

## Code of Conduct

- [Code of Conduct](CODE_OF_CONDUCT.md)

## Changes

- [Change Log](CHANGELOG.md)

## Release Notes

Only for GA Major Releases

- [RELNOTES](RELNOTES.md)

## Author

- Philip M. Gollucci <philip.gollucci@trexsolutionsllc.com>
- Ed Shields <ed.shields@trexsolutionsllc.com>




