export const CRYPTO_HDS_OUT_AMOUNT_MASK = Buffer.from('ZANO_HDS_OUT_AMOUNT_MASK_______\0', 'ascii');
export const CRYPTO_HDS_OUT_CONCEALING_POINT = Buffer.from('ZANO_HDS_OUT_CONCEALING_POINT__\0', 'ascii');
export const CRYPTO_HDS_OUT_ASSET_BLIND_MASK = Buffer.from('ZANO_HDS_OUT_ASSET_BLIND_MASK__\0', 'ascii');

export const SCALAR_1DIV8: Buffer = (() => {
  const scalar = Buffer.alloc(32);

  scalar.writeBigUInt64LE(BigInt('0x6106e529e2dc2f79'), 0);
  scalar.writeBigUInt64LE(BigInt('0x07d39db37d1cdad0'), 8);
  scalar.writeBigUInt64LE(BigInt('0x0'), 16);
  scalar.writeBigUInt64LE(BigInt('0x0600000000000000'), 24);

  return scalar;
})();
export const POINT_X: Buffer = Buffer.from('3a25bcdb43f5d2c9dd063dc39a9e0987bafc6fcf2df1bc76322d75884a4a3820', 'hex');
export const NATIVE_ASSET_ID: Buffer = Buffer.from(
  'd6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a',
  'hex',
);
