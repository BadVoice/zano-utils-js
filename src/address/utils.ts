import {
  ADDRESS_REGEX,
  FLAG_LENGTH,
  INTEGRATED_ADDRESS_FLAG_PREFIX,
  INTEGRATED_ADDRESS_TAG_PREFIX,
  PAYMENT_ID_REGEX,
  SPEND_KEY_LENGTH,
  TAG_LENGTH,
  VIEW_KEY_LENGTH,
} from './constants';
import { base58Decode } from '../core/base58';

export function decodedAddress(address: string) {
  const decodedAddress: Buffer = base58Decode(address);
  const tag: number = INTEGRATED_ADDRESS_TAG_PREFIX;
  const flag: number = INTEGRATED_ADDRESS_FLAG_PREFIX;
  let offset: number = TAG_LENGTH + FLAG_LENGTH;
  const viewPublicKey: Buffer = decodedAddress.subarray(offset, offset + VIEW_KEY_LENGTH);
  offset += VIEW_KEY_LENGTH;
  const spendPublicKey: Buffer = decodedAddress.subarray(offset, offset + SPEND_KEY_LENGTH);

  return{
    decodedAddress,
    tag,
    flag,
    offset,
    viewPublicKey,
    spendPublicKey,
  };
}

export function paymentIdValidate(paymentId: Buffer) {
  if (paymentId.length !== 8 && !PAYMENT_ID_REGEX.test(paymentId.toString('hex'))) {
    throw new Error('Invalid paymentId: must be a hexadecimal string with a length of 8');
  }
}

export function addressValidate(address: string) {
  if (!ADDRESS_REGEX.test(address) && !ADDRESS_REGEX.test(address)) {
    throw new Error('Invalid address format');
  }
}