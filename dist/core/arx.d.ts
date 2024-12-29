export type TypedArray = Int8Array | Uint8ClampedArray | Uint8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;
export declare const u32: (arr: TypedArray) => Uint32Array;
export declare function clean(...arrays: TypedArray[]): void;
export declare function copyBytes(bytes: Uint8Array): Uint8Array;
export declare function rotl(a: number, b: number): number;
export type CipherCoreFn = (sigma: Uint32Array, key: Uint32Array, nonce: Uint32Array, output: Uint32Array, counter: number, rounds?: number) => void;
export type ExtendNonceFn = (sigma: Uint32Array, key: Uint32Array, input: Uint32Array, output: Uint32Array) => void;
export type CipherOpts = {
    allowShortKeys?: boolean;
    extendNonceFn?: ExtendNonceFn;
    counterLength?: number;
    counterRight?: boolean;
    rounds?: number;
};
type EmptyObj = {};
export declare function checkOpts<T1 extends EmptyObj, T2 extends EmptyObj>(defaults: T1, opts: T2): T1 & T2;
export type XorStream = (key: Uint8Array, nonce: Uint8Array, data: Uint8Array, output?: Uint8Array, counter?: number) => Uint8Array;
export declare function createCipher(core: CipherCoreFn, opts: CipherOpts): XorStream;
export {};
