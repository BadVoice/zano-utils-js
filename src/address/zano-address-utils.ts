import crypto from 'crypto';

import {
  PAYMENT_ID_REGEX,
  ADDRESS_TAG_PREFIX,
  ADDRESS_FLAG_PREFIX,
  BUFFER_INTEGRATED_ADDRESS_LENGTH,
  INTEGRATED_ADDRESS_REGEX,
  PAYMENT_ID_LENGTH,
  INTEGRATED_ADDRESS_FLAG_PREFIX,
  INTEGRATED_ADDRESS_TAG_PREFIX,
  BUFFER_ADDRESS_LENGTH,
  CHECKSUM_LENGTH,
  FLAG_LENGTH,
  SPEND_KEY_LENGTH,
  TAG_LENGTH,
  VIEW_KEY_LENGTH,
  ADDRESS_REGEX,
} from './constants';
import {
  AddressValidateResult,
  DecodedAddress,
  ZarcanumAddressKeys,
} from './types';
import { base58Encode, base58Decode } from '../core/base58';
import {
  dependentKey,
  secretKeyToPublicKey,
  getChecksum,
} from '../core/crypto';

export class ZanoAddressUtils {

  getIntegratedAddress(address: string): string {
    return this.createIntegratedAddress(address, this.generatePaymentId());
  }

  createIntegratedAddress(address: string, paymentId: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid address format');
    }

    if (!this.validatePaymentId(paymentId)) {
      throw new Error('Invalid payment ID format');
    }

    try {
      const paymentIdBuffer: Buffer = Buffer.from(paymentId, 'hex');
      const addressDecoded: DecodedAddress = this.decodeAddress(address);

      if (!addressDecoded) {
        return null;
      }

      return this.formatIntegratedAddress(addressDecoded, paymentIdBuffer);
    } catch (error) {
      throw new Error(`Error creating integrated address: ${error.message}`);
    }
  }


  private formatIntegratedAddress(addressDecoded: DecodedAddress, paymentIdBuffer: Buffer): string {
    const {
      tag,
      flag,
      viewPublicKey,
      spendPublicKey,
    }: DecodedAddress = addressDecoded;

    const integratedAddressBuffer: Buffer = Buffer.concat([
      Buffer.from([tag, flag]),
      viewPublicKey,
      spendPublicKey,
      paymentIdBuffer,
    ]);

    const checksum: string = this.calculateChecksum(integratedAddressBuffer);
    return base58Encode(Buffer.concat([integratedAddressBuffer, Buffer.from(checksum, 'hex')]));
  }

  private decodeAddress(address: string): DecodedAddress {
    try {
      const decodedAddress: Buffer = base58Decode(address);
      if (!decodedAddress) {
        throw new Error('Invalid decode address');
      }

      let offset = TAG_LENGTH + FLAG_LENGTH;
      const viewPublicKey: Buffer = decodedAddress.subarray(offset, offset + VIEW_KEY_LENGTH);
      offset += VIEW_KEY_LENGTH;
      const spendPublicKey: Buffer = decodedAddress.subarray(offset, offset + SPEND_KEY_LENGTH);

      return {
        tag: INTEGRATED_ADDRESS_TAG_PREFIX,
        flag: INTEGRATED_ADDRESS_FLAG_PREFIX,
        viewPublicKey,
        spendPublicKey,
      };
    } catch (error) {
      throw new Error(`Error decode address: ${error.message}`);
    }
  }

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

  getMasterAddress(spendPublicKey: string, viewPublicKey: string): string {
    try {
      const tag: number = ADDRESS_TAG_PREFIX;
      const flag: number = ADDRESS_FLAG_PREFIX;

      if (spendPublicKey.length !== 64 && !/^([0-9a-fA-F]{2})+$/.test(spendPublicKey)) {
        throw new Error('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
      }

      if (viewPublicKey.length !== 64 && !/^([0-9a-fA-F]{2})+$/.test(viewPublicKey)) {
        throw new Error('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
      }

      const viewPublicKeyBuf: Buffer = Buffer.from(viewPublicKey, 'hex');
      const spendPublicKeyBuf: Buffer = Buffer.from(spendPublicKey, 'hex');

      let buf: Buffer = Buffer.from([tag, flag]);

      buf = Buffer.concat([buf, spendPublicKeyBuf, viewPublicKeyBuf]);
      const hash: string = getChecksum(buf);

      return base58Encode(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /*
   * Retrieves public spend and view keys from the Zano address.
   *
   * This function decodes a Zano address and Integrated address from its Base58 representation and extracts
   * the spend and view keys contained within it. If the address is not in a valid
   * Base58 format, or if the resulting buffer does not conform to expected length specifics,
   * an error is thrown.
   *
   * @param {string} address - A Zano address and Integrated address in Base58 format.
   * @returns { ZarcanumAddressKeys } An object containing the spend and view keys.
   * @throws { Error } Throws an error if the address format or buffer length is invalid.
 */
  getKeysFromAddress(address: string): ZarcanumAddressKeys {
    if (!ADDRESS_REGEX.test(address) && !INTEGRATED_ADDRESS_REGEX.test(address)) {
      throw new Error('Invalid address format');
    }

    const buf: Buffer = base58Decode(address);

    if (buf.length !== BUFFER_ADDRESS_LENGTH && buf.length !== BUFFER_INTEGRATED_ADDRESS_LENGTH) {
      throw new Error('Invalid buffer address length');
    }

    const addressWithoutChecksum: Buffer = Buffer.from(buf.buffer, 0, buf.length - CHECKSUM_LENGTH);
    const checksum: string = Buffer.from(buf.buffer, buf.length - CHECKSUM_LENGTH).toString('hex');

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

    return {
      spendPublicKey,
      viewPublicKey,
    };
  }

  async addressValidate(
    address: string,
    publicSpendKey: string,
    publicViewKey: string,
    secretSpendKey: string,
    secretViewKey: string,
  ): Promise<AddressValidateResult> {
    const pubKey: string = publicSpendKey.replace(/^0x/, '');

    if (!ADDRESS_REGEX.test(address)) {
      throw new Error('invalid address format') ;
    }

    const { spendPublicKey }: ZarcanumAddressKeys = this.getKeysFromAddress(address);

    if (spendPublicKey !== pubKey) {
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
      throw new Error( 'pub spend key from secret key no equal provided pub spend key');
    }

    return true;
  }

  private generatePaymentId(): string {
    return crypto.randomBytes(PAYMENT_ID_LENGTH).toString('hex');
  }

  private validatePaymentId(paymentId: string): boolean {
    return PAYMENT_ID_REGEX.test(paymentId);
  }

  private validateAddress(address: string): boolean {
    return INTEGRATED_ADDRESS_REGEX.test(address) || ADDRESS_REGEX.test(address);
  }

  private calculateChecksum(buffer: Buffer): string {
    return getChecksum(buffer);
  }
}
