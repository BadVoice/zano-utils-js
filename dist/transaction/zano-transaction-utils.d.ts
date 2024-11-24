export declare class ZanoTransactionUtils {
    getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string;
    getConcealingPoint(viewSecretKey: string, txPubKey: string, outputIndex: number, pubViewKey: string): string;
    decodeAmount(viewSecretKey: string, txPubKey: string, outputIndex: number, encryptedAmount: number): bigint;
}
