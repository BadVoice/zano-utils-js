import { PAYMENT_ID_REGEX } from '../address/constants';

export function paymentIdValidate(paymentId: string): boolean {
  return paymentId.length === 8 && PAYMENT_ID_REGEX.test(paymentId);
}
