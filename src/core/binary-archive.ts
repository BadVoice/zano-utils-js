export class BinaryArchive {
  public _buffer: Buffer;
  public _offset: number;

  constructor(buffer: Buffer) {
    this._buffer = buffer;
    this._offset = 0;
  }

  get offset(): number {
    return this._offset;
  }

  eof(): boolean {
    return this._offset === this._buffer.length;
  }

  readUint8(): number {
    const value: number = this._buffer.readUInt8(this._offset);
    this._offset += 1;
    return value;
  }

  readUint16(): bigint {
    const value = BigInt(this._buffer.readUInt16LE(this._offset));
    this._offset += 2;
    return value;
  }

  readUint32(): bigint {
    const value = BigInt(this._buffer.readUInt32LE(this._offset));
    this._offset += 4;
    return value;
  }

  /**
   *
   * @see https://github.com/hyle-team/zano/blob/69a5d42d9908b7168247e103b2b40aae8c1fb3f5/src/common/varint.h#L59
   */
  readVarint(): bigint {
    let varint = 0n;
    let shift = 0;
    let byte: number;

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

  readString(): string {
    const length = Number(this.readVarint());
    const str: string = this._buffer.toString('utf8', this._offset, this._offset + length);
    this._offset += length;
    return str;
  }

  readBlob(size: number): Buffer {
    const blob: Buffer = this._buffer.subarray(this._offset, this._offset + size);
    this._offset += size;
    return blob;
  }
}
