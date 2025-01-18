"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountBySeedKey = exports.generateAccountKeys = exports.accountValidate = exports.generateAccount = void 0;
const constants_1 = require("./constants");
const constants_2 = require("../address/constants");
const zano_address_utils_1 = require("../address/zano-address-utils");
const crypto_1 = require("../core/crypto");
async function generateAccount() {
    const keys = await generateAccountKeys();
    if (!keys || !keys.secretSpendKey || !keys.publicSpendKey || !keys.secretViewKey || !keys.publicViewKey) {
        throw new Error('Invalid generated keys');
    }
    const address = (0, zano_address_utils_1.getMasterAddress)(keys.publicSpendKey, keys.publicViewKey);
    try {
        await accountValidate(address, keys.publicSpendKey, keys.publicViewKey, keys.secretSpendKey, keys.secretViewKey);
    }
    catch (error) {
        console.error('Error validating address:', error);
        throw error.message;
    }
    return {
        address,
        ...keys,
    };
}
exports.generateAccount = generateAccount;
async function accountValidate(address, publicSpendKey, publicViewKey, secretSpendKey, secretViewKey) {
    if (!constants_2.ADDRESS_REGEX.test(address)) {
        throw new Error('invalid address format');
    }
    const { spendPublicKey } = (0, zano_address_utils_1.getKeysFromAddress)(address);
    if (spendPublicKey !== publicSpendKey) {
        throw new Error('invalid address keys');
    }
    const secretSpendKeyBuf = Buffer.from(secretSpendKey, 'hex');
    const secViewKey = (0, crypto_1.dependentKey)(secretSpendKeyBuf);
    if (secViewKey !== secretViewKey) {
        throw new Error('invalid depend secret view key');
    }
    const secretViewKeyBuf = Buffer.from(secretViewKey, 'hex');
    const pubViewKey = (0, crypto_1.secretKeyToPublicKey)(secretViewKeyBuf);
    if (pubViewKey !== publicViewKey) {
        throw new Error('pub view key from secret key no equal provided pub view key');
    }
    const pubSpendKey = (0, crypto_1.secretKeyToPublicKey)(secretSpendKeyBuf);
    if (pubSpendKey !== pubSpendKey) {
        throw new Error('pub spend key from secret key no equal provided pub spend key');
    }
    return true;
}
exports.accountValidate = accountValidate;
async function generateAccountKeys() {
    const { secretSpendKey, publicSpendKey, } = (0, crypto_1.generateSeedKeys)(constants_1.BRAINWALLET_DEFAULT_SEED_SIZE);
    if (!secretSpendKey || !publicSpendKey) {
        throw new Error('Error generate seed keys');
    }
    const secretSpendKeyBuf = Buffer.from(secretSpendKey, 'hex');
    const secretViewKey = (0, crypto_1.dependentKey)(secretSpendKeyBuf);
    if (!secretViewKey) {
        throw new Error('Error generate seed keys');
    }
    const secretViewKeyBuf = Buffer.from(secretViewKey, 'hex');
    const publicViewKey = (0, crypto_1.secretKeyToPublicKey)(secretViewKeyBuf);
    return {
        secretSpendKey,
        publicSpendKey,
        secretViewKey,
        publicViewKey,
    };
}
exports.generateAccountKeys = generateAccountKeys;
async function getAccountBySeedKey(secretSpendKey) {
    if (secretSpendKey.length !== 64 || !/^([0-9a-fA-F]{2})+$/) {
        throw new Error('Invalid secret spend key');
    }
    const secretSpendKeyBuf = Buffer.from(secretSpendKey, 'hex');
    const secretViewKey = (0, crypto_1.dependentKey)(secretSpendKeyBuf);
    const publicSpendKey = (0, crypto_1.secretKeyToPublicKey)(secretSpendKeyBuf);
    if (!secretViewKey || !publicSpendKey) {
        throw new Error('Error generate seed keys');
    }
    const secretViewKeyBuf = Buffer.from(secretViewKey, 'hex');
    const publicViewKey = (0, crypto_1.secretKeyToPublicKey)(secretViewKeyBuf);
    return {
        secretSpendKey,
        publicSpendKey,
        secretViewKey,
        publicViewKey,
    };
}
exports.getAccountBySeedKey = getAccountBySeedKey;
//# sourceMappingURL=zano-account-utils.js.map