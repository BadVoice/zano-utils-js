import { CRYPTO_HDS_OUT_CONCEALING_POINT, CRYPTO_HDS_OUT_AMOUNT_MASK } from './constants';
import {
  derivePublicKey,
  generateKeyDerivation,
  allocateEd25519Point,
  calculateConcealingPoint,
  getDerivationToScalar,
  hs,
} from '../core/crypto';

export class ZanoTransactionUtils {

  // h * crypto::c_point_G + crypto::point_t(apa.spend_public_key)
  getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string {
    const txPubKeyBuf: Buffer = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf: Buffer = Buffer.from(secViewKey, 'hex');
    const pubSpendKeyBuf: Buffer = Buffer.from(pubSpendKey, 'hex');

    const derivation: Buffer = allocateEd25519Point();
    generateKeyDerivation(derivation, txPubKeyBuf, secViewKeyBuf);
    const pointG: Buffer = allocateEd25519Point();
    derivePublicKey(pointG, derivation, outIndex, pubSpendKeyBuf);
    return pointG.toString('hex');
  }

  // Q = 1/8 * Hs(domain_sep, Hs(8 * r * V, i) ) * 8 * V
  getConcealingPoint(view_secret_key: string, tx_pub_key: string, output_index: number, pubViewKey: string): string {
    const scalarH: Buffer = getDerivationToScalar(tx_pub_key, view_secret_key, output_index); // h = Hs(8 * r * V, i)
    const Hs: Buffer = hs(CRYPTO_HDS_OUT_CONCEALING_POINT, scalarH); // Hs(domain_sep, Hs(8 * r * V, i) )

    // point V equal pubViewKey
    const pubViewKeyBuff: Buffer = Buffer.from(pubViewKey, 'hex');
    const concealingPoint: Buffer = calculateConcealingPoint(Hs, pubViewKeyBuff);
    return concealingPoint.toString('hex');
  }

  /*
    crypto::scalar_t amount_mask = crypto::hash_helper_t::hs(CRYPTO_HDS_OUT_AMOUNT_MASK, h);
    decoded_amount = zo.encrypted_amount ^ amount_mask.m_u64[0];
   */
  decodeAmount(viewSecretKey: string, txPubKey: string, outputIndex: number, encryptedAmount: number): bigint {
    const scalarH: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex);
    const Hs: Buffer = hs(CRYPTO_HDS_OUT_AMOUNT_MASK, scalarH);
    const amountMask: bigint = BigInt(Hs.readBigUInt64LE(0));

    return BigInt(encryptedAmount) ^ amountMask;
  }
}
