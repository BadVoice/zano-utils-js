"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryArchive = void 0;
class BinaryArchive {
    constructor(buffer) {
        this._buffer = buffer;
        this._offset = 0;
    }
    get offset() {
        return this._offset;
    }
    eof() {
        return this._offset === this._buffer.length;
    }
    readUint8() {
        const value = this._buffer.readUInt8(this._offset);
        this._offset += 1;
        return value;
    }
    readUint16() {
        const value = BigInt(this._buffer.readUInt16LE(this._offset));
        this._offset += 2;
        return value;
    }
    readUint32() {
        const value = BigInt(this._buffer.readUInt32LE(this._offset));
        this._offset += 4;
        return value;
    }
    readVarint() {
        let varint = 0n;
        let shift = 0;
        let byte;
        do {
            byte = this.readUint8();
            varint |= BigInt(byte & 0x7f) << BigInt(shift);
            shift += 7;
            if (shift >= 64) {
                throw new Error('Overflow: Varint exceeds 64 bits.');
            }
        } while ((byte & 0x80) !== 0);
        return varint;
    }
    readString() {
        const length = Number(this.readVarint());
        const str = this._buffer.toString('utf8', this._offset, this._offset + length);
        this._offset += length;
        return str;
    }
    readBlob(size) {
        const blob = this._buffer.subarray(this._offset, this._offset + size);
        this._offset += size;
        return blob;
    }
}
exports.BinaryArchive = BinaryArchive;
//# sourceMappingURL=binary-archive.js.map