import path from 'path';
import fs from 'fs/promises'

import Twitter from '../../src/lib/twitter';

describe('Twitter lib test', () => {
  describe('lookupTweet', () => {
    const twitterClient = new Twitter();
    const mockFunction = jest.fn(async (id: string | number) => {
      const sampleDataPath = path.join(__dirname, '..', 'sample', 'twitter', `${id}.html`);
      const sampleData = await fs.readFile(sampleDataPath, { encoding: 'utf-8' });
      return sampleData
    });
    twitterClient.fetchTweet = mockFunction;

    it('return tweet data when fetching single pictures post', async () => {
      const actual = await twitterClient.lookupTweet('1652865752331091968');
      expect(actual.identifier).toBe('1652865752331091968');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1652865752331091968');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/FvAopGGaEAAp-Dk.jpg'
      ]);
    });

    it('retrun tweet data when fetching multi pictures post', async () => {
      const actual = await twitterClient.lookupTweet('1652160368901505027');
      expect(actual.identifier).toBe('1652160368901505027');
      expect(actual.url).toBe('https://twitter.com/MITLicense/status/1652160368901505027');
      expect(actual.userId).toBe('MITLicense');
      expect(actual.imageUrls).toEqual([
        'https://pbs.twimg.com/media/Fu2nEQpacAAXIy9.jpg',
        'https://pbs.twimg.com/media/Fu2nFRzaUAIp9DW.jpg',
        'https://pbs.twimg.com/media/Fu2nGBlakAANbvi.jpg'
      ]);
    });

    it('throw error when fetching sensitive tweet', async () => {
      expect(async () => {
        await twitterClient.lookupTweet('1652976152380686340');
      }).rejects.toThrow('Failed fetching data');
    })
  });
});
