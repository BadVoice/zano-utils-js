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
exports.secretKeyToPublicKey = exports.dependentKey = exports.generateSeedKeys = exports.keysFromDefault = exports.chachaCrypt = exports.generateChaCha8Key = exports.hashToPoint = exports.hashToEc = exports.calculateKeyImage = exports.allocateEd25519Point = exports.allocateEd25519Scalar = exports.hashToScalar = exports.hs = exports.fastHash = exports.derivationToScalar = exports.deriveSecretKey = exports.derivePublicKey = exports.generateKeyDerivation = exports.calculateBlindedAssetId = exports.calculateConcealingPoint = exports.getDerivationToScalar = exports.getChecksum = exports.HASH_SIZE = exports.SCALAR_1DIV8 = exports.EIGHT = void 0;
const crypto_1 = require("crypto");
const bn_js_1 = __importDefault(require("bn.js"));
const sha3 = __importStar(require("js-sha3"));
const keccak_1 = __importDefault(require("keccak"));
const sodium_native_1 = __importDefault(require("sodium-native"));
const chacha8_1 = require("./chacha8");
const crypto_data_1 = require("./crypto-data");
const helpers_1 = require("./helpers");
const serialize_1 = require("./serialize");
const ADDRESS_CHECKSUM_SIZE = 8;
const EC_POINT_SIZE = sodium_native_1.default.crypto_core_ed25519_BYTES;
const EC_SCALAR_SIZE = sodium_native_1.default.crypto_core_ed25519_SCALARBYTES;
const ZERO = allocateEd25519Scalar();
exports.EIGHT = allocateEd25519Scalar().fill(8, 0, 1);
exports.SCALAR_1DIV8 = (() => {
    const scalar = Buffer.alloc(32);
    scalar.writeBigUInt64LE(BigInt('0x6106e529e2dc2f79'), 0);
    scalar.writeBigUInt64LE(BigInt('0x07d39db37d1cdad0'), 8);
    scalar.writeBigUInt64LE(BigInt('0x0'), 16);
    scalar.writeBigUInt64LE(BigInt('0x0600000000000000'), 24);
    return scalar;
})();
exports.HASH_SIZE = 32;
function getChecksum(buffer) {
    return sha3.keccak_256(buffer).substring(0, ADDRESS_CHECKSUM_SIZE);
}
exports.getChecksum = getChecksum;
function getDerivationToScalar(txPubKey, secViewKey, outIndex) {
    const txPubKeyBuf = Buffer.from(txPubKey, 'hex');
    const secViewKeyBuf = Buffer.from(secViewKey, 'hex');
    const sharedSecret = allocateEd25519Point();
    generateKeyDerivation(sharedSecret, txPubKeyBuf, secViewKeyBuf);
    const allocatedScalar = allocateEd25519Scalar();
    return derivationToScalar(allocatedScalar, sharedSecret, outIndex);
}
exports.getDerivationToScalar = getDerivationToScalar;
function calculateConcealingPoint(Hs, pubViewKeyBuff) {
    const concealingPoint = allocateEd25519Point();
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(concealingPoint, Hs, pubViewKeyBuff);
    return concealingPoint;
}
exports.calculateConcealingPoint = calculateConcealingPoint;
function calculateBlindedAssetId(Hs, assetId, X) {
    const sX = allocateEd25519Point();
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(sX, Hs, X);
    const pointT = allocateEd25519Point();
    sodium_native_1.default.crypto_core_ed25519_add(pointT, assetId, sX);
    const blindedAssetId = allocateEd25519Point();
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(blindedAssetId, exports.SCALAR_1DIV8, pointT);
    return blindedAssetId;
}
exports.calculateBlindedAssetId = calculateBlindedAssetId;
function generateKeyDerivation(derivation, txPubKey, secKeyView) {
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(derivation, secKeyView, txPubKey);
    sodium_native_1.default.crypto_scalarmult_ed25519_noclamp(derivation, exports.EIGHT, derivation);
}
exports.generateKeyDerivation = generateKeyDerivation;
function derivePublicKey(pointG, derivation, outIndex, pubSpendKeyBuf) {
    const Hs = derivationToScalar(pointG, derivation, outIndex);
    sodium_native_1.default.crypto_scalarmult_ed25519_base_noclamp(pointG, Hs);
    const P = allocateEd25519Point();
    sodium_native_1.default.crypto_core_ed25519_add(P, pubSpendKeyBuf, pointG);
    return P;
}
exports.derivePublicKey = derivePublicKey;
function deriveSecretKey(pointG, derivation, outIndex, secSpendKeyBuf) {
    const Hs = derivationToScalar(pointG, derivation, outIndex);
    const x = allocateEd25519Point();
    sodium_native_1.default.crypto_core_ed25519_scalar_add(x, Hs, secSpendKeyBuf);
    return x;
}
exports.deriveSecretKey = deriveSecretKey;
function derivationToScalar(scalar, derivation, outIndex) {
    const data = Buffer.concat([
        derivation,
        (0, serialize_1.serializeVarUint)(outIndex),
    ]);
    hashToScalar(scalar, data);
    return scalar;
}
exports.derivationToScalar = derivationToScalar;
function fastHash(data) {
    const hash = (0, keccak_1.default)('keccak256').update(data).digest();
    return hash;
}
exports.fastHash = fastHash;
function hs(str32, h) {
    const elements = [str32, h];
    const hashScalar = allocateEd25519Scalar();
    const data = Buffer.concat(elements);
    hashToScalar(hashScalar, data);
    return hashScalar;
}
exports.hs = hs;
function hashToScalar(scalar, data) {
    const hash = Buffer.concat([fastHash(data), ZERO]);
    sodium_native_1.default.crypto_core_ed25519_scalar_reduce(scalar, hash);
}
exports.hashToScalar = hashToScalar;
function allocateEd25519Scalar() {
    return Buffer.alloc(EC_SCALAR_SIZE);
}
exports.allocateEd25519Scalar = allocateEd25519Scalar;
function allocateEd25519Point() {
    return Buffer.alloc(EC_POINT_SIZE);
}
exports.allocateEd25519Point = allocateEd25519Point;
function calculateKeyImage(pub, sec) {
    const s = (0, helpers_1.decodeScalar)(sec, 'Invalid secret key');
    const P1 = hashToEc(pub);
    const P2 = P1.mul(s);
    return (0, helpers_1.encodePoint)(P2);
}
exports.calculateKeyImage = calculateKeyImage;
function hashToEc(ephemeralPubKey) {
    const hash = fastHash(ephemeralPubKey);
    const P = hashToPoint(hash);
    return P.mul(new bn_js_1.default(8).toRed(crypto_data_1.ec.curve.red));
}
exports.hashToEc = hashToEc;
function hashToPoint(hash) {
    const u = (0, helpers_1.decodeInt)(hash).toRed(crypto_data_1.ec.curve.red);
    const v = u.redMul(u).redMul(new bn_js_1.default(2).toRed(crypto_data_1.ec.curve.red));
    const w = v.redAdd(new bn_js_1.default(1).toRed(crypto_data_1.ec.curve.red));
    const t = w.redMul(w).redSub(crypto_data_1.A.redMul(crypto_data_1.A).redMul(v));
    let x = (0, helpers_1.squareRoot)(w, t);
    let negative = false;
    let check = w.redSub(x.redMul(x).redMul(t));
    if (!check.isZero()) {
        check = w.redAdd(x.redMul(x).redMul(t));
        if (!check.isZero()) {
            negative = true;
        }
        else {
            x = x.redMul(crypto_data_1.fffb1);
        }
    }
    else {
        x = x.redMul(crypto_data_1.fffb2);
    }
    let odd;
    let r;
    if (!negative) {
        odd = false;
        r = crypto_data_1.A.redNeg().redMul(v);
        x = x.redMul(u);
    }
    else {
        odd = true;
        r = crypto_data_1.A.redNeg();
        check = w.redSub(x.redMul(x).redMul(t).redMul(crypto_data_1.sqrtm1));
        if (!check.isZero()) {
            check = w.redAdd(x.redMul(x).redMul(t).redMul(crypto_data_1.sqrtm1));
            if (!check.isZero()) {
                throw new TypeError('Invalid point');
            }
            else {
                x = x.redMul(crypto_data_1.fffb3);
            }
        }
        else {
            x = x.redMul(crypto_data_1.fffb4);
        }
    }
    if (x.isOdd() !== odd) {
        x = x.redNeg();
    }
    const z = r.redAdd(w);
    const y = r.redSub(w);
    x = x.redMul(z);
    return crypto_data_1.ec.curve.point(x, y, z);
}
exports.hashToPoint = hashToPoint;
function generateChaCha8Key(pass) {
    const hash = fastHash(pass);
    if (hash.length !== exports.HASH_SIZE) {
        throw new Error('Size of hash must be at least that of chacha8_key');
    }
    return hash;
}
exports.generateChaCha8Key = generateChaCha8Key;
function chachaCrypt(paymentId, derivation) {
    const key = generateChaCha8Key(Buffer.from(derivation));
    const iv = new Uint8Array(Buffer.alloc(12).fill(0));
    const decryptedBuff = (0, chacha8_1.chacha8)(key, iv, paymentId);
    return Buffer.from(decryptedBuff);
}
exports.chachaCrypt = chachaCrypt;
function keysFromDefault(aPart, keysSeedBinarySize) {
    const tmp = Buffer.alloc(64).fill(0);
    if (!(tmp.length >= keysSeedBinarySize)) {
        throw new Error('size mismatch');
    }
    tmp.set(aPart);
    const hash = fastHash(tmp.subarray(0, 32));
    hash.copy(tmp, 32);
    const scalar = (0, helpers_1.decodeInt)(tmp);
    const reducedScalarBuff = Buffer.alloc(32);
    const reducedScalar = (0, helpers_1.reduceScalar)(scalar, crypto_data_1.ec.curve.n);
    reducedScalar.toBuffer('le', 32).copy(reducedScalarBuff);
    const basePoint = crypto_data_1.ec.curve.g;
    const secretKey = reducedScalarBuff.subarray(0, 32);
    const s = (0, helpers_1.decodeScalar)(secretKey);
    const P2 = basePoint.mul(s);
    return {
        publicSpendKey: (0, helpers_1.encodePoint)(P2).toString('hex'),
        secretSpendKey: Buffer.from(secretKey).toString('hex'),
    };
}
exports.keysFromDefault = keysFromDefault;
function generateSeedKeys(keysSeedBinarySize) {
    const keysSeedBinary = (0, crypto_1.randomBytes)(keysSeedBinarySize);
    const { secretSpendKey, publicSpendKey, } = keysFromDefault(keysSeedBinary, keysSeedBinarySize);
    return {
        secretSpendKey,
        publicSpendKey,
    };
}
exports.generateSeedKeys = generateSeedKeys;
function dependentKey(secretSpendKey) {
    if (secretSpendKey.length !== 32) {
        throw new Error('Invalid secret spend key');
    }
    const secretViewKey = allocateEd25519Point();
    hashToScalar(secretViewKey, secretSpendKey);
    return secretViewKey.toString('hex');
}
exports.dependentKey = dependentKey;
function secretKeyToPublicKey(secretViewKey) {
    const s = (0, helpers_1.decodeScalar)(secretViewKey, 'Invalid secret key');
    const basePoint = crypto_data_1.ec.curve.g;
    const P2 = basePoint.mul(s);
    return (0, helpers_1.encodePoint)(P2).toString('hex');
}
exports.secretKeyToPublicKey = secretKeyToPublicKey;
//# sourceMappingURL=crypto.js.map