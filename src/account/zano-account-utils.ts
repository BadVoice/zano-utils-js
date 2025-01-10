import {
  SEED_PHRASE_V2_WORDS_COUNT,
  SEED_PHRASE_V1_WORDS_COUNT,
  BRAINWALLET_DEFAULT_SEED_SIZE,
} from './constants';
import {
  AddressValidateResult,
  AccountStructure,
  SpendKeypair,
  AccountKeys,
} from './types';
import { ADDRESS_REGEX } from '../address/constants';
import { ZarcanumAddressKeys } from '../address/types';
import { ZanoAddressUtils } from '../address/zano-address-utils';
import {
  keysFromDefault,
  secretKeyToPublicKey,
  dependentKey,
  generateSeedKeys,
} from '../core/crypto';
import {
  numByWord,
  getTimestampFromWord,
  text2binaryThrow,
} from '../core/mnemonic-encoding';
import { checkSeedChecksum , cryptWithPassInPlace } from '../currency_core/account';


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
      await this.accountValidate(address, keys.publicSpendKey, keys.publicViewKey, keys.secretSpendKey, keys.secretViewKey);
    } catch (error) {
      console.error('Error validating address:', error);
      throw error.message;
    }

    return {
      address,
      ...keys,
    };
  }

  async accountValidate(
    address: string,
    publicSpendKey: string,
    publicViewKey: string,
    secretSpendKey: string,
    secretViewKey: string,
  ): Promise<AddressValidateResult> {

    if (!ADDRESS_REGEX.test(address)) {
      throw new Error('invalid address format') ;
    }

    const { spendPublicKey }: ZarcanumAddressKeys = this.addressUtils.getKeysFromAddress(address);

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

  async restoreSeedPhrase(seedPhrase: string, seedPassword?: string): Promise<SpendKeypair> {
    const words = seedPhrase.trim().split(/\s+/);
    let keysSeedText: string;
    let timestampWord: string | undefined;
    let auditableFlagAndChecksumWord: string | undefined;

    if (words.length === SEED_PHRASE_V1_WORDS_COUNT) {
      timestampWord = words.pop();
    } else if (words.length === SEED_PHRASE_V2_WORDS_COUNT) {
      auditableFlagAndChecksumWord = words.pop();
      timestampWord = words.pop();
    } else {
      throw new Error(`Invalid seed words count: ${words.length}`);
    }

    keysSeedText = words.join(' ');

    let creationTimestamp: number;
    let hasPassword = false;
    try {
      const {
        timestamp,
        passwordUsed,
      } = getTimestampFromWord(timestampWord);
      if (timestamp && passwordUsed) {
        creationTimestamp = timestamp;
        hasPassword = passwordUsed;
      }
    } catch (e) {
      throw new Error('Invalid timestamp word or password');
    }

    if (hasPassword && !seedPassword) {
      throw new Error('Password required but not provided');
    }

    let auditableFlagAndChecksum: number;
    if (auditableFlagAndChecksumWord) {
      try {
        auditableFlagAndChecksum = numByWord(auditableFlagAndChecksumWord);
      } catch (error) {
        throw new Error('Invalid auditable flag');
      }
    }

    console.log('dsgdsg');

    try {
      const keysSeedBinary = text2binaryThrow(keysSeedText);

      if (hasPassword && seedPassword) {
        cryptWithPassInPlace(keysSeedBinary, seedPassword);
      }

      if(auditableFlagAndChecksum != Number.MAX_SAFE_INTEGER) {
        console.log('dsgdsg');
        checkSeedChecksum(auditableFlagAndChecksum, keysSeedBinary, seedPassword, creationTimestamp);
      }

      const spendKeypair: SpendKeypair = keysFromDefault(Buffer.from(keysSeedBinary), 32);
      if (!spendKeypair) {
        throw new Error('Key restoration failed');
      }

      return spendKeypair;
    } catch (e: any) {
      if (e.message === 'text2binary failed') {
        throw new Error('Invalid seed phrase format');
      } else {
        throw new Error('Key derivation failed: ' + e.message);
      }
    }
  }
}
