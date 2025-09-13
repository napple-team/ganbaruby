import path from 'path';

import S3 from '../../src/lib/s3';

describe('S3 lib test', () => {
  describe('postTweetPictures', () => {
    const s3Client = new S3();

    it('hello', async () => {
      const mockClientSendingFunction = jest.fn().mockResolvedValue({});
      const mockPutObjectCommandFunction = jest.fn().mockReturnValue({});
      s3Client.client.send = mockClientSendingFunction;
      s3Client.putObjectCommand = mockPutObjectCommandFunction;
      const samplePicturePath = path.join(__dirname, '..', 'sample', 's3', 'picture.jpg');
      await s3Client.postTweetPictures('1652865752331091968', [samplePicturePath]);
      expect(mockClientSendingFunction).toHaveBeenCalled();
      expect(mockPutObjectCommandFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'windyakin-koresuki-pictures',
          Key: expect.stringMatching(/^\d{4}\/\d{2}\/\d{2}\/1652865752331091968-picture\.jpg$/),
          Body: expect.anything(),
          Metadata: expect.objectContaining({
            'tweet-id': '1652865752331091968',
          }),
        })
      );
    })
  })
})
