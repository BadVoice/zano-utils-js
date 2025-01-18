import { SplitedIntegratedAddress, ZarcanumAddressKeys } from './types';
declare function getIntegratedAddress(address: string): string;
declare function createIntegratedAddress(address: string, paymentId: string): string;
declare function encodeAddress(tag: number, flag: number, spendPublicKey: string, viewPublicKey: string): string;
declare function getMasterAddress(spendPublicKey: string, viewPublicKey: string): string;
declare function splitIntegratedAddress(integratedAddress: string): SplitedIntegratedAddress;
declare function getKeysFromAddress(address: string): ZarcanumAddressKeys;
export { getIntegratedAddress, createIntegratedAddress, encodeAddress, getMasterAddress, splitIntegratedAddress, getKeysFromAddress, };
