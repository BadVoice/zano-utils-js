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
import { getIntegratedAddress, getNativeBlindedAsset } from '@badvoice/zano-utils-js';
```

### Usage account utils functions

```typescript
const account: AccountStructure = await generateAccount();

const validatedAccount: AddressValidateResult = await accountValidate(
  'ZxC15vh38qHAZbfsUXTpxoiyeLhavbBzsQQk81fEwP4jYxN4qR8SEhMfXkRBpQw6vbbSEGpK2VPVPADnL6h3ZViL29Remh4oH',
  '21dcd98fb9dc392aeabe1d5cfb90faf63840685762448bf49a48d58d0c70bf0b',
  '2ff9e77456d0e65b50d80392a098cddf9032744bd876371fffe95476a92d8564',
  '88609e3bc954fe8b5f1a5f0a7e7e44528835b62890de49000033b28898888d01',
  'b35fb46128f7150ecff93e0eeee80a95ad9b13e3bfced7d3ff7a121f6748df0e',
);

const accountKeys: AccountKeys = await generateAccountKeys();

```

### Usage address utils functions

```typescript
const newIntegratedAddress: string = getIntegratedAddress('ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH');

const splitedIntegratedAddress: SplitedIntegratedAddress = splitIntegratedAddress('iZ2Zi6RmTWwcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTr5HYBGGiL1W8xd5XfY');

const integratedAddress: string = createIntegratedAddress('ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH', 'e87b20bf3ed13a83');

const masterAddress: string = getMasterAddress(
  '21dcd98fb9dc392aeabe1d5cfb90faf63840685762448bf49a48d58d0c70bf0b',
  '2ff9e77456d0e65b50d80392a098cddf9032744bd876371fffe95476a92d8564',
);

const addressKeys: ZarcanumAddressKeys = getKeysFromAddress(
  'ZxC15vh38qHAZbfsUXTpxoiyeLhavbBzsQQk81fEwP4jYxN4qR8SEhMfXkRBpQw6vbbSEGpK2VPVPADnL6h3ZViL29Remh4oH',
);


```

### Usage transaction utils functions

```typescript
const getBlindedAsset: string = getNativeBlindedAsset('secViewKey', 'txPubKey', 1);

const stealthAddress: string = getStealthAddress(
  validPubKey, this.secViewKey, addressKeys.spendPublicKey, index,
);

const concealingPoint: string = getConcealingPoint(
  this.secViewKey, validPubKey, addressKeys.viewPublicKey, index,
);

const decryptedAmount: bigint = decodeAmount(
  this.secViewKey, validPubKey, vout.tx_out_zarcanum.encrypted_amount, index,
);

const keyImage: string = generateKeyImage(
  validPubKey,
  this.secViewKey,
  addressKeys.spendPublicKey,
  index,
  this.secSpendKey,
);

const paymentId: string = decryptPaymentId(
  validPaymentId,
  validPubKey,
  this.secViewKey,
);

const tx: TransactionObject = parseObjectInJson(txResponse.tx_info.object_in_json);

```

## For develop

***

### Installation

```yarn install```

### Running the code

To run the code with `ts-node`:

```ts-node src/file.ts```   

```yarn test```

### Running Tests

Tests are located in the `tests` folder. To run them, use:

```ts-node tests/address.ts```

Use this toolkit to enhance your projects related to the Zano cryptocurrency and to gain a deeper understanding of cryptographic processes.
Useful for polling transactions or building utility functions for implementing your own wallet
