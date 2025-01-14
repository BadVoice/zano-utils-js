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
exports.secretKeyToPublicKey = exports.dependentKey = exports.generateSeedKeys = exports.keysFromDefault = exports.chachaCrypt = exports.generateChaCha8Key = exports.hashToPoint = exports.hashToEc = exports.calculateKeyImage = exports.reduceScalar32 = exports.hashToScalar = exports.hs = exports.fastHash = exports.derivationToScalar = exports.deriveSecretKey = exports.derivePublicKey = exports.generateKeyDerivation = exports.calculateBlindedAssetId = exports.calculateConcealingPoint = exports.getDerivationToScalar = exports.getChecksum = exports.HASH_SIZE = exports.SCALAR_1DIV8 = void 0;
const crypto_1 = require("crypto");
const bn_js_1 = __importDefault(require("bn.js"));
const sha3 = __importStar(require("js-sha3"));
const keccak_1 = __importDefault(require("keccak"));
const chacha8_1 = require("./chacha8");
const crypto_data_1 = require("./crypto-data");
const helpers_1 = require("./helpers");
const serialize_1 = require("./serialize");
const ADDRESS_CHECKSUM_SIZE = 8;
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
    const sharedSecret = generateKeyDerivation(txPubKeyBuf, secViewKeyBuf);
    return derivationToScalar(sharedSecret, outIndex);
}
exports.getDerivationToScalar = getDerivationToScalar;
function calculateConcealingPoint(Hs, pubViewKeyBuff) {
    const scalar = (0, helpers_1.decodeScalar)(Hs, 'Invalid sсalar');
    const P = (0, helpers_1.decodePoint)(pubViewKeyBuff, 'Invalid public key');
    const P2 = P.mul(scalar);
    return (0, helpers_1.encodePoint)(P2);
}
exports.calculateConcealingPoint = calculateConcealingPoint;
function calculateBlindedAssetId(Hs, assetId, X) {
    const assetIdCopy = Buffer.from(assetId);
    const pointXCopy = Buffer.from(X);
    const hsScalar = (0, helpers_1.decodeScalar)(Hs, 'Invalid sсalar');
    const xP = (0, helpers_1.decodePoint)(pointXCopy, 'Invalid public key');
    const sxP = xP.mul(hsScalar);
    const scalar1div8 = (0, helpers_1.decodeScalar)(exports.SCALAR_1DIV8, 'Invalid sсalar');
    const assetPoint = (0, helpers_1.decodePoint)(assetIdCopy, 'Invalid public key');
    const pointT = sxP.add(assetPoint);
    const blindedAssetIdPoint = pointT.mul(scalar1div8);
    return (0, helpers_1.encodePoint)(blindedAssetIdPoint);
}
exports.calculateBlindedAssetId = calculateBlindedAssetId;
function generateKeyDerivation(txPubKey, secKeyView) {
    const s = (0, helpers_1.decodeScalar)(secKeyView, 'Invalid secret key');
    const P = (0, helpers_1.decodePoint)(txPubKey, 'Invalid public key');
    const P2 = P.mul(s);
    const P3 = P2.mul(new bn_js_1.default('8'));
    return (0, helpers_1.encodePoint)(P3);
}
exports.generateKeyDerivation = generateKeyDerivation;
function derivePublicKey(derivation, outIndex, pubSpendKeyBuf) {
    const P1 = (0, helpers_1.decodePoint)(pubSpendKeyBuf, 'Invalid public key');
    const scalar = derivationToScalar(derivation, outIndex);
    const P = crypto_data_1.ec.curve.g.mul((0, helpers_1.decodeInt)(scalar));
    const P2 = P.add(P1);
    return (0, helpers_1.encodePoint)(P2);
}
exports.derivePublicKey = derivePublicKey;
function deriveSecretKey(derivation, outIndex, sec) {
    const s = (0, helpers_1.decodeScalar)(sec, 'Invalid secret key');
    const scalar = derivationToScalar(derivation, outIndex);
    const key = s
        .add((0, helpers_1.decodeInt)(scalar))
        .umod(crypto_data_1.ec.curve.n);
    return (0, helpers_1.encodeInt)(key);
}
exports.deriveSecretKey = deriveSecretKey;
function derivationToScalar(derivation, outIndex) {
    const data = Buffer.concat([
        derivation,
        (0, serialize_1.serializeVarUint)(outIndex),
    ]);
    return hashToScalar(data);
}
exports.derivationToScalar = derivationToScalar;
function fastHash(data) {
    const hash = (0, keccak_1.default)('keccak256').update(data).digest();
    return hash;
}
exports.fastHash = fastHash;
function hs(str32, h) {
    const elements = [str32, h];
    const data = Buffer.concat(elements);
    return hashToScalar(data);
}
exports.hs = hs;
function hashToScalar(data) {
    const hash = fastHash(data);
    return reduceScalar32(hash);
}
exports.hashToScalar = hashToScalar;
function reduceScalar32(scalar) {
    const num = (0, helpers_1.decodeInt)(scalar);
    return (0, helpers_1.encodeInt)(num.umod(crypto_data_1.ec.curve.n));
}
exports.reduceScalar32 = reduceScalar32;
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
    const secretViewKey = hashToScalar(secretSpendKey);
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