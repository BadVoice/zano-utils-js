/// <reference types="node" />
/// <reference types="node" />
export declare const NUMWORDS = 1626;
export declare function binary2text(binary: Buffer): string;
export declare function getWordFromTimestamp(timestamp: number, usePassword: boolean): string;
export declare function wordByNum(n: number): string;
export declare function getTimestampFromWord(word: string): {
    timestamp: number;
    passwordUsed: boolean;
};
export declare function numByWord(w: string): number;
export declare function text2binaryThrow(text: string): Uint8Array;
