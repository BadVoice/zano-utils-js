"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceScalar = exports.encodePoint = exports.decodeScalar = exports.squareRoot = exports.decodeInt = void 0;
const buffer_1 = require("buffer");
const bn_js_1 = __importDefault(require("bn.js"));
const crypto_data_1 = require("./crypto-data");
function decodeInt(buf) {
    if (typeof buf === 'string') {
        buf = buffer_1.Buffer.from(buf, 'hex');
    }
    return new bn_js_1.default(buf, 'hex', 'le');
}
exports.decodeInt = decodeInt;
function squareRoot(u, v) {
    return u.redMul(v.redPow(new bn_js_1.default(3)))
        .redMul(u.redMul(v.redPow(new bn_js_1.default(7))).redPow(crypto_data_1.ec.curve.p.subn(5).divn(8)));
}
exports.squareRoot = squareRoot;
function decodeScalar(buf, message = 'Invalid scalar') {
    const scalar = decodeInt(buf);
    if (scalar.gte(crypto_data_1.ec.curve.n)) {
        throw new RangeError(message);
    }
    return scalar;
}
exports.decodeScalar = decodeScalar;
function encodePoint(P) {
    return buffer_1.Buffer.from(crypto_data_1.ec.encodePoint(P));
}
exports.encodePoint = encodePoint;
function reduceScalar(scalar, curveOrder) {
    return scalar.mod(curveOrder);
}
exports.reduceScalar = reduceScalar;
//# sourceMappingURL=helpers.js.map