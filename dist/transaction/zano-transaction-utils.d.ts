import { TransactionObject } from './types';
export declare class ZanoTransactionUtils {
    getConcealingPoint(viewSecretKey: string, txPubKey: string, pubViewKey: string, outputIndex: number): string;
    decodeAmount(viewSecretKey: string, txPubKey: string, encryptedAmount: number, outputIndex: number): bigint;
    getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string;
    getNativeBlindedAsset(viewSecretKey: string, txPubKey: string, outputIndex: number): string;
    generateKeyImage(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number, spendSecretKey: string): string;
    decryptPaymentId(encryptedPaymentId: string, txPubKey: string, secViewKey: string): string;
    parseObjectInJson(objectInJson: string): TransactionObject | null;
    private prepareJson;
}
