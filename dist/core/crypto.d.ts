/// <reference types="node" />
/// <reference types="node" />
export declare function getChecksum(buffer: Buffer): string;
export declare function getDerivationToScalar(txPubKey: string, secViewKey: string, outIndex: number): Buffer;
export declare function calculateConcealingPoint(Hs: Buffer, pubViewKeyBuff: Buffer): Buffer;
export declare function generateKeyDerivation(derivation: Buffer, txPubKey: Buffer, secKeyView: Buffer): void;
export declare function derivePublicKey(pointG: Buffer, derivation: Buffer, outIndex: number, pubSpendKeyBuf: Buffer): void;
export declare function hs(str32: Buffer, scalar: Buffer): Buffer;
export declare function allocateEd25519Scalar(): Buffer;
export declare function allocateEd25519Point(): Buffer;
