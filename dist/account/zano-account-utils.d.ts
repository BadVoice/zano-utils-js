import { AddressValidateResult, AccountStructure, AccountKeys } from './types';
export declare class ZanoAccountUtils {
    private addressUtils;
    constructor();
    generateAccount(): Promise<AccountStructure>;
    accountValidate(address: string, publicSpendKey: string, publicViewKey: string, secretSpendKey: string, secretViewKey: string): Promise<AddressValidateResult>;
    generateAccountKeys(): Promise<AccountKeys>;
}
