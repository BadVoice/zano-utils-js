/// <reference types="node" />
/// <reference types="node" />
export declare class BinaryArchive {
    _buffer: Buffer;
    _offset: number;
    constructor(buffer: Buffer);
    get offset(): number;
    eof(): boolean;
    readUint8(): number;
    readUint16(): bigint;
    readUint32(): bigint;
    readVarint(): bigint;
    readString(): string;
    readBlob(size: number): Buffer;
}
