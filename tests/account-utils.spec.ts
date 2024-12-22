import { ZanoAccountUtils } from '../src';
import { ADDRESS_REGEX } from '../src/address/constants';
import * as crypto from '../src/core/crypto';

describe('generate account', () => {
  let service: ZanoAccountUtils;

  beforeAll(() => {
    service = new ZanoAccountUtils();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates unpredictable address', async () => {
    await expect(service.generateAccount())
      .resolves
      .toMatchObject({
        address: expect.stringMatching(ADDRESS_REGEX),
        secretSpendKey: expect.stringMatching(/^([0-9a-fA-F]{2})+$/),
        publicSpendKey: expect.stringMatching(/^([0-9a-fA-F]{2})+$/),
        publicViewKey: expect.stringMatching(/^([0-9a-fA-F]{2})+$/),
        secretViewKey: expect.stringMatching(/^([0-9a-fA-F]{2})+$/),
      });
  });

  it('generate known account', async () => {
    jest.spyOn(crypto, 'generateSeedKeys').mockReturnValueOnce({
      secretSpendKey: '6c225665aadb81ebce41bd94cbc78250aaf62f2636819b1cdcf47d4cbcd2b00d',
      publicSpendKey: '0c27ece0fb489b344915d12745a89f9b6cb307c384286be12ae9311942aa89db',
      keysSeedBinary: '4ae82b84de736e92afd4f2d13770fd5ab463e16078ed19f20b5f8fedf261fa2b',
    });

    await expect(service.generateAccount())
      .resolves
      .toMatchObject({
        address: 'ZxBpGz8qdG3SxgBYFKJqxjThPZpjqW1ouK3ZsyZnZCUqQ4Ndc9PiqkdJuEicMXPPSW5JidxK5bye7UYc1hkTHhxc1w4temC2A',
        secretSpendKey: '6c225665aadb81ebce41bd94cbc78250aaf62f2636819b1cdcf47d4cbcd2b00d',
        publicSpendKey: '0c27ece0fb489b344915d12745a89f9b6cb307c384286be12ae9311942aa89db',
      });
  });
});

describe('address validation', () => {
  let service: ZanoAccountUtils;
  const address = 'ZxDFpn4k7xVYyc9VZ3LphrJbkpc46xfREace5bme1aXiMzKPAHA8jsTWcHSXhv9AdodSaoGXK9Mg7bk3ec4FkQrj357fZPWZX';
  const secretSpendKey = '80b3e96a3eb765332b0fd3e44e0fefa58747a70025bf91aa4a7b758ab6f5590d';
  const publicSpendKey = 'b3eee2376f32bf2bfb5cf9c023f569380c84ac8c64ddc8f7c109730dc8e97d7a';
  const secretViewKey = '3e75ffee51eb21b1d6404ddcab5b3aaa49edbfe225e9a893d87074aacae46b09';
  const publicViewKey = 'fa9c2811c53eb1044490e931f92ad9ddf317220df08ccfb5b83eccfdbd38f135';

  const secretSpendKey2 = '9ed57f071db00695b18ea396d0f85ce18178b35643c038f09255edc326c4a502';
  const publicSpendKey2 = 'd651f305d40bcbe27ced0ef48253623ec31da3a28130d08ddf6686179e418ff4';
  const publicViewKey2 = '2b3e2bac27a3992b3f93285b1d08476a5723afdf3aa6961770ad7e7544325831';

  beforeEach(() => {
    service = new ZanoAccountUtils();
  });

  it('created address should be valid', async () => {
    await expect(service.accountValidate(address, publicSpendKey, publicViewKey, secretSpendKey, secretViewKey))
      .resolves
      .toBe(true);
  });

  it('created address non valid', async () => {
    await expect(service.accountValidate('', '', '', '', ''))
      .rejects
      .toThrow('invalid address format');
  });

  it('address on invalid privateKey', async () => {
    await expect(service.accountValidate(address, '', '', '', ''))
      .rejects
      .toThrow('invalid address keys');
  });

  it('address on invalid publicKey', async () => {
    await expect(service.accountValidate(address, publicSpendKey, publicViewKey, secretSpendKey2, secretViewKey))
      .rejects
      .toThrow('invalid depend secret view key');
  });

  it('address on invalid publicSpendKey', async () => {
    await expect(service.accountValidate(address, publicSpendKey2, publicViewKey, secretSpendKey, secretViewKey))
      .rejects
      .toThrow('invalid address keys');
  });

  it('address on invalid secret view key', async () => {
    await expect(service.accountValidate(address, publicSpendKey2, publicViewKey, secretSpendKey, ''))
      .rejects
      .toThrow('invalid address keys');
  });

  it('address on invalid depend secret view key', async () => {
    await expect(service.accountValidate(address, publicSpendKey, publicViewKey, secretSpendKey, ''))
      .rejects
      .toThrow('invalid depend secret view key');
  });

  it('address on invalid publicViewKey', async () => {
    await expect(service.accountValidate(address, publicSpendKey, publicViewKey2, secretSpendKey, secretViewKey))
      .rejects
      .toThrow('pub view key from secret key no equal provided pub view key');
  });
});
