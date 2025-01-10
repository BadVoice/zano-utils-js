import { TransactionObject } from './types';
declare function getConcealingPoint(viewSecretKey: string, txPubKey: string, pubViewKey: string, outputIndex: number): string;
declare function decodeAmount(viewSecretKey: string, txPubKey: string, encryptedAmount: number, outputIndex: number): bigint;
declare function getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string;
declare function getNativeBlindedAsset(viewSecretKey: string, txPubKey: string, outputIndex: number): string;
declare function generateKeyImage(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number, spendSecretKey: string): string;
declare function decryptPaymentId(encryptedPaymentId: string, txPubKey: string, secViewKey: string): string;
declare function parseObjectInJson(objectInJson: string): TransactionObject | null;
export { getConcealingPoint, decodeAmount, getStealthAddress, getNativeBlindedAsset, generateKeyImage, decryptPaymentId, parseObjectInJson, };
