"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObjectInJson = exports.decryptPaymentId = exports.generateKeyImage = exports.getNativeBlindedAsset = exports.getStealthAddress = exports.decodeAmount = exports.getConcealingPoint = void 0;
const constants_1 = require("./constants");
const crypto_1 = require("../core/crypto");
function getConcealingPoint(viewSecretKey, txPubKey, pubViewKey, outputIndex) {
    const h = (0, crypto_1.getDerivationToScalar)(txPubKey, viewSecretKey, outputIndex);
    const Hs = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_CONCEALING_POINT, h);
    const pubViewKeyBuff = Buffer.from(pubViewKey, 'hex');
    const concealingPoint = (0, crypto_1.calculateConcealingPoint)(Hs, pubViewKeyBuff);
    return concealingPoint.toString('hex');
}
exports.getConcealingPoint = getConcealingPoint;
function decodeAmount(viewSecretKey, txPubKey, encryptedAmount, outputIndex) {
    const h = (0, crypto_1.getDerivationToScalar)(txPubKey, viewSecretKey, outputIndex);
    const Hs = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_AMOUNT_MASK, h);
    const maskNumber = BigInt(Hs.readBigUInt64LE(0));
    return BigInt(encryptedAmount) ^ maskNumber;
}
exports.decodeAmount = decodeAmount;
function getStealthAddress(txPubKey, secViewKey, pubSpendKey, outIndex) {
    const txPubKeyBuf = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf = Buffer.from(secViewKey, 'hex');
    const pubSpendKeyBuf = Buffer.from(pubSpendKey, 'hex');
    const derivation = (0, crypto_1.allocateEd25519Point)();
    (0, crypto_1.generateKeyDerivation)(derivation, txPubKeyBuf, secViewKeyBuf);
    const ephemeralPubKey = (0, crypto_1.allocateEd25519Point)();
    const stealth = (0, crypto_1.derivePublicKey)(ephemeralPubKey, derivation, outIndex, pubSpendKeyBuf);
    return stealth.toString('hex');
}
exports.getStealthAddress = getStealthAddress;
function getNativeBlindedAsset(viewSecretKey, txPubKey, outputIndex) {
    const h = (0, crypto_1.getDerivationToScalar)(txPubKey, viewSecretKey, outputIndex);
    const s = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_ASSET_BLIND_MASK, h);
    const blindedAssetId = (0, crypto_1.calculateBlindedAssetId)(s, constants_1.NATIVE_ASSET_ID, constants_1.POINT_X);
    return blindedAssetId.toString('hex');
}
exports.getNativeBlindedAsset = getNativeBlindedAsset;
function generateKeyImage(txPubKey, secViewKey, pubSpendKey, outIndex, spendSecretKey) {
    const txPubKeyBuf = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf = Buffer.from(secViewKey, 'hex');
    const pubSpendKeyBuf = Buffer.from(pubSpendKey, 'hex');
    const secSpendKeyBuf = Buffer.from(spendSecretKey, 'hex');
    const derivation = (0, crypto_1.allocateEd25519Point)();
    (0, crypto_1.generateKeyDerivation)(derivation, txPubKeyBuf, secViewKeyBuf);
    const ephemeralPubKey = (0, crypto_1.allocateEd25519Point)();
    const ephemeralSecKey = (0, crypto_1.allocateEd25519Point)();
    const secret = (0, crypto_1.deriveSecretKey)(ephemeralSecKey, derivation, outIndex, secSpendKeyBuf);
    const stealthAddress = (0, crypto_1.derivePublicKey)(ephemeralPubKey, derivation, outIndex, pubSpendKeyBuf);
    const keyImage = (0, crypto_1.calculateKeyImage)(stealthAddress, secret);
    return keyImage.toString('hex');
}
exports.generateKeyImage = generateKeyImage;
function decryptPaymentId(encryptedPaymentId, txPubKey, secViewKey) {
    const encryptedPaymentIdBuf = Buffer.from(encryptedPaymentId, 'hex');
    const txPubKeyBuff = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuff = Buffer.from(secViewKey, 'hex');
    const derivation = (0, crypto_1.allocateEd25519Point)();
    (0, crypto_1.generateKeyDerivation)(derivation, txPubKeyBuff, secViewKeyBuff);
    const encrypted = (0, crypto_1.chachaCrypt)(encryptedPaymentIdBuf, derivation);
    return encrypted.toString('hex');
}
exports.decryptPaymentId = decryptPaymentId;
function parseObjectInJson(objectInJson) {
    try {
        const decodedData = Buffer.from(objectInJson || '', 'base64').toString();
        const txJson = this.prepareJson(decodedData);
        return JSON.parse(txJson);
    }
    catch (error) {
        console.error('Error parse txJson:', error.message);
        return null;
    }
}
exports.parseObjectInJson = parseObjectInJson;
function prepareJson(decodedData) {
    return decodedData
        .replace(/: ,/g, ': null,')
        .replace(/: \d+"([^"]*)"/g, (match, str) => `: "${str}"`)
        .replace(/: (\d+)/g, ': "$1"');
}
//# sourceMappingURL=zano-transaction-utils.js.map