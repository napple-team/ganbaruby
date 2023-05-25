import fs from 'fs';
import path from 'path';

import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import dayjs from 'dayjs'

class S3 {
  public client: S3Client

  constructor() {
    this.client = new S3Client({ region: 'ap-northeast-1' });
  }

  postTweetPictures(
    tweetId: string,
    picturePaths: Array<string>,
    options?: {
      timestamp: number | null,
      tweetUser: string
    }
  ): Promise<Array<void>> {
    const dir = (options?.timestamp ? dayjs.unix(options.timestamp) : dayjs()).format('YYYY/MM/DD')
    return Promise.all(picturePaths.map(async (photoPath) => {
      await this.client.send(this.putObjectCommand({
        Bucket: 'windyakin-koresuki-pictures',
        Key: `${dir}/${tweetId}-${path.basename(photoPath)}`,
        Body: fs.createReadStream(photoPath),
        Metadata: {
          'tweet-id': tweetId,
          ...(options?.tweetUser ? { 'tweet-user': options.tweetUser } : {}),
        }
      }))
    }))
  }

  putObjectCommand(input: PutObjectCommandInput) {
    return new PutObjectCommand({
      Bucket: input.Bucket,
      Key: input.Key,
      Body: input.Body,
      Metadata: input.Metadata,
    })
  }
}

export default S3;
