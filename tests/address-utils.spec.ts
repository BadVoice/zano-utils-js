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
        base58Decode(invalidAddress);
      }).toThrow('base58 string block contains invalid character');
    });

    it('should throw an invalid base58 string size', () => {
      const invalidAddress = 'Z';
      expect(() => {
        base58Decode(invalidAddress);
      }).toThrow('base58 string has an invalid size');
    });

  });