import { ZarcanumAddressKeys } from './types';
export declare class ZanoAddressUtils {
    getStealthAddress(txPubKey: string, secViewKey: string, pubSpendKey: string, outIndex: number): string;
    encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string;
    getKeysFromZarcanumAddress(address: string): ZarcanumAddressKeys;
}
