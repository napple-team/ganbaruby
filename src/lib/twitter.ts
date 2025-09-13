import axios, { AxiosInstance } from 'axios'
import { parse, HTMLElement } from 'node-html-parser';

import { Tweet } from '../types/twitter'

class Twitter {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://fixupx.com',
      headers: {
        // NOTE: UserAgent を Googlebot にすると OGP などのタグを返してくれる
        'User-Agent': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'
      }
    })
  }

  async lookupTweet(tweetUrl: string): Promise<Tweet> {
    const tweetUrlMatchPattern = new RegExp('^https://(twitter|x).com/([a-zA-Z0-9_]+)/status/([0-9]+)$', 'i');
    const matchPettern = tweetUrl.match(tweetUrlMatchPattern);
    if (matchPettern === null) {
      throw new Error('Not match tweet url pattern');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, server, user, id] = matchPettern;
    const response = await this.fetchTweet(user, id);
    const html: HTMLElement = parse(response);
    const urlElement = html.querySelector('link[rel="canonical"]');
    const url = urlElement?.attrs.href;
    if (!url || !url.match(tweetUrlMatchPattern)) {
      throw new Error('Failed fetching data');
    }

    const identifier = url.replace(tweetUrlMatchPattern, '$3');

    const userId = url.replace(tweetUrlMatchPattern, '$2');

    if (!identifier || !userId) {
      throw new Error('Failed parsing data');
    }

    const imageUrlElement = html.querySelector('meta[property="og:image"]')

    if (!imageUrlElement) {
      throw new Error('Failed fetching image url');
    }

    const mediaUrls = this.getMediaUrlFromMosaic(imageUrlElement?.attrs.content);

    if (mediaUrls.length === 0) {
      throw new Error('Failed fetching image url');
    }

    return {
      identifier,
      url,
      userId,
      imageUrls: mediaUrls,
    } as Tweet
  }

  async fetchTweet(user: string, id: string | number) {
    const response = await this.client.get(`/${user}/status/${id}`);
    return response.data;
  }

  getMediaUrlFromMosaic(mediaUrl: string): Array<string> {
    // 単一画像の場合: 直接 pbs.twimg.com のURLが返ってくる
    // ?name=orig パラメータが付いている場合もあるので、それも考慮
    if (mediaUrl.match(/^https:\/\/pbs\.twimg\.com\/media\/[a-zA-Z0-9_-]+\.(jpg|png)(\?.*)?$/)) {
      // ?name=orig などのパラメータを削除して返す
      return [mediaUrl.split('?')[0]];
    }
    
    // 複数画像の場合: fixupx.com の mosaic URL
    // 新しいフォーマット: https://mosaic.fxtwitter.com/jpeg/{tweetId}/{mediaId1}/{mediaId2}/...
    const matches = mediaUrl.match(/^https:\/\/mosaic\.fxtwitter\.com\/jpeg\/[0-9]+\/(([a-zA-Z0-9_-]+\/?)+)$/);
    if (matches === null) {
      throw new Error('Not match mosaic url pattern');
    }
    const mosaicMeidaIds = matches[1];
    return mosaicMeidaIds.split('/').map((mediaId) => {
      return `https://pbs.twimg.com/media/${mediaId}.jpg`
    });
  }
}

export default Twitter;
