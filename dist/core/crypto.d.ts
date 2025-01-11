/// <reference types="node" />
/// <reference types="node" />
import { curve } from 'elliptic';
import { SpendKeypair } from '../account/types';
export declare const SCALAR_1DIV8: Buffer;
export declare const HASH_SIZE = 32;
export declare function getChecksum(buffer: Buffer): string;
export declare function getDerivationToScalar(txPubKey: string, secViewKey: string, outIndex: number): Buffer;
export declare function calculateConcealingPoint(Hs: Buffer, pubViewKeyBuff: Buffer): Buffer;
export declare function calculateBlindedAssetId(Hs: Buffer, assetId: Buffer, X: Buffer): Buffer;
export declare function generateKeyDerivation(txPubKey: Buffer, secKeyView: Buffer): Buffer;
export declare function derivePublicKey(derivation: Buffer, outIndex: number, pubSpendKeyBuf: Buffer): Buffer;
export declare function deriveSecretKey(derivation: Buffer, outIndex: number, sec: Buffer): Buffer;
export declare function derivationToScalar(derivation: Buffer, outIndex: number): Buffer;
export declare function fastHash(data: Buffer): Buffer;
export declare function hs(str32: Buffer, h: Buffer): Buffer;
export declare function hashToScalar(data: Buffer): Buffer;
export declare function reduceScalar32(scalar: Buffer): Buffer;
export declare function calculateKeyImage(pub: Buffer, sec: Buffer): Buffer;
export declare function hashToEc(ephemeralPubKey: Buffer): curve.base.BasePoint;
export declare function hashToPoint(hash: Buffer): curve.edwards.EdwardsPoint;
export declare function generateChaCha8Key(pass: Buffer): Buffer;
export declare function chachaCrypt(paymentId: Buffer, derivation: Buffer): Buffer;
export declare function keysFromDefault(aPart: Buffer, keysSeedBinarySize: number): SpendKeypair;
export declare function generateSeedKeys(keysSeedBinarySize: number): SpendKeypair;
export declare function dependentKey(secretSpendKey: Buffer): string;
export declare function secretKeyToPublicKey(secretViewKey: Buffer): string;
