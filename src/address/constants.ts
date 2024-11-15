export const TAG_LENGTH = 1;
export const FLAG_LENGTH = 1;
export const SPEND_KEY_LENGTH = 32;
export const VIEW_KEY_LENGTH = 32;
export const CHECKSUM_LENGTH = 4;
export const BUFFER_ADDRESS_LENGTH: number =
  TAG_LENGTH +
  FLAG_LENGTH +
  SPEND_KEY_LENGTH +
  VIEW_KEY_LENGTH +
  CHECKSUM_LENGTH;
export const ADDRESS_REGEX = /^Z[a-zA-Z0-9]{96}$/;
export const BYTES_FOR_PAYMENT_ID= 8;
export const CURRENCY_PUBLIC_INTEG_ADDRESS_BASE58_PREFIX = 0x3678; // integrated addresses start with 'iZ'
export const CURRENCY_PUBLIC_INTEG_ADDRESS_V2_BASE58_PREFIX = 0x36f8; // integrated addresses start with 'iZ' (new format)
export const CURRENCY_PUBLIC_AUDITABLE_INTEG_ADDRESS_BASE58_PREFIX = 0x8a49; // auditable integrated addresses start with 'aiZX'

export const PAYMENT_ID_LENGTH = 8;
export const BUFFER_INTEG_ADDRESS_LENGTH: number =
  TAG_LENGTH +
  FLAG_LENGTH +
  SPEND_KEY_LENGTH +
  VIEW_KEY_LENGTH +
  CHECKSUM_LENGTH +
  PAYMENT_ID_LENGTH;
export const INTEGRATED_ADDRESS_REGEX = /^iZ[a-zA-Z0-9]{106}$/;
