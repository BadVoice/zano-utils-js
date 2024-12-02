import BN from 'bn.js';

/**
 * BN operations in a reduction context.
 */
declare class RedBN extends BN {
  /**
   * @description Convert back a number using a reduction context
   */
  fromRed(): BN;

  /**
   * @description modular addition
   */
  redAdd(b: RedBN): RedBN;

  /**
   * @description in-place modular addition
   */
  redIAdd(b: RedBN): RedBN;

  /**
   * @description modular subtraction
   */
  redSub(b: RedBN): RedBN;

  /**
   * @description in-place modular subtraction
   */
  redISub(b: RedBN): RedBN;

  /**
   * @description modular shift left
   */
  redShl(num: number): RedBN;

  /**
   * @description modular multiplication
   */
  redMul(b: RedBN): RedBN;

  /**
   * @description in-place modular multiplication
   */
  redIMul(b: RedBN): RedBN;

  /**
   * @description modular square
   */
  redSqr(): RedBN;

  /**
   * @description in-place modular square
   */
  redISqr(): RedBN;

  /**
   * @description modular square root
   */
  redSqrt(): RedBN;

  /**
   * @description modular inverse of the number
   */
  redInvm(): RedBN;

  /**
   * @description modular negation
   */
  redNeg(): RedBN;

  /**
   * @description modular exponentiation
   */
  redPow(b: BN): RedBN;
}

export default RedBN;
