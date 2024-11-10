import { CRYPTO_HDS_OUT_CONCEALING_POINT } from './constants';
import {
  calculateConcealingPoint,
  getDerivationToScalar,
  hs,
} from '../core/crypto';

export class ZanoTransactionUtils {

  // Q = 1/8 * Hs(domain_sep, Hs(8 * r * V, i) ) * 8 * V
  getConcealingPoint(view_secret_key: string, tx_pub_key: string, output_index: number, pubViewKey: string): string {
    const h: Buffer = getDerivationToScalar(tx_pub_key, view_secret_key, output_index); //  Hs(8 * r * V, i)
    const Hs: Buffer = hs(CRYPTO_HDS_OUT_CONCEALING_POINT, h); // Hs(domain_sep, Hs(8 * r * V, i) )

    // point V equal pubViewKey
    const pubViewKeyBuff: Buffer = Buffer.from(pubViewKey, 'hex');

    const concealingPoint: Buffer = calculateConcealingPoint(Hs, pubViewKeyBuff);

    return concealingPoint.toString('hex');
  }
}
