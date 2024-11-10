import {
  ADDRESS_LENGTH,
  CHECKSUM_LENGTH,
  FLAG_LENGTH,
  SPEND_KEY_LENGTH,
  TAG_LENGTH,
  VIEW_KEY_LENGTH,
  ADDRESS_REGEX,
} from './constants';
import { ZarcanumAddressKeys } from './types';
import { base58Encode, base58Decode } from '../core/base58';
import {
  derivePublicKey,
  generateKeyDerivation,
  allocateEd25519Point,
  getChecksum,
} from '../core/crypto';

export class ZanoAddressUtils {

  // h * crypto::c_point_G + crypto::point_t(apa.spend_public_key)
  getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string {
    const txPubKeyBuf: Buffer = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf: Buffer = Buffer.from(secViewKey, 'hex');
    const pubSpendKeyBuf: Buffer = Buffer.from(pubSpendKey, 'hex');

    const derivation: Buffer = allocateEd25519Point();
    generateKeyDerivation(derivation, txPubKeyBuf, secViewKeyBuf);
    const c_point_G: Buffer = allocateEd25519Point();
    derivePublicKey(c_point_G, derivation, outIndex, pubSpendKeyBuf);
    return c_point_G.toString('hex');
  }

  encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string {
    let buf: Buffer = Buffer.from([tag, flag]);
    const spendKey: Buffer = Buffer.from(spendPublicKey, 'hex');
    const viewKey: Buffer = Buffer.from(viewPublicKey, 'hex');
    buf = Buffer.concat([buf, spendKey, viewKey]);
    const hash: string = getChecksum(buf);
    return base58Encode(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
  }

  /*
  * Retrieves spend and view keys from the Zano address.
  *
  * @param address Zano address in Base58 format.
  * @returns The object containing the spend and view keys, or throws an error if the address is incorrect.
*/
  getKeysFromZarcanumAddress(address: string): ZarcanumAddressKeys {
    try {
      if (!ADDRESS_REGEX.test(address)) {
        throw new Error('Invalid Address format');
      }

      const buf: Buffer = base58Decode(address);

      if (!buf || !Buffer.isBuffer(buf)) {
        throw new Error('Address decoding error.');
      }

      if (buf.length !== ADDRESS_LENGTH) {
        throw new Error('Invalid address length.');
      }

      const addressWithoutChecksum: Buffer = Buffer.from(buf.buffer,  0, buf.length - CHECKSUM_LENGTH);
      const checksum: string = Buffer.from(buf.buffer,buf.length - CHECKSUM_LENGTH).toString('hex');

      if (checksum !== getChecksum(addressWithoutChecksum)) {
        throw new Error('Invalid address checksum.');
      }

      const spendPublicKey: string = Buffer.from(
        buf.buffer,
        TAG_LENGTH + FLAG_LENGTH,
        SPEND_KEY_LENGTH,
      ).toString('hex');

      const viewPublicKey: string = Buffer.from(
        buf.buffer,
        TAG_LENGTH + FLAG_LENGTH + SPEND_KEY_LENGTH,
        VIEW_KEY_LENGTH,
      ).toString('hex');

      if (!spendPublicKey || spendPublicKey.length !== SPEND_KEY_LENGTH * 2 ||
        !viewPublicKey || viewPublicKey.length !== VIEW_KEY_LENGTH * 2) {
        throw new Error('Invalid key format in the address.');
      }

      return { spendPublicKey, viewPublicKey };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
