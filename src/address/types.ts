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