"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZanoAccountUtils = void 0;
const constants_1 = require("./constants");
const constants_2 = require("../address/constants");
const zano_address_utils_1 = require("../address/zano-address-utils");
const crypto_1 = require("../core/crypto");
class ZanoAccountUtils {
    constructor() {
        this.addressUtils = new zano_address_utils_1.ZanoAddressUtils();
    }
    async generateAccount() {
        const keys = await this.generateAccountKeys();
        if (!keys || !keys.secretSpendKey || !keys.publicSpendKey || !keys.secretViewKey || !keys.publicViewKey) {
            throw new Error('Invalid generated keys');
        }
        const address = this.addressUtils.getMasterAddress(keys.publicSpendKey, keys.publicViewKey);
        try {
            await this.accountValidate(address, keys.publicSpendKey, keys.publicViewKey, keys.secretSpendKey, keys.secretViewKey);
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
    async accountValidate(address, publicSpendKey, publicViewKey, secretSpendKey, secretViewKey) {
        if (!constants_2.ADDRESS_REGEX.test(address)) {
            throw new Error('invalid address format');
        }
        const { spendPublicKey } = this.addressUtils.getKeysFromAddress(address);
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
    async generateAccountKeys() {
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
}
exports.ZanoAccountUtils = ZanoAccountUtils;
//# sourceMappingURL=zano-account-utils.js.map