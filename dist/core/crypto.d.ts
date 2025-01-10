/// <reference types="node" />
/// <reference types="node" />
import { curve } from 'elliptic';
import { SpendKeypair } from '../account/types';
export declare const EIGHT: Buffer;
export declare const SCALAR_1DIV8: Buffer;
export declare const HASH_SIZE = 32;
export declare function getChecksum(buffer: Buffer): string;
export declare function getDerivationToScalar(txPubKey: string, secViewKey: string, outIndex: number): Buffer;
export declare function calculateConcealingPoint(Hs: Buffer, pubViewKeyBuff: Buffer): Buffer;
export declare function calculateBlindedAssetId(Hs: Buffer, assetId: Buffer, X: Buffer): Buffer;
export declare function generateKeyDerivation(derivation: Buffer, txPubKey: Buffer, secKeyView: Buffer): void;
export declare function derivePublicKey(pointG: Buffer, derivation: Buffer, outIndex: number, pubSpendKeyBuf: Buffer): Buffer;
export declare function deriveSecretKey(pointG: Buffer, derivation: Buffer, outIndex: number, secSpendKeyBuf: Buffer): Buffer;
export declare function derivationToScalar(scalar: Buffer, derivation: Buffer, outIndex: number): Buffer;
export declare function fastHash(data: Buffer): Buffer;
export declare function hs(str32: Buffer, h: Buffer): Buffer;
export declare function hashToScalar(scalar: Buffer, data: Buffer): void;
export declare function allocateEd25519Scalar(): Buffer;
export declare function allocateEd25519Point(): Buffer;
export declare function calculateKeyImage(pub: Buffer, sec: Buffer): Buffer;
export declare function hashToEc(ephemeralPubKey: Buffer): curve.base.BasePoint;
export declare function hashToPoint(hash: Buffer): curve.edwards.EdwardsPoint;
export declare function generateChaCha8Key(pass: Buffer): Buffer;
export declare function chachaCrypt(paymentId: Buffer, derivation: Buffer): Buffer;
export declare function keysFromDefault(aPart: Buffer, keysSeedBinarySize: number): SpendKeypair;
export declare function generateSeedKeys(keysSeedBinarySize: number): SpendKeypair;
export declare function dependentKey(secretSpendKey: Buffer): string;
export declare function secretKeyToPublicKey(secretViewKey: Buffer): string;
