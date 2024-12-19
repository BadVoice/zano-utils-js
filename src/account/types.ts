export type AccountKeys = {
  secretSpendKey: string;
  secretViewKey: string;
  publicSpendKey: string;
  publicViewKey: string;
}

export type SpendKeypair = {
  secretSpendKey: string;
  publicSpendKey: string;
}

export type AccountStructure = AccountKeys & {
  address: string;
}
