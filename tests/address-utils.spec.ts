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
      expect(address).toBe('ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH');
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
  });

describe(
  'testing the correctness of the address decoding function getKeysFromZarcanumAddress',
  () => {
    const zanoAddressUtils = new ZanoAddressUtils();
    const address = 'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
    const spendPublicKey = '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa';
    const viewPublicKey = 'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3';

    it('checking the correctness of the address format (ADDRESS_REGEX)', () => {
      expect((zanoAddressUtils.getKeysFromZarcanumAddress(address))).toStrictEqual({
        spendPublicKey,
        viewPublicKey,
      });
    });

    it('should throw an error for invalid address format', () => {
      expect(() => {
        zanoAddressUtils.getKeysFromZarcanumAddress('invalid');
      }).toThrow('Invalid Address format');
    });

    it('should throw an invalid character in base58 string', () => {
      const invalidAddress = 'ZxD5aoLDPTdcaRx4uOpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
      expect(() => {
        zanoAddressUtils.getKeysFromZarcanumAddress(invalidAddress);
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
        (zanoAddressUtils.getKeysFromZarcanumAddress('Zx' + '1'.repeat(95)));
      }).toThrow('Invalid address checksum');
    });
  });

describe(
  'testing the correctness of the integrated address encoding function getIntegratedAddress',
  () => {
    const tag = 0x36f8;
    const flag = 120;
    const spendPublicKey = '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa';
    const viewPublicKey = 'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3';
    const zanoAddressUtils = new ZanoAddressUtils();
    const integratedAddress = zanoAddressUtils.getIntegratedAddress(tag, flag, spendPublicKey, viewPublicKey);

    it('checking the correctness of the result', () => {
      expect(integratedAddress).toBe('iZ4mBxubNfqcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTrG7nU5rRCWmcozLaMoY95sAbo6');
    });

    it('checking the correctness of the integrated address length', () => {
      expect(integratedAddress).toHaveLength(116);
    });

    it('should throw an error for invalid tag', () => {
      expect(() => {
        zanoAddressUtils.getIntegratedAddress(-197, 1, '...', '...');
      }).toThrow('Invalid tag');
    });

    it('should throw an error for invalid flag', () => {
      expect(() => {
        zanoAddressUtils.getIntegratedAddress(197, -1, '...', '...');
      }).toThrow('Invalid flag');
    });

    it('should throw an error for invalid public key', () => {
      expect(() => {
        zanoAddressUtils.getIntegratedAddress(197, 1, 'invalid', viewPublicKey);
      }).toThrow('Invalid spendPublicKey: must be a hexadecimal string with a length of 64');
    });

    it('should throw an error for invalid private key', () => {
      expect(() => {
        zanoAddressUtils.getIntegratedAddress(197, 1, spendPublicKey, 'invalid');
      }).toThrow('Invalid viewPrivateKey: must be a hexadecimal string with a length of 64');
    });
  });

describe(
  'testing the correctness of the address decoding function getKeysFromIntegratedAddress',
  () => {
    const zanoAddressUtils = new ZanoAddressUtils();
    const integratedAddress = 'iZ2kFmwxRHoaRxm1ni8HnfUTkYuKbni8s4CE2Z4GgFfH99BJ6cnbAtJTgUnZjPj9CTCTKy1qqM9wPCTp92uBC7e47JPwAi2q4Vm1WVcdj1DD';
    const spendPublicKey = 'b48bcc1896a6c7ddfb1daa575160a42e0f17a18cfc741317c545e8486b0c30ab';
    const viewPublicKey = 'fb8a1f99c7a39f83693b9d8e1b68447a7d65c35f8f9244874ec0462a375525aa';

    it('checking the correctness of the integrated address format (ADDRESS_REGEX)', () => {
      expect((zanoAddressUtils.getKeysFromIntegratedAddress(integratedAddress))).toStrictEqual({
        spendPublicKey,
        viewPublicKey,
      });
    });

    it('should throw an error for invalid integrated address format', () => {
      const invalidIntegratedAddress = 'iUyPHy6NQ71caRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTptcfXRFDy2v9ND5w6Y';
      expect(() => {
        zanoAddressUtils.getKeysFromIntegratedAddress(invalidIntegratedAddress);
      }).toThrow('Invalid integrated address format');
    });

    it('should throw an invalid character in base58 string', () => {
      const invalidIntegratedAddress = 'iZyPHy6NQ71caRx4uOpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp3iTptcfXRFDy2v9ND5w6Y';
      expect(() => {
        zanoAddressUtils.getKeysFromIntegratedAddress(invalidIntegratedAddress);
      }).toThrow('base58 string block contains invalid character');
    });

    it('should throw an invalid base58 string size', () => {
      const invalidIntegratedAddress = 'Z';
      expect(() => {
        base58Decode(invalidIntegratedAddress);
      }).toThrow('base58 string has an invalid size');
    });

    it('should throw an invalid integrated address checksum', () => {
      expect(() => {
        (zanoAddressUtils.getKeysFromIntegratedAddress('iZx' + '1'.repeat(105)));
      }).toThrow('Invalid address checksum');
    });
  });
