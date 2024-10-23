import { base58Encode } from '../core/base58';
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
}