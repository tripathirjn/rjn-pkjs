import * as bcrypt from 'bcrypt';

/**
 * HashingAgent
 */
class HashingAgent {
  /**
   * Base64s encode
   * @param payload
   * @returns encode
   */
  public static base64Encode(payload: string): string {
    if (payload === undefined || !payload) return '';
    return Buffer.from(payload).toString('base64');
  }

  /**
   * Base64s decode
   * @param payload
   * @returns decode
   */
  public static base64Decode(payload: string): string {
    if (payload === undefined || !payload) return '';
    return Buffer.from(payload, 'base64').toString('ascii');
  }

  /**
   * Gets hash
   * @param payload
   * @param [saltLen]
   * @returns hash
   */
  public static async getHash(payload: any, saltLen: number = 5): Promise<string> {
    let toReturn = '';
    if (!payload) return toReturn;
    const salt = await bcrypt.genSalt(saltLen || 5);
    const hash = await bcrypt.hash(payload, salt);
    toReturn = this.base64Encode(hash);
    return toReturn;
  }

  /**
   * Compares hash
   * @param payload
   * @param hash
   * @returns hash
   */
  public static async compareHash(payload: string, hash: string): Promise<boolean> {
    if (!payload || !hash) {
      return false;
    }
    const matched = await bcrypt.compare(payload, this.base64Decode(hash));
    return matched;
  }
}

export default HashingAgent;
