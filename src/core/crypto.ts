import { randomBytes } from 'crypto';

import BN from 'bn.js';
import { curve } from 'elliptic';
import * as sha3 from 'js-sha3';
import createKeccakHash from 'keccak';
import sodium from 'sodium-javascript';


import { chacha8 } from './chacha8';
import {
  fffb4,
  fffb3,
  sqrtm1,
  fffb2,
  fffb1,
  A,
  ec,
} from './crypto-data';
import {
  reduceScalar,
  encodePoint,
  decodeScalar,
  squareRoot,
  decodeInt,
} from './helpers';
import RedBN from './interfaces';
import { serializeVarUint } from './serialize';
import { SpendKeypair } from '../account/types';

const ADDRESS_CHECKSUM_SIZE = 8;
const EC_POINT_SIZE: number = sodium.crypto_core_ed25519_BYTES;
const EC_SCALAR_SIZE: number = sodium.crypto_core_ed25519_SCALARBYTES;
const ZERO: Buffer = allocateEd25519Scalar();
export const EIGHT: Buffer = allocateEd25519Scalar().fill(8, 0, 1);
export const SCALAR_1DIV8: Buffer = (() => {
  const scalar: Buffer = Buffer.alloc(32);

  scalar.writeBigUInt64LE(BigInt('0x6106e529e2dc2f79'), 0);
  scalar.writeBigUInt64LE(BigInt('0x07d39db37d1cdad0'), 8);
  scalar.writeBigUInt64LE(BigInt('0x0'), 16);
  scalar.writeBigUInt64LE(BigInt('0x0600000000000000'), 24);

  return scalar;
})();
export const HASH_SIZE = 32;

export function getChecksum(buffer: Buffer): string {
  return sha3.keccak_256(buffer).substring(0, ADDRESS_CHECKSUM_SIZE);
}

export function getDerivationToScalar(txPubKey: string, secViewKey: string, outIndex: number): Buffer {
  const txPubKeyBuf: Buffer = Buffer.from(txPubKey, 'hex');
  const secViewKeyBuf: Buffer = Buffer.from(secViewKey, 'hex');

  const sharedSecret: Buffer = allocateEd25519Point();
  generateKeyDerivation(sharedSecret, txPubKeyBuf, secViewKeyBuf);

  const allocatedScalar: Buffer = allocateEd25519Scalar();
  return derivationToScalar(allocatedScalar, sharedSecret, outIndex);
}

/*
  * out.concealing_point = (crypto::hash_helper_t::hs(CRYPTO_HDS_OUT_CONCEALING_POINT, h) * crypto::point_t(apa.view_public_key)).to_public_key(); // Q = 1/8 * Hs(domain_sep, Hs(8 * r * V, i) ) * 8 * V
  * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/currency_core/currency_format_utils.cpp#L1270
 */
export function calculateConcealingPoint(Hs: Buffer, pubViewKeyBuff: Buffer): Buffer {
  const concealingPoint = allocateEd25519Point();
  sodium.crypto_scalarmult_ed25519_noclamp(concealingPoint, Hs, pubViewKeyBuff);
  return concealingPoint;
}

/*
  * crypto::point_t asset_id = blinded_asset_id - asset_id_blinding_mask * crypto::c_point_X; // H = T - s * X
  * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/currency_core/currency_format_utils.cpp#L3289
 */
export function calculateBlindedAssetId(Hs: Buffer, assetId: Buffer, X: Buffer): Buffer {
  const sX: Buffer = allocateEd25519Point();
  sodium.crypto_scalarmult_ed25519_noclamp(sX, Hs, X);

  const pointT: Buffer = allocateEd25519Point();
  sodium.crypto_core_ed25519_add(pointT, assetId, sX);

  const blindedAssetId: Buffer = allocateEd25519Point();
  sodium.crypto_scalarmult_ed25519_noclamp(blindedAssetId, SCALAR_1DIV8, pointT);

  return blindedAssetId;
}

/*
  * generate_key_derivation
  * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L175
 */
export function generateKeyDerivation(derivation: Buffer, txPubKey: Buffer, secKeyView: Buffer): void {
  // Executing the first scalar multiplication without clamping to get the shared secret
  // clamping which typically filters the scalar to a set range.
  sodium.crypto_scalarmult_ed25519_noclamp(derivation, secKeyView, txPubKey);

  // Multiplying the initial derivation by 8, adhering to specific cryptographic protocol requirements
  sodium.crypto_scalarmult_ed25519_noclamp(derivation, EIGHT, derivation);
}

