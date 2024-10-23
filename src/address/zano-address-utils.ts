import { base58Encode, base58Decode } from '../core/base58';
import { getChecksum } from '../core/crypto';

export class ZanoAddressUtils {
  encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string {
    let buf: Buffer = Buffer.from([tag, flag]);
    const spendKey: Buffer = Buffer.from(spendPublicKey, 'hex');
    const viewKey: Buffer = Buffer.from(viewPublicKey, 'hex');
    buf = Buffer.concat([buf, spendKey, viewKey]);
    const hash: string = getChecksum(buf);
    return base58Encode(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
  }

  getKeysFromZarcanumAddress(address: string): { spendPublicKey: string, viewPublicKey: string } | null {
    try {
      const buf: Buffer = base58Decode(address);

      // Checking the length of the decoded buffer
      if (buf.length !== 70) { // 2 (tag + flag) + 32 (spendKey) + 32 (viewKey) + 4 (checksum)
        console.warn('The length of the zarcanum address buffer is not correct')
        return null;
      }

      // Checking the length of the checksum
      const checksum: string = buf.slice(-4).toString('hex');
      const data: Buffer = buf.slice(0, -4);
      if (checksum !== getChecksum(data)) {
        return null;
      }

      const [tag, flag] = buf;
      const spendPublicKey: string = buf.slice(2, 34).toString('hex');
      const viewPublicKey: string = buf.slice(34, 66).toString('hex');

      return { spendPublicKey, viewPublicKey };
    } catch (error) {
      console.error('Error decode address', error.message);
      return null;
    }
  }
}
