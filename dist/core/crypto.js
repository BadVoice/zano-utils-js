"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocateEd25519Point = exports.allocateEd25519Scalar = exports.derivePublicKey = exports.generateKeyDerivation = exports.getChecksum = void 0;
const sha3 = __importStar(require("js-sha3"));
const keccak_1 = __importDefault(require("keccak"));
const sodium_native_1 = __importDefault(require("sodium-native"));
const serialize_1 = require("./serialize");
const ADDRESS_CHECKSUM_SIZE = 8;
const EC_POINT_SIZE = sodium_native_1.default.crypto_core_ed25519_BYTES;
const EC_SCALAR_SIZE = sodium_native_1.default.crypto_core_ed25519_SCALARBYTES;
const ZERO = allocateEd25519Scalar();
const EIGHT = allocateEd25519Scalar().fill(8, 0, 1);
function getChecksum(buffer) {
    return sha3.keccak_256(buffer).substring(0, ADDRESS_CHECKSUM_SIZE);
}
exports.getChecksum = getChecksum;
function generateKeyDerivation(derivation, txPubKey, secKeyView) {
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(derivation, secKeyView, txPubKey);
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(derivation, EIGHT, derivation);
}
exports.generateKeyDerivation = generateKeyDerivation;
function derivePublicKey(pubKeySpend, derivation, outIndex, outPubKey) {
    const buffer = pubKeySpend;
    derivationToScalar(buffer, derivation, outIndex);
    sodium_native_1.default.crypto_scalarmult_ed25519_base_noclamp(buffer, buffer);
    sodium_native_1.default.crypto_core_ed25519_add(pubKeySpend, outPubKey, buffer);
}
exports.derivePublicKey = derivePublicKey;
function allocateEd25519Scalar() {
    return Buffer.alloc(EC_SCALAR_SIZE);
}
exports.allocateEd25519Scalar = allocateEd25519Scalar;
function allocateEd25519Point() {
    return Buffer.alloc(EC_POINT_SIZE);
}
exports.allocateEd25519Point = allocateEd25519Point;
function fastHash(data) {
    const hash = (0, keccak_1.default)('keccak256').update(data).digest();
    return hash;
}
function hashToScalar(scalar, data) {
    const hash = Buffer.concat([fastHash(data), ZERO]);
    sodium_native_1.default.crypto_core_ed25519_scalar_reduce(scalar, hash);
}
function derivationToScalar(scalar, derivation, outIndex) {
    const data = Buffer.concat([
        derivation,
        (0, serialize_1.serializeVarUint)(outIndex),
    ]);
    hashToScalar(scalar, data);
}
//# sourceMappingURL=crypto.js.map