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
