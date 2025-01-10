"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptWithPass = void 0;
const chacha8_1 = require("../core/chacha8");
const crypto_1 = require("../core/crypto");
function cryptWithPass(srcData, password) {
    const key = (0, crypto_1.generateChaCha8Key)(Buffer.from(password));
    const passHash = (0, crypto_1.fastHash)(Buffer.from(password));
    if (passHash.length < 12) {
        throw new Error('Invalid configuration: hash size is less than IV size');
    }
    const iv = Uint8Array.from(passHash.subarray(0, 12));
    const dstData = new Uint8Array(srcData.length);
    (0, chacha8_1.chacha8)(key, iv, srcData, dstData);
    return Buffer.from(dstData);
}
exports.cryptWithPass = cryptWithPass;
//# sourceMappingURL=account.js.map