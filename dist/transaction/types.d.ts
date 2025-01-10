export type TransactionObject = {
    version: 2;
    vin: VinData[];
    extra: ExtraData[];
    vout: VoutData[];
    attachment: AttachmentData[];
};
type TxinZcInputData = {
    key_offsets: KeyOffsetData;
    k_image: string;
    etc_details: unknown[];
};
type KeyOffsetData = {
    uint64_t: number;
};
type VinData = {
    txin_zc_input: TxinZcInputData;
};
type AccountAddressData = {
    spend_public_key: string;
    view_public_key: string;
    flags: number;
};
type ExtraData = {
    receiver2: null;
    acc_addr: AccountAddressData;
    pub_key: string;
    etc_tx_flags16: null;
    v: number;
    checksum: null;
    encrypted_key_derivation: string;
    derivation_hash: number;
    derivation_hint: null;
    msg: string;
    zarcanum_tx_data_v1: {
        fee: number;
    };
};
type TxOutZarcanumData = {
    stealth_address: string;
    concealing_point: string;
    amount_commitment: string;
    blinded_asset_id: string;
    encrypted_amount: number;
    mix_attr: number;
};
type VoutData = {
    tx_out_zarcanum: TxOutZarcanumData;
};
type AttachmentData = {
    flags: string;
    service_id: string;
    body?: string;
};
export {};
