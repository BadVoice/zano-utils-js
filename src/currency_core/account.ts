import { chacha8 } from '../core/chacha8';
import { fastHash , generateChaCha8Key } from '../core/crypto';
import { NUMWORDS } from '../core/mnemonic-encoding';

export function cryptWithPassInPlace(srcData: Uint8Array, password: string): void {
  const key: Buffer = generateChaCha8Key(Buffer.from(password));
  const passHash: Buffer = fastHash(Buffer.from(password));

  if (passHash.length < 12) {
    throw new Error('Invalid configuration: hash size is less than IV size');
  }
  const iv: Uint8Array = Uint8Array.from(passHash.subarray(0, 12));

  chacha8(key, iv, srcData, srcData);
}

export function checkSeedChecksum(
  auditable_flag_and_checksum: number,
  keys_seed_processed_binary: Uint8Array,
  seed_password: string,
  m_creation_timestamp: number,
): boolean {
  if (auditable_flag_and_checksum !== Number.MAX_SAFE_INTEGER) {
    const auditable_flag: boolean = (auditable_flag_and_checksum & 1) !== 0;
    const checksum: number = auditable_flag_and_checksum >>> 1;
    const checksum_max: number = NUMWORDS >>> 1;

    const binary_for_check_sum: Uint8Array = new Uint8Array(keys_seed_processed_binary.length + seed_password.length);
    binary_for_check_sum.set(keys_seed_processed_binary);
    binary_for_check_sum.set(Buffer.from(seed_password), keys_seed_processed_binary.length);

    let h: Buffer = fastHash(Buffer.from(binary_for_check_sum));
    const hView = new DataView(h.buffer)
    hView.setBigUint64(0, BigInt(m_creation_timestamp), true);
    h = fastHash(h);
    const hViewUpdated = new DataView(h.buffer);
    const h_64 = hViewUpdated.getBigUint64(0, true);

    let checksum_calculated = h_64 % (BigInt(checksum_max) + 1n);

    if (checksum_calculated === BigInt(checksum_max)) {
      checksum_calculated = 0n;
    }

    if (BigInt(checksum) !== checksum_calculated) {
      throw new Error(`seed phase has invalid checksum: ${checksum_calculated}, while ${checksum} is expected, check your words`);
    }
  }
  return true;
}
