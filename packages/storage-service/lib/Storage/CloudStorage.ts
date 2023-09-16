import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { StorageProvider, CloudConfig } from '../types';

/**
 * Cloud storage
 */
class CloudStorage implements StorageProvider {
  private fileUploader: any = cloudinary.uploader;

  constructor() {
    if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
      throw new Error(` Please make sure you have specified the following env configurations:
                    CLOUDINARY_NAME =
                    CLOUDINARY_KEY=
                    CLOUDINARY_SECRET=
    `);
    }
    const config: CloudConfig = {
      cloud_name: process.env.CLOUDINARY_NAME || '',
      api_key: process.env.CLOUDINARY_KEY || '',
      api_secret: process.env.CLOUDINARY_SECRET || '',
    };

    cloudinary.config(config);
  }
  /**
   * Uploads cloud storage
   * @param fileBuffer
   * @param opts
   * @returns upload
   */
  upload(fileBuffer: any, opts: any): Promise<any> {
    const scope = this;
    return new Promise((resolve, reject) => {
      if (fileBuffer === undefined || !fileBuffer) {
        return reject(new Error('Nothing to upload'));
      }
      try {
        const fileName = opts?.fileName;
        const stream = scope.fileUploader.upload_stream({ public_id: fileName }, (error: any, result: any) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
      } catch (ex) {
        return reject(ex);
      }
    });
  }
}

export default CloudStorage;
