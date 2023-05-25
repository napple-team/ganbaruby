import path from 'path';

import S3 from '../../src/lib/s3';

describe('S3 lib test', () => {
  describe('postTweetPictures', () => {
    const s3Client = new S3();

    it('hello', () => {
      const mockClientSendingFunction = jest.fn();
      const mockPutObjectCommandFunction = jest.fn();
      s3Client.client.send = mockClientSendingFunction;
      s3Client.putObjectCommand = mockPutObjectCommandFunction;
      const samplePicturePath = path.join(__dirname, '..', 'sample', 's3', 'picture.jpg');
      s3Client.postTweetPictures('1652865752331091968', [samplePicturePath]);
      expect(mockClientSendingFunction).toHaveBeenCalled();
      expect(mockPutObjectCommandFunction).toHaveBeenCalledWith({
        Bucket: 'windyakin-koresuki-pictures',
        Key: ''
      });
    })
  })
})
