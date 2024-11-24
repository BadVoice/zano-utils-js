import { ZarcanumAddressKeys } from './types';
export declare class ZanoAddressUtils {
    getIntegratedAddress(address: string): string;
    encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string;
    getKeysFromAddress(address: string): ZarcanumAddressKeys;
    private generatePaymentId;
}
