/// <reference types="node" />
/// <reference types="node" />
import { Buffer } from 'buffer';
import BN from 'bn.js';
import { curve } from 'elliptic';
import RedBN from './interfaces';
export declare function decodeInt(buf: Buffer): BN;
export declare function squareRoot(u: RedBN, v: RedBN): RedBN;
export declare function decodeScalar(buf: Buffer, message?: string): BN;
export declare function encodePoint(P: curve.base.BasePoint): Buffer;
export declare function reduceScalar(scalar: BN, curveOrder: BN): BN;
export declare function decodePoint(buf: Buffer, message?: string): curve.edwards.EdwardsPoint;
export declare function encodeInt(num: BN): Buffer;
