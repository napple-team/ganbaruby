import path from 'path';
import fs from 'fs/promises'

import Twitter from '../../src/lib/twitter';

describe('Twitter lib test', () => {
  describe('lookupTweet', () => {
    const twitterClient = new Twitter();
    const mockFunction = jest.fn(async (user: string, id: string | number) => {
      const sampleDataPath = path.join(__dirname, '..', 'sample', 'twitter', `${id}.html`);
      const sampleData = await fs.readFile(sampleDataPath, { encoding: 'utf-8' });
      return sampleData
    });
    twitterClient.fetchTweet = mockFunction;

    it('return tweet data when fetching single pictures post', async () => {
      const actual = await twitterClient.lookupTweet('https://twitter.com/MITLicense/status/1652865752331091968');
      expect(actual.identifier).toBe('1652865752331091968');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1652865752331091968');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/FvAopGGaEAAp-Dk.jpg'
      ]);
    });

    it('return tweet data when x.com', async () => {
      const actual = await twitterClient.lookupTweet('https://x.com/MITLicense/status/1652865752331091968');
      expect(actual.identifier).toBe('1652865752331091968');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1652865752331091968');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/FvAopGGaEAAp-Dk.jpg'
      ]);
    });

    it('retrun tweet data when fetching multi pictures post', async () => {
      const actual = await twitterClient.lookupTweet('https://twitter.com/MITLicense/status/1652160368901505027');
      expect(actual.identifier).toBe('1652160368901505027');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1652160368901505027');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/Fu2nEQpacAAXIy9.jpg',
        'https://pbs.twimg.com/media/Fu2nFRzaUAIp9DW.jpg',
        'https://pbs.twimg.com/media/Fu2nGBlakAANbvi.jpg'
      ]);
    });

    // https://twitter.com/MITLicense/status/1718863624721338572
    it('retrun tweet data when fetching multi pictures post in reply', async () => {
      const actual = await twitterClient.lookupTweet('https://twitter.com/MITLicense/status/1718863624721338572');
      expect(actual.identifier).toBe('1718863624721338572');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1718863624721338572');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/F9qhW4-bAAAS52U.jpg',
      ]);
    });

    it('return tweet deta when fetching sensitive tweet', async () => {
      const actual = await twitterClient.lookupTweet('https://twitter.com/_LinaTai_/status/1652976152380686340');
      expect(actual.identifier).toBe('1652976152380686340');
      expect(actual.url).toBe('https://twitter.com/_LinaTai_/status/1652976152380686340');
      expect(actual.userId).toBe('_LinaTai_');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/FvAtnA6WwAED3jM.jpg',
      ]);
    })
  });

  describe('getMediaIdFromMosaic', () => {
    const sampleMosaicUrl = 'https://mosaic.fxtwitter.com/jpeg/1652160368901505027/Fu2nEQpacAAXIy9/Fu2nFRzaUAIp9DW/Fu2nGBlakAANbvi';
    const twitterClient = new Twitter();
    it ('return media ids', () => {
      const actual = twitterClient.getMediaUrlFromMosaic(sampleMosaicUrl);
      expect(actual).toEqual([
        'https://pbs.twimg.com/media/Fu2nEQpacAAXIy9.jpg',
        'https://pbs.twimg.com/media/Fu2nFRzaUAIp9DW.jpg',
        'https://pbs.twimg.com/media/Fu2nGBlakAANbvi.jpg'
      ]);
    });
  });
});
