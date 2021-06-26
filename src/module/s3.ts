import fs from 'fs';
import path from 'path';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dayjs from 'dayjs'

export class S3 {
  private client: S3Client

  constructor() {
    this.client = new S3Client({ region: 'ap-northeast-1' });
  }

  postPhotos(photoPaths: Array<string>): Promise<any> {

    return Promise.all(photoPaths.map(async (photoPath) => {
      await this.client.send(new PutObjectCommand({
        Bucket: 'windyakin-koresuki-pictures',
        Key: `${dayjs().format('YYYY/MM/DD')}/${path.basename(photoPath)}`,
        Body: fs.createReadStream(photoPath)
      }))
    }))
  }
}
