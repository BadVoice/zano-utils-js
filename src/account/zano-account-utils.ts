import { BRAINWALLET_DEFAULT_SEED_SIZE } from './constants';
import {
  AccountStructure,
  SpendKeypair,
  AccountKeys,
} from './types';
import { ZanoAddressUtils } from '../address/zano-address-utils';
import {
  secretKeyToPublicKey,
  dependentKey,
  generateSeedKeys,
} from '../core/crypto';


export class ZanoAccountUtils {
  private addressUtils: ZanoAddressUtils;

  constructor() {
    this.addressUtils = new ZanoAddressUtils();
  }

  async generateAccount(): Promise<AccountStructure> {
    const keys: AccountKeys = await this.generateAccountKeys();

    if (!keys || !keys.secretSpendKey || !keys.publicSpendKey || !keys.secretViewKey || !keys.publicViewKey) {
      throw new Error('Invalid generated keys');
    }

    const address: string = this.addressUtils.getMasterAddress(keys.publicSpendKey, keys.publicViewKey);

    try {
      await this.addressUtils.addressValidate(address, keys.publicSpendKey, keys.publicViewKey, keys.secretSpendKey, keys.secretViewKey);
    } catch (error) {
      console.error('Error validating address:', error);
      throw error.message;
    }

    return {
      address,
      ...keys,
    };
  }

  async generateAccountKeys(): Promise<AccountKeys> {
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
}
