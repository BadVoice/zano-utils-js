import { ZanoAddressUtils } from '../src';

describe(
  'testing the correctness of the address encoding function encodeAddress',
  () => {
    const zanoAddressUtils = new ZanoAddressUtils();
    const address = zanoAddressUtils.encodeAddress(
      197,
      1,
      '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa',
      'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3',
    );
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
        zanoAddressUtils.encodeAddress(197, 1, 'invalid', 'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3');
      }).toThrow('Invalid spendPublicKey: must be a hexadecimal string');
    });

    it('should throw an error for invalid private key', () => {
      expect(() => {
        zanoAddressUtils.encodeAddress(197, 1, '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa', 'invalid');
      }).toThrow('Invalid viewPrivateKey: must be a hexadecimal string');
    });
  });
