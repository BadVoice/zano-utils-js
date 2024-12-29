"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZanoAddressUtils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("./constants");
const base58_1 = require("../core/base58");
const crypto_2 = require("../core/crypto");
class ZanoAddressUtils {
    getIntegratedAddress(address) {
        return this.createIntegratedAddress(address, this.generatePaymentId());
    }
    createIntegratedAddress(address, paymentId) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid address format');
        }
        if (!this.validatePaymentId(paymentId)) {
            throw new Error('Invalid payment ID format');
        }
        try {
            const paymentIdBuffer = Buffer.from(paymentId, 'hex');
            const addressDecoded = this.decodeAddress(address);
            if (!addressDecoded) {
                return null;
            }
            return this.formatIntegratedAddress(addressDecoded, paymentIdBuffer);
        }
        catch (error) {
            throw new Error(`Error creating integrated address: ${error.message}`);
        }
    }
    formatIntegratedAddress(addressDecoded, paymentIdBuffer) {
        const { tag, flag, viewPublicKey, spendPublicKey, } = addressDecoded;
        const integratedAddressBuffer = Buffer.concat([
            Buffer.from([tag, flag]),
            viewPublicKey,
            spendPublicKey,
            paymentIdBuffer,
        ]);
        const checksum = this.calculateChecksum(integratedAddressBuffer);
        return (0, base58_1.base58Encode)(Buffer.concat([integratedAddressBuffer, Buffer.from(checksum, 'hex')]));
    }
    decodeAddress(address) {
        try {
            const decodedAddress = (0, base58_1.base58Decode)(address);
            if (!decodedAddress) {
                throw new Error('Invalid decode address');
            }
            let offset = constants_1.TAG_LENGTH + constants_1.FLAG_LENGTH;
            const viewPublicKey = decodedAddress.subarray(offset, offset + constants_1.VIEW_KEY_LENGTH);
            offset += constants_1.VIEW_KEY_LENGTH;
            const spendPublicKey = decodedAddress.subarray(offset, offset + constants_1.SPEND_KEY_LENGTH);
            return {
                tag: constants_1.INTEGRATED_ADDRESS_TAG_PREFIX,
                flag: constants_1.INTEGRATED_ADDRESS_FLAG_PREFIX,
                viewPublicKey,
                spendPublicKey,
            };
        }
        catch (error) {
            throw new Error(`Error decode address: ${error.message}`);
        }
    }
    encodeAddress(tag, flag, spendPublicKey, viewPublicKey) {
        try {
            if (tag < 0) {
                throw new Error('Invalid tag');
            }
            if (flag < 0) {
                throw new Error('Invalid flag');
            }
            let buf = Buffer.from([tag, flag]);
            if (spendPublicKey.length !== 64 && !constants_1.ACCOUNT_KEY_REGEX.test(spendPublicKey)) {
                throw new Error('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
            }
            const spendKey = Buffer.from(spendPublicKey, 'hex');
            if (viewPublicKey.length !== 64 && !constants_1.ACCOUNT_KEY_REGEX.test(viewPublicKey)) {
                throw new Error('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
            }
            const viewKey = Buffer.from(viewPublicKey, 'hex');
            buf = Buffer.concat([buf, spendKey, viewKey]);
            const hash = (0, crypto_2.getChecksum)(buf);
            return (0, base58_1.base58Encode)(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    getMasterAddress(spendPublicKey, viewPublicKey) {
        try {
            const tag = constants_1.ADDRESS_TAG_PREFIX;
            const flag = constants_1.ADDRESS_FLAG_PREFIX;
            if (spendPublicKey.length !== 64 && !constants_1.ACCOUNT_KEY_REGEX.test(spendPublicKey)) {
                throw new Error('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
            }
            if (viewPublicKey.length !== 64 && !constants_1.ACCOUNT_KEY_REGEX.test(viewPublicKey)) {
                throw new Error('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
            }
            const viewPublicKeyBuf = Buffer.from(viewPublicKey, 'hex');
            const spendPublicKeyBuf = Buffer.from(spendPublicKey, 'hex');
            let buf = Buffer.from([tag, flag]);
            buf = Buffer.concat([buf, spendPublicKeyBuf, viewPublicKeyBuf]);
            const hash = (0, crypto_2.getChecksum)(buf);
            return (0, base58_1.base58Encode)(Buffer.concat([buf, Buffer.from(hash, 'hex')]));
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    splitIntegratedAddress(integratedAddress) {
        try {
            if (!constants_1.INTEGRATED_ADDRESS_REGEX.test(integratedAddress)) {
                throw new Error('Invalid integratedAddress: must be a hexadecimal string with a length of 106 whit correct regex');
            }
            const { spendPublicKey, viewPublicKey } = this.getKeysFromAddress(integratedAddress);
            if (!spendPublicKey || !viewPublicKey) {
                throw new Error('spendPublicKey or viewPublicKey are missing');
            }
            const paymentId = (0, base58_1.base58Decode)(integratedAddress).subarray(66, 66 + constants_1.PAYMENT_ID_LENGTH).toString('hex');
            const masterAddress = this.getMasterAddress(spendPublicKey, viewPublicKey);
            return {
                masterAddress,
                paymentId,
            };
        }
        catch (error) {
            throw new Error(`Error decode integrated address: ${error.message}`);
        }
    }
    getKeysFromAddress(address) {
        if (!constants_1.ADDRESS_REGEX.test(address) && !constants_1.INTEGRATED_ADDRESS_REGEX.test(address)) {
            throw new Error('Invalid address format');
        }
        const buf = (0, base58_1.base58Decode)(address);
        if (buf.length !== constants_1.BUFFER_ADDRESS_LENGTH && buf.length !== constants_1.BUFFER_INTEGRATED_ADDRESS_LENGTH) {
            throw new Error('Invalid buffer address length');
        }
        const addressWithoutChecksum = Buffer.from(buf.buffer, 0, buf.length - constants_1.CHECKSUM_LENGTH);
        const checksum = Buffer.from(buf.buffer, buf.length - constants_1.CHECKSUM_LENGTH).toString('hex');
        if (checksum !== (0, crypto_2.getChecksum)(addressWithoutChecksum)) {
            throw new Error('Invalid address checksum');
        }
        const spendPublicKey = Buffer.from(buf.buffer, constants_1.TAG_LENGTH + constants_1.FLAG_LENGTH, constants_1.SPEND_KEY_LENGTH).toString('hex');
        const viewPublicKey = Buffer.from(buf.buffer, constants_1.TAG_LENGTH + constants_1.FLAG_LENGTH + constants_1.SPEND_KEY_LENGTH, constants_1.VIEW_KEY_LENGTH).toString('hex');
        if (!spendPublicKey || spendPublicKey.length !== constants_1.SPEND_KEY_LENGTH * 2 ||
            !viewPublicKey || viewPublicKey.length !== constants_1.VIEW_KEY_LENGTH * 2) {
            throw new Error('Invalid key format in the address.');
        }
        return {
            spendPublicKey,
            viewPublicKey,
        };
    }
    generatePaymentId() {
        return crypto_1.default.randomBytes(constants_1.PAYMENT_ID_LENGTH).toString('hex');
    }
    validatePaymentId(paymentId) {
        return constants_1.PAYMENT_ID_REGEX.test(paymentId);
    }
    validateAddress(address) {
        return constants_1.INTEGRATED_ADDRESS_REGEX.test(address) || constants_1.ADDRESS_REGEX.test(address);
    }
    calculateChecksum(buffer) {
        return (0, crypto_2.getChecksum)(buffer);
    }
}
exports.ZanoAddressUtils = ZanoAddressUtils;
//# sourceMappingURL=zano-address-utils.js.map