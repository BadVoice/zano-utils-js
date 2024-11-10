"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZanoTransactionUtils = void 0;
const constants_1 = require("./constants");
const crypto_1 = require("../core/crypto");
class ZanoTransactionUtils {
    getConcealingPoint(view_secret_key, tx_pub_key, output_index, pubViewKey) {
        const h = (0, crypto_1.getDerivationToScalar)(tx_pub_key, view_secret_key, output_index);
        const Hs = (0, crypto_1.hs)(constants_1.CRYPTO_HDS_OUT_CONCEALING_POINT, h);
        const pubViewKeyBuff = Buffer.from(pubViewKey, 'hex');
        const concealingPoint = (0, crypto_1.calculateConcealingPoint)(Hs, pubViewKeyBuff);
        return concealingPoint.toString('hex');
    }
}
exports.ZanoTransactionUtils = ZanoTransactionUtils;
//# sourceMappingURL=zano-transaction-utils.js.map