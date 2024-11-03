"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZanoAddressUtils = void 0;
const constants_1 = require("./constants");
const base58_1 = require("../core/base58");
const crypto_1 = require("../core/crypto");
class ZanoAddressUtils {
    getStealthAddress(txPubKey, secViewKey, pubSpendKey, outIndex) {
        const txPubKeyBuf = Buffer.from(txPubKey, 'hex');
        const secViewKeyBuf = Buffer.from(secViewKey, 'hex');
        const pubSpendKeyBuf = Buffer.from(pubSpendKey, 'hex');
        const derivation = (0, crypto_1.allocateEd25519Point)();
        (0, crypto_1.generateKeyDerivation)(derivation, txPubKeyBuf, secViewKeyBuf);
        const stealthAddress = (0, crypto_1.allocateEd25519Point)();
        (0, crypto_1.derivePublicKey)(stealthAddress, derivation, outIndex, pubSpendKeyBuf);
        return stealthAddress.toString('hex');
    }
    encodeAddress(tag, flag, spendPublicKey, viewPublicKey) {
        let buf = Buffer.from([tag, flag]);
        const spendKey = Buffer.from(spendPublicKey, 'hex');
        const viewKey = Buffer.from(viewPublicKey, 'hex');
        buf = Buffer.concat([buf, spendKey, viewKey]);
        const hash = (0, crypto_1.getChecksum)(buf);
        return (0, base58_1.base58Encode)(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
    }
    getKeysFromZarcanumAddress(address) {
        try {
            if (!constants_1.ADDRESS_REGEX.test(address)) {
                throw new Error('Invalid Address format');
            }
            const buf = (0, base58_1.base58Decode)(address);
            if (!buf || !Buffer.isBuffer(buf)) {
                throw new Error('Address decoding error.');
            }
            if (buf.length !== constants_1.ADDRESS_LENGTH) {
                throw new Error('Invalid address length.');
            }
            const addressWithoutChecksum = Buffer.from(buf.buffer, 0, buf.length - constants_1.CHECKSUM_LENGTH);
            const checksum = Buffer.from(buf.buffer, buf.length - constants_1.CHECKSUM_LENGTH).toString('hex');
            if (checksum !== (0, crypto_1.getChecksum)(addressWithoutChecksum)) {
                throw new Error('Invalid address checksum.');
            }
            const spendPublicKey = Buffer.from(buf.buffer, constants_1.TAG_LENGTH + constants_1.FLAG_LENGTH, constants_1.SPEND_KEY_LENGTH).toString('hex');
            const viewPublicKey = Buffer.from(buf.buffer, constants_1.TAG_LENGTH + constants_1.FLAG_LENGTH + constants_1.SPEND_KEY_LENGTH, constants_1.VIEW_KEY_LENGTH).toString('hex');
            if (!spendPublicKey || spendPublicKey.length !== constants_1.SPEND_KEY_LENGTH * 2 ||
                !viewPublicKey || viewPublicKey.length !== constants_1.VIEW_KEY_LENGTH * 2) {
                throw new Error('Invalid key format in the address.');
            }
            return { spendPublicKey, viewPublicKey };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}
exports.ZanoAddressUtils = ZanoAddressUtils;
//# sourceMappingURL=zano-address-utils.js.map