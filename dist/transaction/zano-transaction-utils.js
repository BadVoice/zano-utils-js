"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZanoTransactionUtils = void 0;
const constants_1 = require("./constants");
const crypto_1 = require("../core/crypto");
class ZanoTransactionUtils {
    getStealthAddress(txPubKey, secViewKey, pubSpendKey, outIndex) {
        const txPubKeyBuf = Buffer.from(txPubKey, 'hex');
        const secViewKeyBuf = Buffer.from(secViewKey, 'hex');
        const pubSpendKeyBuf = Buffer.from(pubSpendKey, 'hex');
        const derivation = (0, crypto_1.allocateEd25519Point)();
        (0, crypto_1.generateKeyDerivation)(derivation, txPubKeyBuf, secViewKeyBuf);
        const pointG = (0, crypto_1.allocateEd25519Point)();
        (0, crypto_1.derivePublicKey)(pointG, derivation, outIndex, pubSpendKeyBuf);
        return pointG.toString('hex');
    }
    getConcealingPoint(viewSecretKey, txPubKey, outputIndex, pubViewKey) {
        const scalarH = (0, crypto_1.getDerivationToScalar)(txPubKey, viewSecretKey, outputIndex);
        const Hs = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_CONCEALING_POINT, scalarH);
        const pubViewKeyBuff = Buffer.from(pubViewKey, 'hex');
        const concealingPoint = (0, crypto_1.calculateConcealingPoint)(Hs, pubViewKeyBuff);
        return concealingPoint.toString('hex');
    }
    decodeAmount(viewSecretKey, txPubKey, outputIndex, encryptedAmount) {
        const scalarH = (0, crypto_1.getDerivationToScalar)(txPubKey, viewSecretKey, outputIndex);
        const Hs = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_AMOUNT_MASK, scalarH);
        const amountMask = BigInt(Hs.readBigUInt64LE(0));
        return BigInt(encryptedAmount) ^ amountMask;
    }
}
exports.ZanoTransactionUtils = ZanoTransactionUtils;
//# sourceMappingURL=zano-transaction-utils.js.map