/*
 * derive_public_key
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L207
 */
export function derivePublicKey(
  pointG: Buffer,
  derivation: Buffer,
  outIndex: number,
  pubSpendKeyBuf: Buffer,
): Buffer {
  // Deriving scalar `h` from the provided base point (G), derivation buffer and output index
  const Hs: Buffer = derivationToScalar(pointG, derivation, outIndex); // Hs = Hs(8 * r * V, i)
  /*
   * Scalar multiplication of the base point with the derived scalar to get the intermediary public key
   * Hs(8 * r * V, i)G
  */
  sodium.crypto_scalarmult_ed25519_base_noclamp(pointG, Hs);

  // Hs(8 * r * V, i)G + S
  const P: Buffer = allocateEd25519Point();
  sodium.crypto_core_ed25519_add(P, pubSpendKeyBuf, pointG);
  return P;
}

/*
 * derive_secret_key
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L227
 */
export function deriveSecretKey(
  pointG: Buffer,
  derivation: Buffer,
  outIndex: number,
  secSpendKeyBuf: Buffer): Buffer {
  const Hs: Buffer = derivationToScalar(pointG, derivation, outIndex); // Hs = Hs(8 * r * V, i)

  // x = Hs + s
  const x: Buffer = allocateEd25519Point();
  sodium.crypto_core_ed25519_scalar_add(x, Hs, secSpendKeyBuf);
  return x;
}

/*
  * derivation_to_scalar
  * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L190
 */
export function derivationToScalar(scalar: Buffer, derivation: Buffer, outIndex: number): Buffer {
  const data: Buffer = Buffer.concat([
    derivation,
    serializeVarUint(outIndex),
  ]);
  hashToScalar(scalar, data);
  return scalar;
}

export function fastHash(data: Buffer): Buffer {
  const hash: Buffer = createKeccakHash('keccak256').update(data).digest();
  return hash;
}

/*
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-sugar.h#L1386
 */
export function hs(str32: Buffer, h: Buffer): Buffer {
  const elements: Buffer[] = [str32, h];
  const hashScalar: Buffer = allocateEd25519Scalar();
  const data: Buffer = Buffer.concat(elements);
  hashToScalar(hashScalar, data);
  return hashScalar;
}

/*
 * hash_to_scalar
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L115
 */
export function hashToScalar(scalar: Buffer, data: Buffer): void {
  const hash: Buffer = Buffer.concat([fastHash(data), ZERO]);
  sodium.crypto_core_ed25519_scalar_reduce(scalar, hash);
}

export function allocateEd25519Scalar(): Buffer {
  return Buffer.alloc(EC_SCALAR_SIZE);
}

export function allocateEd25519Point(): Buffer {
  return Buffer.alloc(EC_POINT_SIZE);
}

/*
 * generate_key_image
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L296
 */
export function generateKeyImage(pub: Buffer, sec: Buffer): Buffer {
  const s: BN = decodeScalar(sec, 'Invalid secret key');
  const P1: curve.base.BasePoint = hashToEc(pub);
  const P2: curve.base.BasePoint = P1.mul(s);
  return encodePoint(P2);
}

/*
 * hash_to_ec
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L286
 */
export function hashToEc(ephemeralPubKey: Buffer): curve.base.BasePoint {
  const hash: Buffer = fastHash(ephemeralPubKey);
  const P: curve.edwards.EdwardsPoint = hashToPoint(hash);
  return P.mul(new BN(8).toRed(ec.curve.red));
}

/*
 * ge_fromfe_frombytes_vartime
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops.c#L2209
 */
