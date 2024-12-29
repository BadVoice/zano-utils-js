import { SplitedIntegratedAddress, ZarcanumAddressKeys } from './types';
export declare class ZanoAddressUtils {
    getIntegratedAddress(address: string): string;
    createIntegratedAddress(address: string, paymentId: string): string;
    private formatIntegratedAddress;
    private decodeAddress;
    encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string;
    getMasterAddress(spendPublicKey: string, viewPublicKey: string): string;
    splitIntegratedAddress(integratedAddress: string): SplitedIntegratedAddress;
    getKeysFromAddress(address: string): ZarcanumAddressKeys;
    private generatePaymentId;
    private validatePaymentId;
    private validateAddress;
    private calculateChecksum;
}
