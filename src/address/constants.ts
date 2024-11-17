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
export const CURRENCY_PUBLIC_INTEG_ADDRESS_BASE58_PREFIX = 0x3678; // integrated addresses start with 'iZ'

export const PAYMENT_ID_LENGTH = 8;
export const BUFFER_INTEG_ADDRESS_LENGTH: number =
  BUFFER_ADDRESS_LENGTH +
  PAYMENT_ID_LENGTH;
export const INTEGRATED_ADDRESS_REGEX = /^iZ[a-zA-Z0-9]{106}$/;