export function hashToPoint(hash: Buffer): curve.edwards.EdwardsPoint {
  const u: RedBN = decodeInt(hash).toRed(ec.curve.red);
  // v = 2 * u^2
  const v: RedBN = u.redMul(u).redMul(new BN(2).toRed(ec.curve.red));
  // w = 2 * u^2 + 1 = v + 1
  const w: RedBN = v.redAdd(new BN(1).toRed(ec.curve.red));
  // t = w^2 - 2 * A^2 * u^2 = w^2 - A^2 * v
  const t: RedBN = w.redMul(w).redSub(A.redMul(A).redMul(v));
  // x = sqrt( w / w^2 - 2 * A^2 * u^2 ) = sqrt( w / t )
  let x: RedBN = squareRoot(w, t);

  let negative = false;

  // check = w - x^2 * t
  let check: RedBN = w.redSub(x.redMul(x).redMul(t));

  if (!check.isZero()) {
    // check = w + x^2 * t
    check = w.redAdd(x.redMul(x).redMul(t));
    if (!check.isZero()) {
      negative = true;
    } else {
      // x = x * fe_fffb1
      x = x.redMul(fffb1);
    }
  } else {
    // x = x * fe_fffb2
    x = x.redMul(fffb2);
  }

  let odd: boolean;
  let r: RedBN;
  if (!negative) {
    odd = false;
    // r = -2 * A * u^2 = -1 * A * v
    r = A.redNeg().redMul(v);
    // x = x * u
    x = x.redMul(u);
  } else {
    odd = true;
    // r = -1 * A
    r = A.redNeg();
    // check = w - sqrtm1 * x^2 * t
    check = w.redSub(x.redMul(x).redMul(t).redMul(sqrtm1));
    if (!check.isZero()) {
      // check = w + sqrtm1 * x^2 * t
      check = w.redAdd(x.redMul(x).redMul(t).redMul(sqrtm1));
      if (!check.isZero()) {
        throw new TypeError('Invalid point');
      } else {
        x = x.redMul(fffb3);
      }
    } else {
      x = x.redMul(fffb4);
    }
  }

  if (x.isOdd() !== odd) {
    // x = -1 * x
    x = x.redNeg();
  }

  // z = r + w
  const z: RedBN = r.redAdd(w);
  // y = r - w
  const y: RedBN = r.redSub(w);
  // x = x * z
  x = x.redMul(z);

  return ec.curve.point(x, y, z);
}

export function generateChaCha8Key(pass: Buffer) {
  const hash: Buffer = fastHash(pass);
  if (hash.length !== HASH_SIZE) {
    throw new Error('Size of hash must be at least that of chacha8_key');
  }
  return hash;
}

export function chachaCrypt(paymentId: Buffer, derivation: Buffer): Buffer {
  const key: Buffer = generateChaCha8Key(Buffer.from(derivation));
  const iv: Uint8Array = new Uint8Array(Buffer.alloc(12).fill(0));
  const decryptedBuff: Uint8Array = chacha8(key, iv, paymentId);

  return Buffer.from(decryptedBuff);
}

/*
 * keys_from_default
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L88
 */
export function keysFromDefault(aPart: Buffer, keysSeedBinarySize: number): SpendKeypair {
  // aPart == 32 bytes
  const tmp: Buffer = Buffer.alloc(64).fill(0);

  if (!(tmp.length >= keysSeedBinarySize)) {
    throw new Error('size mismatch');
  }

  tmp.set(aPart);

  const hash: Buffer = fastHash(tmp.subarray(0, 32));
  hash.copy(tmp, 32);

  const scalar: BN = decodeInt(tmp);

  const reducedScalarBuff: Buffer = Buffer.alloc(32);
  const reducedScalar: BN = reduceScalar(scalar, ec.curve.n);
  reducedScalar.toBuffer('le', 32).copy(reducedScalarBuff);

  const basePoint: curve.base.BasePoint = ec.curve.g;
  const secretKey: Buffer = reducedScalarBuff.subarray(0, 32);

  const s: BN = decodeScalar(secretKey);

  const P2: curve.base.BasePoint = basePoint.mul(s);

  return {
    publicSpendKey: encodePoint(P2).toString('hex'),
    secretSpendKey: Buffer.from(secretKey).toString('hex'),
  };
}

/*
 * generate_seed_keys
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L108
 */
export function generateSeedKeys(keysSeedBinarySize: number): SpendKeypair {
  const keysSeedBinary: Buffer = randomBytes(keysSeedBinarySize);

  const {
    secretSpendKey,
    publicSpendKey,
  } = keysFromDefault(keysSeedBinary, keysSeedBinarySize);

  return {
    secretSpendKey,
    publicSpendKey,
  };
}

/*
 * dependent_key
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L129
 */
export function dependentKey(secretSpendKey: Buffer): string {
  if (secretSpendKey.length !== 32) {
    throw new Error('Invalid secret spend key');
  }
  const secretViewKey: Buffer = allocateEd25519Point();
  hashToScalar(secretViewKey, secretSpendKey);
  return secretViewKey.toString('hex');
}

/*
 * secret_key_to_public_key
 * https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto.cpp#L165
 */
export function secretKeyToPublicKey(secretViewKey: Buffer): string {
  const s: BN = decodeScalar(secretViewKey, 'Invalid secret key');
  const basePoint: curve.base.BasePoint = ec.curve.g;
  const P2: curve.base.BasePoint = basePoint.mul(s);
  return encodePoint(P2).toString('hex');
}
