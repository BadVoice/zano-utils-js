import * as sha3 from 'js-sha3';
import createKeccakHash from 'keccak';
import sodium from 'sodium-native';

import { serializeVarUint } from './serialize';

const ADDRESS_CHECKSUM_SIZE = 8;
const EC_POINT_SIZE: number = sodium.crypto_core_ed25519_BYTES;
const EC_SCALAR_SIZE: number = sodium.crypto_core_ed25519_SCALARBYTES;
const ZERO: Buffer = allocateEd25519Scalar();
const EIGHT: Buffer = allocateEd25519Scalar().fill(8, 0, 1);

export function getChecksum(buffer: Buffer): string {
  return sha3.keccak_256(buffer).substring(0, ADDRESS_CHECKSUM_SIZE);
}

export function generateKeyDerivation(derivation: Buffer, txPubKey: Buffer, secKeyView: Buffer): void {
  sodium.crypto_scalarmult_ed25519_noclamp(derivation, secKeyView, txPubKey);
  sodium.crypto_scalarmult_ed25519_noclamp(derivation, EIGHT, derivation);
}

export function derivePublicKey(
  pubKeySpend: Buffer,
  derivation: Buffer,
  outIndex: number,
  outPubKey: Buffer,
): void {
  const buffer = pubKeySpend;
  derivationToScalar(buffer, derivation, outIndex);
  sodium.crypto_scalarmult_ed25519_base_noclamp(buffer, buffer);
  sodium.crypto_core_ed25519_add(pubKeySpend, outPubKey, buffer);
}

export function allocateEd25519Scalar(): Buffer {
  return Buffer.alloc(EC_SCALAR_SIZE);
}

export function allocateEd25519Point(): Buffer {
  return Buffer.alloc(EC_POINT_SIZE);
}

function fastHash(data: Buffer): Buffer {
  const hash: Buffer = createKeccakHash('keccak256').update(data).digest();
  return hash;
}

function hashToScalar(scalar: Buffer, data: Buffer): void {
  const hash: Buffer = Buffer.concat([fastHash(data), ZERO]);
  sodium.crypto_core_ed25519_scalar_reduce(scalar, hash);
}

function derivationToScalar(scalar: Buffer, derivation: Buffer, outIndex: number): void {
  const data = Buffer.concat([
    derivation,
    serializeVarUint(outIndex),
  ]);

  hashToScalar(scalar, data);
}
