import { AddressValidateResult, AccountStructure, AccountKeys } from './types';
declare function generateAccount(): Promise<AccountStructure>;
declare function accountValidate(address: string, publicSpendKey: string, publicViewKey: string, secretSpendKey: string, secretViewKey: string): Promise<AddressValidateResult>;
declare function generateAccountKeys(): Promise<AccountKeys>;
declare function getAccountBySeedKey(secretSpendKey: string): Promise<AccountKeys>;
export { generateAccount, accountValidate, generateAccountKeys, getAccountBySeedKey, };
