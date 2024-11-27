# Zano Utils JS

***

## Overview

This repository contains TypeScript code that performs various cryptographic calculations related to Zano, an open-source cryptocurrency that emphasizes privacy, decentralization,
and scalability. Feel free to utilize this toolkit for developing Zano-specific tasks in other programming languages and to check where something might go wrong. Refer to the tests
to obtain accurate testing data for your functions.

- #### Zano source repository https://github.com/hyle-team/zano

## Methods

- Address encoding and decoding
- Calculating stealth addresses
- Calculating integrated addresses
- Calculating concealing point
- Decrypting encrypted amounts using sender Pedersen commitments
- Asset decoding

## Usage

***

### Importing the Library

```typescript
import { ZanoAddressUtils, ZanoTransactionUtils } from '@badvoice/zano-utils-js';
```

### Usage address utils instance

```typescript
const addressUtils: ZanoAddressUtils = new ZanoAddressUtils();
const getIntegratedAddress: string = addressUtils.getIntegratedAddress('ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH');
```

### Usage transaction utils instance

```typescript
const transactionUtils: ZanoTransactionUtils = new ZanoTransactionUtils();
const getBlindedAsset: string = transactionUtils.getNativeBlindedAsset('secViewKey', 'txPubKey', 1);
```

## For develop

***

### Installation

```yarn install```

### Running the code

To run the code with `ts-node`:

```ts-node src/file.ts```

### Running Tests

Tests are located in the `tests` folder. To run them, use:

```ts-node tests/address.ts```

Use this toolkit to enhance your projects related to the Zano cryptocurrency and to gain a deeper understanding of cryptographic processes.
Useful for polling transactions or building utility functions for implementing your own wallet
