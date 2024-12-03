import {
  NATIVE_ASSET_ID,
  POINT_X,
  CRYPTO_HDS_OUT_ASSET_BLIND_MASK,
  CRYPTO_HDS_OUT_AMOUNT_MASK,
  CRYPTO_HDS_OUT_CONCEALING_POINT,
} from './constants';
import {
  chachaCrypt,
  generateKeyImage,
  deriveSecretKey,
  calculateBlindedAssetId,
  derivePublicKey,
  generateKeyDerivation,
  allocateEd25519Point,
  calculateConcealingPoint,
  getDerivationToScalar,
  hs,
} from '../core/crypto';

export class ZanoTransactionUtils {

  // Q = 1/8 * Hs(domain_sep, Hs(8 * r * V, i) ) * 8 * V
  getConcealingPoint(viewSecretKey: string, txPubKey: string, pubViewKey: string, outputIndex: number): string {
    const h: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex); //  Hs(8 * r * V, i)
    const Hs: Buffer = hs(CRYPTO_HDS_OUT_CONCEALING_POINT, h); // Hs(domain_sep, Hs(8 * r * V, i) )

    // point V equal pubViewKey
    const pubViewKeyBuff: Buffer = Buffer.from(pubViewKey, 'hex');

    const concealingPoint: Buffer = calculateConcealingPoint(Hs, pubViewKeyBuff);
    return concealingPoint.toString('hex');
  }

  decodeAmount(viewSecretKey: string, txPubKey: string, encryptedAmount: number, outputIndex: number): bigint {
    const h: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex); //  Hs(8 * r * V, i)
    const Hs: Buffer = hs(CRYPTO_HDS_OUT_AMOUNT_MASK, h); // Hs(domain_sep, Hs(8 * r * V, i) )
    const maskNumber = BigInt(Hs.readBigUInt64LE(0));

    return BigInt(encryptedAmount) ^ maskNumber;
  }

  /*
  * Generates a stealth address for a given transaction using the Dual-key Stealth Address Protocol.
  *
  * This function computes a one-time destination key by combining sender's public transaction key with recipient's view and spend keys.
  * The formula for this stealth address (P_i) is given as P_i = H_s(rV, i)G + S, where:
  * - r is the random scalar multiplication of the transaction public key
  * - V is the recipient's public view key
  * - i is the output index in the transaction
  * - S is the recipient's public spend key
  * - H_s(rV, i) is the hash of the product of r and V and the output index i
  * - G is the base point of the Ed25519 curve
  *
  * @returns {string} The hexadecimal string representation of the ephemeral public key which serves as the one-time stealth address.
  */
  getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string {
    // R = rG
    const txPubKeyBuf: Buffer = Buffer.from(txPubKey, 'hex');
    // v = secret view key
    const secViewKeyBuf: Buffer = Buffer.from(secViewKey, 'hex');
    // S = public spend key
    const pubSpendKeyBuf: Buffer = Buffer.from(pubSpendKey, 'hex');

    const derivation: Buffer = allocateEd25519Point();
    /*
     * Generates a key derivation by performing scalar multiplication using a transaction public key
     * and a secret view key, then multiplies the result by 8.
    */
    generateKeyDerivation(derivation, txPubKeyBuf, secViewKeyBuf);
    const ephemeralPubKey: Buffer = allocateEd25519Point();
    // P_i = H_s(rV, i)G + S
    /*
     * Derives a public key by using a scalar multiplication of a derivation buffer and the hash of a base point (G),
     * then adds a provided public spend key to the result.
    */
    const stealth: Buffer = derivePublicKey(ephemeralPubKey, derivation, outIndex, pubSpendKeyBuf);

    return stealth.toString('hex');
  }

  // crypto::point_t(de.asset_id) + asset_blinding_mask * crypto::c_point_X;
  // H = T + s * X
  /*
   * Calculate blindedAsset based on native asset id, pointX, blindedMask.
   * We will be able to check if the output is native or not
  */
  getNativeBlindedAsset(viewSecretKey: string, txPubKey: string, outputIndex: number): string {
    const h: Buffer = getDerivationToScalar(txPubKey, viewSecretKey, outputIndex); // h = Hs(8 * r * V, i)
    const s: Buffer = hs(CRYPTO_HDS_OUT_ASSET_BLIND_MASK, h); // Hs(domain_sep, Hs(8 * r * V, i) )

    const blindedAssetId: Buffer = calculateBlindedAssetId(s, NATIVE_ASSET_ID, POINT_X);
    return blindedAssetId.toString('hex');
  }

  generateKeyImage(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number, spendSecretKey: string): string {
    const txPubKeyBuf: Buffer = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf: Buffer = Buffer.from(secViewKey, 'hex');
    const pubSpendKeyBuf: Buffer = Buffer.from(pubSpendKey, 'hex');
    const secSpendKeyBuf: Buffer = Buffer.from(spendSecretKey, 'hex');

    const derivation: Buffer = allocateEd25519Point();
    /*
     * Generates a key derivation by performing scalar multiplication using a transaction public key
     * and a secret view key, then multiplies the result by 8.
    */
    generateKeyDerivation(derivation, txPubKeyBuf, secViewKeyBuf);
    const ephemeralPubKey: Buffer = allocateEd25519Point();
    const ephemeralSecKey: Buffer = allocateEd25519Point();
    // P_i = H_s(rV, i)G + S
    /*
     * Derives a public key by using a scalar multiplication of a derivation buffer and the hash of a base point (G),
     * then adds a provided public spend key to the result.
    */
    const secret: Buffer = deriveSecretKey(ephemeralSecKey, derivation, outIndex, secSpendKeyBuf);
    const stealthAddress: Buffer = derivePublicKey(ephemeralPubKey, derivation, outIndex, pubSpendKeyBuf);

    const keyImage: Buffer = generateKeyImage(stealthAddress, secret);
    return keyImage.toString('hex');
  }

  decryptPaymentId(encryptedPaymentId: string, txPubKey: string, secViewKey: string): string {
    const encryptedPaymentIdBuf: Buffer = Buffer.from(encryptedPaymentId, 'hex');
    const txPubKeyBuff: Buffer = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuff: Buffer = Buffer.from(secViewKey, 'hex');

    const derivation: Buffer = allocateEd25519Point();
    generateKeyDerivation(derivation, txPubKeyBuff, secViewKeyBuff);
    const encrypted: Buffer = chachaCrypt(encryptedPaymentIdBuf, derivation);
    return encrypted.toString('hex');
  }
}
