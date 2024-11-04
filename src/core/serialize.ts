export function serializeVarUint(varuint: number | bigint): Buffer {
  const type = typeof varuint;
  if (
    (type !== 'number' && type !== 'bigint') ||
    (type === 'number' && !Number.isInteger(varuint))
  ) {
    throw new Error(
      'varuint value must be integer-like',
    );
  }

  const bytes = [];

  varuint = BigInt(varuint);
  while (varuint >= 0x80n) {
    const byte = Number((varuint & 0x7fn) | 0x80n);
    bytes.push(byte);
    varuint >>= 7n;
  }

  bytes.push(Number(varuint));

  const buffer: Buffer = Buffer.from(bytes);
  return buffer;
}
