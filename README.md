# cloud-cryptographic-wallet

[![GitHub Actions](https://github.com/odanado/aws-kms-provider/workflows/Node%20CI/badge.svg)](https://github.com/odanado/aws-kms-provider)
[![Coverage Status](https://coveralls.io/repos/github/odanado/aws-kms-provider/badge.svg?branch=add-coveralls)](https://coveralls.io/github/odanado/aws-kms-provider?branch=add-coveralls)

`cloud-cryptographic-wallet` is a set of packages to connect crypto libraries with key management systems of various cloud services.
This set of packages allows you to perform signatures and issue transactions without the need to manage private keys.

# Status

## Supported cloud services

- [AWS KMS](https://aws.amazon.com/kms/)
- [Cloud Key Management](https://cloud.google.com/security-key-management)

## Supported crypto libraries

- [web3.js](https://web3js.readthedocs.io/)
- [ethers](https://docs.ethers.io/v5/)

# Packages

|                                                                                     |                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| [@cloud-cryptographic-wallet/ethers-adapter](packages/ethers-adapter)               | Signer of ethers for variety of cloud services    |
| [@cloud-cryptographic-wallet/web3-provider-adapter](packages/web3-provider-adapter) | Provider of Web3.js for variety of cloud services |

# Difference from aws-kms-provider

aws-kms-provider is a package that focuses only on AWS. It has been rebranded to support a variety of cloud services.

|                                                                 |                                               |
| --------------------------------------------------------------- | --------------------------------------------- |
| [aws-kms-signer](aws-kms-packages/aws-kms-signer)               | Signer using AWS KMS without web3.js provider |
| [aws-kms-ethers-signer](aws-kms-packages/aws-kms-ethers-signer) | Signer for ethers.js                          |
