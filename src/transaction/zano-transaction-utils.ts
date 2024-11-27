import {
  POINT_X,
  NATIVE_ASSET_ID,
  CRYPTO_HDS_OUT_ASSET_BLIND_MASK,
  CRYPTO_HDS_OUT_CONCEALING_POINT,
  CRYPTO_HDS_OUT_AMOUNT_MASK,
} from './constants';
import {
  calculateBlindedAssetId,
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
  getConcealingPoint(viewSecretKey: string, txPubKey: string, outputIndex: number, pubViewKey: string): string {
    const scalarH: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex); // h = Hs(8 * r * V, i)
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
    const amountMask = BigInt(Hs.readBigUInt64LE(0));

    return BigInt(encryptedAmount) ^ amountMask;
  }

  // crypto::point_t(de.asset_id) + asset_blinding_mask * crypto::c_point_X;
  // H = T + s * X
  /*
   Calculate blindedAsset based on native asset id, pointX, blindedMask.
   We will be able to check if the output is native or not
  */
  getNativeBlindedAsset(viewSecretKey: string, txPubKey: string, outputIndex: number): string {
    const h: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex); // h = Hs(8 * r * V, i)
    const s: Buffer = hs(CRYPTO_HDS_OUT_ASSET_BLIND_MASK, h); // Hs(domain_sep, Hs(8 * r * V, i) )

    const blindedAssetId: Buffer = calculateBlindedAssetId(s, NATIVE_ASSET_ID, POINT_X);
    return blindedAssetId.toString('hex');
  }
}
