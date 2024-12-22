export type ZarcanumAddressKeys = {
    spendPublicKey: string;
    viewPublicKey: string;
}

export type DecodedAddress = {
    tag: number;
    flag: number;
    viewPublicKey: Buffer;
    spendPublicKey: Buffer;
}

export type SplitedIntegratedAddress = {
    masterAddress: string;
    paymentId: string;
}