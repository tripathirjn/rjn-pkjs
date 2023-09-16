import * as crypto from 'crypto';

/**
 * Crypto agent
 */
class CryptoAgent {
  /**
   * Algo  of encryption
   */
  private static ALGO: crypto.CipherGCMTypes = 'aes-256-gcm';

  /**
   * Iterations  of encryption
   */
  private static ITERATIONS: number = 2145;

  /**
   * Key len of encryption
   */
  private static KEY_LEN: number = 32;

  /**
   * Digest  of encryption
   */
  private static DIGEST: string = 'sha512';

  /**
   * Salt  of encryption
   */
  private static SALT: Buffer = crypto.randomBytes(64);

  /**
   * Secret key of encryption
   */
  private static SECRET_KEY: string | undefined = process.env.SECRET_KEY;

  private static checkSecretKey(secretKey: string): string {
    const secret = secretKey || this.SECRET_KEY;

    if (!secret || secret === '') {
      throw new Error('Please add SECRET_KEY to .env');
    }
    return secret;
  }
  /**
   * Encrypt data
   * @param data
   * @param [secretKey]
   * @returns encrypt
   */
  public static encrypt(data: string, secretKey: string = ''): string {
    const secret = this.checkSecretKey(secretKey);
    const inputEncoding = 'utf8';
    const outputEncoding = 'base64';
    const iv = crypto.randomBytes(12);
    const key: Buffer = crypto.pbkdf2Sync(secret, this.SALT, this.ITERATIONS, this.KEY_LEN, this.DIGEST);
    const cipher = crypto.createCipheriv(this.ALGO, key, iv);
    const enc1 = cipher.update(data, inputEncoding);
    const enc2 = cipher.final();
    const tag = cipher.getAuthTag();

    const encryptedData = Buffer.concat([enc1, enc2, iv, tag]).toString(outputEncoding);

    // return the result
    return encryptedData;
  }

  /**
   * Decrypts data
   * @param data
   * @param secretKey
   * @returns decrypt
   */
  public static decrypt(data: string, secretKey: string): string {
    const secret = this.checkSecretKey(secretKey);
    const inputEncoding = 'base64';
    const outputEncoding = 'utf8';
    const bufferData = Buffer.from(data, inputEncoding);
    const key = crypto.pbkdf2Sync(secret, this.SALT, this.ITERATIONS, this.KEY_LEN, this.DIGEST);
    const iv = bufferData.subarray(bufferData.length - 28, bufferData.length - 16);
    const tag = bufferData.subarray(bufferData.length - 16);
    const text = bufferData.subarray(0, bufferData.length - 28);
    const decipher = crypto.createDecipheriv(this.ALGO, key, iv);

    decipher.setAuthTag(tag);
    let str = decipher.update(text, undefined, outputEncoding);
    str += decipher.final(outputEncoding);

    // parse the string decrypted data
    return str;
  }
}

export default CryptoAgent;
