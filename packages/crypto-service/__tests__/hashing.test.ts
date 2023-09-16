import HashingAgent from '../lib/HashingAgent';

describe('Hashing service', () => {
  it('Testing for compare hash', async () => {
    const data = 'admin@1234';
    const hash = await HashingAgent.getHash(data);
    const hashMatched = await HashingAgent.compareHash(data, hash);
    expect(hashMatched).toEqual(true);
  });
  it('Testing for encode decode', async () => {
    const data = 'admin@1234';
    const encoded = HashingAgent.base64Encode(data);
    const decoded = HashingAgent.base64Decode(encoded);
    expect(decoded).toEqual(data);
  });
});
