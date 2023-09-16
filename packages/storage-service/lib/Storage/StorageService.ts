import CloudStorage from './CloudStorage';
import { StorageProvider, StorageServiceType, StorageType } from '../types';

/**
 * Storage service
 */
class StorageService {
  /**
   * Storage provider of storage service
   */
  private storageProvider: StorageProvider = new CloudStorage();

  /**
   * Creates an instance of storage service.
   * @param type
   */
  constructor(type: StorageType) {
    switch (type) {
      case StorageServiceType.FILE:
        break;
      case StorageServiceType.CLOUD:
      default:
        this.storageProvider = new CloudStorage();
        break;
    }
  }

  /**
   * Uploads storage service
   * @param fileBuffer
   * @param opts
   * @returns upload
   */
  async upload(fileBuffer: any, opts: any): Promise<any> {
    const result = await this.storageProvider.upload(fileBuffer, opts);
    return result;
  }
}

export default StorageService;
