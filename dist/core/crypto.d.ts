/// <reference types="node" />
/// <reference types="node" />
export declare function getChecksum(buffer: Buffer): string;
export declare function generateKeyDerivation(derivation: Buffer, txPubKey: Buffer, secKeyView: Buffer): void;
export declare function derivePublicKey(pubKeySpend: Buffer, derivation: Buffer, outIndex: number, outPubKey: Buffer): void;
export declare function allocateEd25519Scalar(): Buffer;
export declare function allocateEd25519Point(): Buffer;
