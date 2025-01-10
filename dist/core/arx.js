"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCipher = exports.checkOpts = exports.rotl = exports.copyBytes = exports.clean = exports.u32 = void 0;
const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
exports.u32 = u32;
function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0);
    }
}
exports.clean = clean;
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
exports.copyBytes = copyBytes;
const _utf8ToBytes = (str) => Uint8Array.from(str.split('').map((c) => c.charCodeAt(0)));
const sigma16 = _utf8ToBytes('expand 16-byte k');
const sigma32 = _utf8ToBytes('expand 32-byte k');
const sigma16_32 = (0, exports.u32)(sigma16);
const sigma32_32 = (0, exports.u32)(sigma32);
function rotl(a, b) {
    return (a << b) | (a >>> (32 - b));
}
exports.rotl = rotl;
function isAligned32(b) {
    return b.byteOffset % 4 === 0;
}
const BLOCK_LEN = 64;
const BLOCK_LEN32 = 16;
const MAX_COUNTER = 2 ** 32 - 1;
const U32_EMPTY = new Uint32Array();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
    const len = data.length;
    const block = new Uint8Array(BLOCK_LEN);
    const b32 = (0, exports.u32)(block);
    const isAligned = isAligned32(data) && isAligned32(output);
    const d32 = isAligned ? (0, exports.u32)(data) : U32_EMPTY;
    const o32 = isAligned ? (0, exports.u32)(output) : U32_EMPTY;
    for (let pos = 0; pos < len; counter++) {
        core(sigma, key, nonce, b32, counter, rounds);
        if (counter >= MAX_COUNTER) {
            throw new Error('arx: counter overflow');
        }
        const take = Math.min(BLOCK_LEN, len - pos);
        if (isAligned && take === BLOCK_LEN) {
            const pos32 = pos / 4;
            if (pos % 4 !== 0) {
                throw new Error('arx: invalid block position');
            }
            for (let j = 0, posj; j < BLOCK_LEN32; j++) {
                posj = pos32 + j;
                o32[posj] = d32[posj] ^ b32[j];
            }
            pos += BLOCK_LEN;
            continue;
        }
        for (let j = 0, posj; j < take; j++) {
            posj = pos + j;
            output[posj] = data[posj] ^ block[j];
        }
        pos += take;
    }
}
function checkOpts(defaults, opts) {
    if (opts == null || typeof opts !== 'object') {
        throw new Error('options must be defined');
    }
    const merged = Object.assign(defaults, opts);
    return merged;
}
exports.checkOpts = checkOpts;
function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0) {
        throw new Error('positive integer expected, got');
    }
}
function abool(b) {
    if (typeof b !== 'boolean') {
        throw new Error(`boolean expected, not ${b}`);
    }
}
function abytes(b, ...lengths) {
    if (!isBytes(b)) {
        throw new Error('Uint8Array expected');
    }
    if (lengths.length > 0 && !lengths.includes(b.length)) {
        throw new Error('Uint8Array expected of length');
    }
}
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
function createCipher(core, opts) {
    const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds, } = checkOpts({
        allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20,
    }, opts);
    if (typeof core !== 'function') {
        throw new Error('core must be a function');
    }
    anumber(counterLength);
    anumber(rounds);
    abool(counterRight);
    abool(allowShortKeys);
    return (key, nonce, data, output, counter = 0) => {
        abytes(key);
        abytes(nonce);
        abytes(data);
        const len = data.length;
        if (output === undefined) {
            output = new Uint8Array(len);
        }
        abytes(output);
        anumber(counter);
        if (counter < 0 || counter >= MAX_COUNTER) {
            throw new Error('arx: counter overflow');
        }
        if (output.length < len) {
            throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
        }
        const toClean = [];
        const l = key.length;
        let k;
        let sigma;
        if (l === 32) {
            toClean.push((k = copyBytes(key)));
            sigma = sigma32_32;
        }
        else if (l === 16 && allowShortKeys) {
            k = new Uint8Array(32);
            k.set(key);
            k.set(key, 16);
            sigma = sigma16_32;
            toClean.push(k);
        }
        else {
            throw new Error(`arx: invalid 32-byte key, got length=${l}`);
        }
        if (!isAligned32(nonce)) {
            toClean.push((nonce = copyBytes(nonce)));
        }
        const k32 = (0, exports.u32)(k);
        if (extendNonceFn) {
            if (nonce.length !== 24) {
                throw new Error('arx: extended nonce must be 24 bytes');
            }
            extendNonceFn(sigma, k32, (0, exports.u32)(nonce.subarray(0, 16)), k32);
            nonce = nonce.subarray(16);
        }
        const nonceNcLen = 16 - counterLength;
        if (nonceNcLen !== nonce.length) {
            throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
        }
        if (nonceNcLen !== 12) {
            const nc = new Uint8Array(12);
            nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
            nonce = nc;
            toClean.push(nonce);
        }
        const n32 = (0, exports.u32)(nonce);
        runCipher(core, sigma, k32, n32, data, output, counter, rounds);
        clean(...toClean);
        return output;
    };
}
exports.createCipher = createCipher;
//# sourceMappingURL=arx.js.map