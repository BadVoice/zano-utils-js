import { BRAINWALLET_DEFAULT_SEED_SIZE } from './constants';
import { SpendKeypair , AccountKeys } from './types';
import {
  secretKeyToPublicKey,
  dependentKey,
  generateSeedKeys,
} from '../core/crypto';


export class ZanoAccountUtils {

  generateAccountKeys(): AccountKeys {
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
