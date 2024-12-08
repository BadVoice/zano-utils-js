import { Buffer } from 'buffer';

import BN from 'bn.js';
import { curve } from 'elliptic';

import { ec } from './crypto-data';
import RedBN from './interfaces';

/*
 * Decode little-endian number
 */
export function decodeInt(buf: Buffer): BN {
  if (typeof buf === 'string') {
    buf = Buffer.from(buf, 'hex');
  }
  return new BN(buf, 'hex', 'le');
}

/*
 * Square root candidate
 * x = (u/v)^(p+3)/8 = u*v^3*(u*v^7)^(p-5)/8
 * https://tools.ietf.org/html/rfc8032#section-5.1.3
 * https://crypto.stackexchange.com/questions/88868/why-computation-of-uv3uv7p-5-8-is-suggested-instead-of-u-vp3-8
 */
export function squareRoot(u: RedBN, v: RedBN) {
  return u.redMul(v.redPow(new BN(3)))
    .redMul(u.redMul(v.redPow(new BN(7))).redPow(ec.curve.p.subn(5).divn(8)));
}

/*
 * Decode little-endian number and veryfy < n
 */
export function decodeScalar(buf: Buffer, message = 'Invalid scalar'): BN {
  const scalar: BN = decodeInt(buf);
  if (scalar.gte(ec.curve.n)) {
    throw new RangeError(message);
  }
  return scalar;
}

export function encodePoint(P: curve.base.BasePoint): Buffer {
  return Buffer.from(ec.encodePoint(P));
}
