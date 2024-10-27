const UINT64_MAX = 2n ** 64n - 1n;
const UINT64_SIZE = 8;

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_SIZE = BigInt(ALPHABET.length);
const ENCODED_BLOCK_SIZES = [0, 2, 3, 5, 6, 7, 9, 10, 11];
const FULL_DECODED_BLOCK_SIZE = ENCODED_BLOCK_SIZES.length - 1;
const FULL_ENCODED_BLOCK_SIZE = ENCODED_BLOCK_SIZES[FULL_DECODED_BLOCK_SIZE];

const REVERSE_ALPHABET = [];
for (let i = 0; i < ALPHABET.length; i++) {
  REVERSE_ALPHABET[ALPHABET.charCodeAt(i) - ALPHABET.charCodeAt(0)] = i;
}

const DECODED_BLOCK_SIZES = [];
for (let i = 0; i <= FULL_DECODED_BLOCK_SIZE; i++) {
  DECODED_BLOCK_SIZES[ENCODED_BLOCK_SIZES[i]] = i;
}

function bufferToUint64(buffer: Uint8Array) {
  if (!buffer.length || buffer.length > UINT64_SIZE) {
    throw new Error(
      `only a buffer of size between 1 and ${UINT64_SIZE} can be converted `,
    );
  }

  let uint64 = 0n;
  for (let i = 0; i < buffer.length; i++) {
    uint64 = (uint64 << 8n) + BigInt(buffer[i]);
  }

  return uint64;
}

function uint64ToBuffer(buffer: Buffer, uint64: bigint): void {
  if (!buffer.length || buffer.length > UINT64_SIZE) {
    throw new Error(
      'a uint64 can only be converted to a buffer of size between 1 and ' +
      `${UINT64_SIZE}`,
    );
  }

  for (let i = buffer.length - 1; uint64; i--) {
    if (i < 0) {
      throw new Error(
        'buffer size insufficient to represent the uint64',
      );
    }

    buffer[i] = Number(uint64 & 0xffn);
    uint64 >>= 8n;
  }
}

export function encodeBlock(buffer: Uint8Array): string {
  if (!buffer.length || buffer.length > FULL_ENCODED_BLOCK_SIZE) {
    throw new Error(
      'base58 block buffer size must be between 1 and ' +
      `${FULL_ENCODED_BLOCK_SIZE}`,
    );
  }

  const stringSize = ENCODED_BLOCK_SIZES[buffer.length];
  let uint64 = bufferToUint64(buffer);

  let string = '';
  for (let i = stringSize - 1; uint64 && i >= 0; i--) {
    const rem = Number(uint64 % ALPHABET_SIZE);
    uint64 /= ALPHABET_SIZE;
    string = ALPHABET[rem] + string;
  }

  return string.padStart(stringSize, ALPHABET[0]);
}

export function decodeBlock(buffer: Buffer, string: string): void {
  if (!string || string.length > FULL_ENCODED_BLOCK_SIZE) {
    throw new Error(
      'base58 block string size must be between 1 and ' +
      `${FULL_ENCODED_BLOCK_SIZE}`,
    );
  }

  let uint64 = 0n;
  for (let i = 0; i < string.length; i++) {
    const digit = REVERSE_ALPHABET[string.charCodeAt(i) - ALPHABET.charCodeAt(0)];

    if (digit === undefined) {
      throw new Error(
        'base58 string block contains invalid character',
      );
    }

    uint64 = uint64 * ALPHABET_SIZE + BigInt(digit);
  }

  if (uint64 > UINT64_MAX) {
    throw new Error(
      'numeric value of base58 block string overflows uint64',
    );
  }

  uint64ToBuffer(buffer, uint64);
}

export function base58Encode(buffer: Uint8Array): string {
  let string = '';

  for (let start = 0; start < buffer.length;) {
    const end: number = start + FULL_DECODED_BLOCK_SIZE;
    const block: Uint8Array = buffer.subarray(start, end);
    string += encodeBlock(block);
    start = end;
  }

  return string;
}

export function base58Decode(string: string): Buffer {
  const bufferSize: number = Math.floor(string.length / FULL_ENCODED_BLOCK_SIZE) *
    FULL_DECODED_BLOCK_SIZE +
    +DECODED_BLOCK_SIZES[string.length % FULL_ENCODED_BLOCK_SIZE];

  if (!bufferSize) {
    throw new Error(
      'base58 string has an invalid size',
    );
  }

  const buffer = Buffer.alloc(bufferSize);
  for (let startEncoded = 0, startDecoded = 0; startEncoded < string.length;) {
    const endDecoded: number = startDecoded + FULL_DECODED_BLOCK_SIZE;
    const blockDecoded: Buffer = buffer.subarray(startDecoded, endDecoded);

    const endEncoded: number = startEncoded + FULL_ENCODED_BLOCK_SIZE;

    const blockEncoded: string = string.slice(startEncoded, endEncoded);

    decodeBlock(blockDecoded, blockEncoded);

    startDecoded = endDecoded;
    startEncoded = endEncoded;
  }

  return buffer;
}
