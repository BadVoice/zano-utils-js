import {
  BUFFER_ADDRESS_LENGTH,
  CHECKSUM_LENGTH,
  FLAG_LENGTH,
  SPEND_KEY_LENGTH,
  TAG_LENGTH,
  VIEW_KEY_LENGTH,
  ADDRESS_REGEX,
} from './constants';
import { ZarcanumAddressKeys } from './types';
import { base58Encode, base58Decode } from '../core/base58';
import { getChecksum } from '../core/crypto';

export class ZanoAddressUtils {

  encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string {
    try {
      if (tag < 0) {
        throw new Error('Invalid tag');
      }
      if (flag < 0) {
        throw new Error('Invalid flag');
      }
      let buf: Buffer = Buffer.from([tag, flag]);

      if (spendPublicKey.length !== 64 && !/^([0-9a-fA-F]{2})+$/.test(spendPublicKey)) {
        throw new Error('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
      }
      const spendKey: Buffer = Buffer.from(spendPublicKey, 'hex');

      if (viewPublicKey.length !== 64 && !/^([0-9a-fA-F]{2})+$/.test(viewPublicKey)) {
        throw new Error('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
      }
      const viewKey: Buffer = Buffer.from(viewPublicKey, 'hex');

      buf = Buffer.concat([buf, spendKey, viewKey]);
      const hash: string = getChecksum(buf);

      return base58Encode(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
    } catch (error) {
      throw new Error(error.message);
    }
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

      if (buf.length !== BUFFER_ADDRESS_LENGTH) {
        throw new Error('Invalid buffer address length');
      }

      const addressWithoutChecksum: Buffer = Buffer.from(buf.buffer,  0, buf.length - CHECKSUM_LENGTH);
      const checksum: string = Buffer.from(buf.buffer,buf.length - CHECKSUM_LENGTH).toString('hex');

      if (checksum !== getChecksum(addressWithoutChecksum)) {
        throw new Error('Invalid address checksum');
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
