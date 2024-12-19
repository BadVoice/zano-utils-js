import BN from 'bn.js';
import { eddsa as EDDSA } from 'elliptic';

import RedBN from './interfaces';

export const ec: EDDSA = new EDDSA('ed25519');

const { red } = ec.curve;
export const A = new BN(486662, 10).toRed(red);

// sqrt(-1)
// https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops-data.c#L12
//export const sqrtm1 = new BN(1).toRed(red).redNeg().redSqrt();
export const sqrtm1: RedBN = new BN('547cdb7fb03e20f4d4b2ff66c2042858d0bce7f952d01b873b11e4d8b5f15f3d', 'hex').toRed(red);

// sqrt(-2 * A * (A + 2))
// https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops-data.c#L843
export const fffb1: RedBN = new BN('7e71fbefdad61b1720a9c53741fb19e3d19404a8b92a738d22a76975321c41ee', 'hex').toRed(red);

// sqrt(2 * A * (A + 2))
// https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops-data.c#L844
export const fffb2: RedBN = new BN('32f9e1f5fba5d3096e2bae483fe9a041ae21fcb9fba908202d219b7c9f83650d', 'hex').toRed(red);

// sqrt(-sqrt(-1) * A * (A + 2))
// https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops-data.c#L845
export const fffb3: RedBN = new BN('1a43f3031067dbf926c0f4887ef7432eee46fc08a13f4a49853d1903b6b39186', 'hex').toRed(red);

// sqrt(sqrt(-1) * A * (A + 2))
// https://github.com/hyle-team/zano/blob/2817090c8ac7639d6f697d00fc8bcba2b3681d90/src/crypto/crypto-ops-data.c#L846
export const fffb4: RedBN = new BN('674a110d14c208efb89546403f0da2ed4024ff4ea5964229581b7d8717302c66', 'hex').toRed(red);
