export type StorageType = 'File' | 'Cloud' | 'Stream';

export enum StorageServiceType {
  FILE = 'File',
  CLOUD = 'Cloud',
  STREAM = 'Stream',
}
export type StorageOption =
  | {
      filename?: string;
    }
  | any;

export interface StorageProvider {
  upload(fileBuffer: any, opts: StorageOption): Promise<any>;
}

export type CloudConfig = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};
