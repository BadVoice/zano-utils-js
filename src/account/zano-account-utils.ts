import { BRAINWALLET_DEFAULT_SEED_SIZE } from './constants';
import {
  AddressValidateResult,
  AccountStructure,
  SpendKeypair,
  AccountKeys,
} from './types';
import { ADDRESS_REGEX } from '../address/constants';
import { ZarcanumAddressKeys } from '../address/types';
import { getMasterAddress, getKeysFromAddress } from '../address/zano-address-utils';
import {
  secretKeyToPublicKey,
  dependentKey,
  generateSeedKeys,
} from '../core/crypto';


async function generateAccount(): Promise<AccountStructure> {
  const keys: AccountKeys = await generateAccountKeys();

  if (!keys || !keys.secretSpendKey || !keys.publicSpendKey || !keys.secretViewKey || !keys.publicViewKey) {
    throw new Error('Invalid generated keys');
  }

  const address: string = getMasterAddress(keys.publicSpendKey, keys.publicViewKey);

  try {
    await accountValidate(address, keys.publicSpendKey, keys.publicViewKey, keys.secretSpendKey, keys.secretViewKey);
  } catch (error) {
    console.error('Error validating address:', error);
    throw error.message;
  }

  return {
    address,
    ...keys,
  };
}

async function accountValidate(
  address: string,
  publicSpendKey: string,
  publicViewKey: string,
  secretSpendKey: string,
  secretViewKey: string,
): Promise<AddressValidateResult> {

  if (!ADDRESS_REGEX.test(address)) {
    throw new Error('invalid address format') ;
  }

  const { spendPublicKey }: ZarcanumAddressKeys = getKeysFromAddress(address);

  if (spendPublicKey !== publicSpendKey) {
    throw new Error('invalid address keys');
  }

  const secretSpendKeyBuf: Buffer = Buffer.from(secretSpendKey, 'hex');
  const secViewKey: string = dependentKey(secretSpendKeyBuf);

  if (secViewKey !== secretViewKey) {
    throw new Error('invalid depend secret view key');
  }

  const secretViewKeyBuf: Buffer = Buffer.from(secretViewKey, 'hex');
  const pubViewKey: string = secretKeyToPublicKey(secretViewKeyBuf);

  if (pubViewKey !== publicViewKey) {
    throw new Error('pub view key from secret key no equal provided pub view key');
  }

  const pubSpendKey: string = secretKeyToPublicKey(secretSpendKeyBuf);

  if (pubSpendKey !== pubSpendKey) {
    throw new Error('pub spend key from secret key no equal provided pub spend key');
  }

  return true;
}

async function generateAccountKeys(): Promise<AccountKeys> {
  const {
    secretSpendKey,
    publicSpendKey,
  }: SpendKeypair = generateSeedKeys(BRAINWALLET_DEFAULT_SEED_SIZE);

  if (!secretSpendKey || !publicSpendKey) {
    throw new Error('Error generate seed keys');
  }

  const secretSpendKeyBuf: Buffer = Buffer.from(secretSpendKey, 'hex');
  const secretViewKey: string = dependentKey(secretSpendKeyBuf);

  if (!secretViewKey) {
    throw new Error('Error generate seed keys');
  }

  const secretViewKeyBuf: Buffer = Buffer.from(secretViewKey, 'hex');
  const publicViewKey: string = secretKeyToPublicKey(secretViewKeyBuf);

  return {
    secretSpendKey,
    publicSpendKey,
    secretViewKey,
    publicViewKey,
  };
}

export {
  generateAccount,
  accountValidate,
  generateAccountKeys,
};
