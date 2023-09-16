import CryptoAgent from '../lib/CryptoAgent';

describe('Crypto Service (Encryption/Decryption)', () => {
  let secret: string;
  beforeEach(() => {
    secret = 'admin@234baba_{';
  });
  it('Testing for text', () => {
    const data = 'This data is to be encrypted';
    const encrypted = CryptoAgent.encrypt(data, secret);
    const decrypted = CryptoAgent.decrypt(encrypted, secret);
    expect(decrypted).toEqual(data);
  });

  it('Testing for array', () => {
    const data = ['this', 'is', 'array'];
    const encrypted = CryptoAgent.encrypt(JSON.stringify(data), secret);
    const decrypted = CryptoAgent.decrypt(encrypted, secret);
    expect(JSON.parse(decrypted)).toEqual(data);
  });

  it('Testing for object', () => {
    const data = {
      key1: 'value1',
      key2: 'value2',
    };
    const encrypted = CryptoAgent.encrypt(JSON.stringify(data), secret);
    const decrypted = CryptoAgent.decrypt(encrypted, secret);
    expect(JSON.parse(decrypted)).toEqual(data);
  });
});
