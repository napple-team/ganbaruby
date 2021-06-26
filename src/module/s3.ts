import fs from 'fs';
import path from 'path';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dayjs from 'dayjs'

export class S3 {
  private client: S3Client

  constructor() {
    this.client = new S3Client({ region: 'ap-northeast-1' });
  }

  postPhotos(tweetId: string, photoPaths: Array<string>, options?: { timestamp: number | null, tweetUser: string }): Promise<any> {
    const dir = (options?.timestamp ? dayjs.unix(options.timestamp) : dayjs()).format('YYYY/MM/DD')
    return Promise.all(photoPaths.map(async (photoPath) => {
      await this.client.send(new PutObjectCommand({
        Bucket: 'windyakin-koresuki-pictures',
        Key: `${dir}/${tweetId}-${path.basename(photoPath)}`,
        Body: fs.createReadStream(photoPath),
        Metadata: {
          'tweet-id': tweetId,
          'tweet-user': options?.tweetUser || '',
        }
      }))
    }))
  }
}
