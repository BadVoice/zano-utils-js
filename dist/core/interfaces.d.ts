import BN from 'bn.js';
declare class RedBN extends BN {
    fromRed(): BN;
    redAdd(b: RedBN): RedBN;
    redIAdd(b: RedBN): RedBN;
    redSub(b: RedBN): RedBN;
    redISub(b: RedBN): RedBN;
    redShl(num: number): RedBN;
    redMul(b: RedBN): RedBN;
    redIMul(b: RedBN): RedBN;
    redSqr(): RedBN;
    redISqr(): RedBN;
    redSqrt(): RedBN;
    redInvm(): RedBN;
    redNeg(): RedBN;
    redPow(b: BN): RedBN;
}
export default RedBN;
