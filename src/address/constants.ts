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
