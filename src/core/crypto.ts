import * as sha3 from 'js-sha3';

const ADDRESS_CHECKSUM_SIZE = 8;

export function getChecksum(buffer: Buffer) {
  return sha3.keccak_256(buffer).substring(0, ADDRESS_CHECKSUM_SIZE);
}
