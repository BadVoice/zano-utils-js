import { Buffer } from 'buffer';

import BN from 'bn.js';
import { curve } from 'elliptic';

import { ec, sqrtm1 } from './crypto-data';
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

export function reduceScalar(scalar: BN, curveOrder: BN): BN {
  return scalar.mod(curveOrder);
}

export function decodePoint(buf: Buffer, message = 'Invalid point'): curve.edwards.EdwardsPoint {
  // compress data if curve isOdd
  const xIsOdd: boolean = (buf[buf.length - 1] & 0x80) !== 0;
  buf[buf.length - 1] = buf[buf.length - 1] & ~0x80;

  let y: RedBN = decodeInt(buf) as RedBN;
  if (y.gte(ec.curve.p)) {
    throw new RangeError(message);
  }
  y = y.toRed(ec.curve.red);
  // x^2 = (y^2 - c^2) / (c^2 d y^2 - a) = u / v
  const y2: RedBN = y.redSqr();
  const u: RedBN = y2.redSub(ec.curve.c2 as RedBN);
  const v: RedBN = y2.redMul(ec.curve.d as RedBN).redMul(ec.curve.c2 as RedBN).redSub(ec.curve.a as RedBN);

  let x: RedBN = squareRoot(u, v);

  if (!u.redSub(x.redSqr().redMul(v)).isZero()) {
    x = x.redMul(sqrtm1);
    if (!u.redSub(x.redSqr().redMul(v)).isZero()) {
      throw new RangeError(message);
    }
  }

  if (x.fromRed().isZero() && xIsOdd) {
    throw new RangeError(message);
  }

  if (x.fromRed().isOdd() !== xIsOdd) {
    x = x.redNeg();
  }

  return ec.curve.point(x, y);
}

export function encodeInt(num: BN) {
  return num.toArrayLike(Buffer, 'le', 32);
}