import { ZanoAddressUtils } from '../src';
import { base58Decode } from '../src/core/base58';

describe(
  'testing the correctness of the address encoding function encodeAddress',
  () => {
    const tag = 197;
    const flag = 1;
    const spendPublicKey = '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa';
    const viewPublicKey = 'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3';
    const zanoAddressUtils = new ZanoAddressUtils();
    const address = zanoAddressUtils.encodeAddress(tag, flag, spendPublicKey, viewPublicKey);

    it('checking the correctness of the result', () => {
      expect(address)
        .toBe('ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH');
    });

    it('checking the correctness of the address length', () => {
      expect(address).toHaveLength(97);
    });

    it('should throw an error for invalid tag', () => {
      expect(() => {
        zanoAddressUtils.encodeAddress(-197, 1, '...', '...');
      }).toThrow('Invalid tag');
    });

    it('should throw an error for invalid flag', () => {
      expect(() => {
        zanoAddressUtils.encodeAddress(197, -1, '...', '...');
      }).toThrow('Invalid flag');
    });

    it('should throw an error for invalid public key', () => {
      expect(() => {
        zanoAddressUtils.encodeAddress(197, 1, 'invalid', viewPublicKey);
      }).toThrow('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
    });

    it('should throw an error for invalid private key', () => {
      expect(() => {
        zanoAddressUtils.encodeAddress(197, 1, spendPublicKey, 'invalid');
      }).toThrow('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
    });
  },
);

describe(
  'testing the correctness of the address decoding function getKeysFromAddress',
  () => {
    const zanoAddressUtils = new ZanoAddressUtils();
    const address = 'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
    const spendPublicKey = '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa';
    const viewPublicKey = 'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3';

    it('checking the correctness of the address format (ADDRESS_REGEX)', () => {
      expect((zanoAddressUtils.getKeysFromAddress(address))).toStrictEqual({
        spendPublicKey,
        viewPublicKey,
      });
    });

    it('should throw an error for invalid address format', () => {
      expect(() => {
        zanoAddressUtils.getKeysFromAddress('invalid');
      }).toThrow('Invalid address format');
    });

    it('should throw an invalid character in base58 string', () => {
      const invalidAddress = 'ZxD5aoLDPTdcaRx4uOpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
      expect(() => {
        zanoAddressUtils.getKeysFromAddress(invalidAddress);
      }).toThrow('base58 string block contains invalid character');
    });

    it('should throw an invalid base58 string size', () => {
      const invalidAddress = 'Z';
      expect(() => {
        base58Decode(invalidAddress);
      }).toThrow('base58 string has an invalid size');
    });

    it('should throw an invalid address checksum', () => {
      expect(() => {
        (zanoAddressUtils.getKeysFromAddress('Zx' + '1'.repeat(95)));
      }).toThrow('Invalid address checksum');
    });
  },
);

describe('getIntegratedAddress', () => {
  const zanoAddressUtils: ZanoAddressUtils = new ZanoAddressUtils();
  const SUFFIX_LENGTH: number = 18; // paymentId + checksum

  // Define test data
  const integratedAddress: string = 'iZ2kFmwxRHoaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e47JPoHxGL5UU2D1tpQMg4';
  const masterAddress: string = 'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
  const masterAddress2: string = 'ZxDG8UrQMEVaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e41KkqnWH8F';

  const masterBasedIntegratedAddress: string = 'iZ2Zi6RmTWwcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTqEsjvJoco1aLSZXS6T';
  const master2BasedIntegratedAddress: string = 'iZ2kFmwxRHoaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e47JQQbd6iYGx1S6AdHpq6';

  // Compute desired outcomes for the slice operation
  const integratedAddressWithoutSuffix: string = integratedAddress.slice(0, -SUFFIX_LENGTH);
  const masterBasedIntegratedAddressWithoutSuffix: string = masterBasedIntegratedAddress.slice(0, -SUFFIX_LENGTH);
  const master2BasedIntegratedAddressWithoutSuffix: string = master2BasedIntegratedAddress.slice(0, -SUFFIX_LENGTH);

  // Addresses returned by zanoAddressUtils
  const addressFromIntegrated: string = zanoAddressUtils.getIntegratedAddress(integratedAddress);
  const addressFromMaster: string = zanoAddressUtils.getIntegratedAddress(masterAddress);
  const addressFromMaster2: string = zanoAddressUtils.getIntegratedAddress(masterAddress2);

  it('ensures that truncating the last 18 characters from the integrated address is correct', () => {
    expect(addressFromIntegrated.slice(0, -SUFFIX_LENGTH)).toBe(integratedAddressWithoutSuffix);
  });

  it('ensures that truncating the last 18 characters from the master-based integrated address is correct', () => {
    expect(addressFromMaster.slice(0, -SUFFIX_LENGTH)).toBe(masterBasedIntegratedAddressWithoutSuffix);
  });

  it('ensures that truncating the last 18 characters from the second master-based integrated address is correct', () => {
    expect(addressFromMaster2.slice(0, -SUFFIX_LENGTH)).toBe(master2BasedIntegratedAddressWithoutSuffix);
  });
});

describe('createIntegratedAddress', () => {
  const zanoAddressUtils: ZanoAddressUtils = new ZanoAddressUtils();
  const SUFFIX_LENGTH: number = 18; // paymentId + checksum

  // Define test data
  const integratedAddress: string = 'iZ2kFmwxRHoaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e47JPoHxGL5UU2D1tpQMg4';
  const masterAddress: string = 'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
  const masterAddress2: string = 'ZxDG8UrQMEVaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e41KkqnWH8F';

  const masterBasedIntegratedAddress: string = 'iZ2Zi6RmTWwcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTqEsjvJoco1aLSZXS6T';
  const master2BasedIntegratedAddress: string = 'iZ2kFmwxRHoaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e47JQQbd6iYGx1S6AdHpq6';

  // Compute desired outcomes for the slice operation
  const integratedAddressWithoutSuffix: string = integratedAddress.slice(0, -SUFFIX_LENGTH);
  const masterBasedIntegratedAddressWithoutSuffix: string = masterBasedIntegratedAddress.slice(0, -SUFFIX_LENGTH);
  const master2BasedIntegratedAddressWithoutSuffix: string = master2BasedIntegratedAddress.slice(0, -SUFFIX_LENGTH);

  // Addresses returned by zanoAddressUtils
  const addressFromIntegrated: string = zanoAddressUtils.createIntegratedAddress(integratedAddress, '3535bb68');
  const addressFromMaster: string = zanoAddressUtils.createIntegratedAddress(masterAddress, '3535bb68');
  const addressFromMaster2: string = zanoAddressUtils.createIntegratedAddress(masterAddress2, '3535bb68');

  it('ensures that truncating the last 18 characters from the integrated address is correct', () => {
    expect(addressFromIntegrated.slice(0, -SUFFIX_LENGTH)).toBe(integratedAddressWithoutSuffix);
  });

  it('ensures that truncating the last 18 characters from the master-based integrated address is correct', () => {
    expect(addressFromMaster.slice(0, -SUFFIX_LENGTH)).toBe(masterBasedIntegratedAddressWithoutSuffix);
  });

  it('ensures that truncating the last 18 characters from the second master-based integrated address is correct', () => {
    expect(addressFromMaster2.slice(0, -SUFFIX_LENGTH)).toBe(master2BasedIntegratedAddressWithoutSuffix);
  });
});