import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { parse, HTMLElement } from 'node-html-parser';

import { Tweet } from '../types/twitter'

class Twitter {
  public client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://twitter.com',
      headers: {
        // NOTE: UserAgent を Googlebot にすると OGP などのタグを返してくれる
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    })
  }

  async lookupTweet(id: string | number): Promise<Tweet> {
    const response = await this.fetchTweet(id);
    const html: HTMLElement = parse(response);
    const identifierElement = html.querySelector('meta[itemProp="identifier"]')
    const tweetPart = html.querySelector('div[itemProp="hasPart"]')

    if (!tweetPart || !identifierElement || identifierElement.attrs.content !== id) {
      throw new Error('Failed fetching data');
    }

    const identifier = identifierElement?.attrs.content;
    const urlElement = tweetPart.querySelector('meta[itemProp="url"]');
    const url = urlElement?.attrs.content;
    const userIdElement = tweetPart.querySelector('div[itemProp="author"] > meta[itemProp="additionalName"]');
    const userId = userIdElement?.attrs.content;
    const imageElements = tweetPart.querySelectorAll('div[itemProp="image"] > meta[itemProp="contentUrl"]');
    const imageUrls = imageElements.map((imageElement) => imageElement?.attrs.content);

    if (!identifier || !url || !userId || imageUrls.length === 0) {
      throw new Error('Failed parsing data');
    }

    return {
      identifier,
      url,
      userId,
      imageUrls
    } as Tweet
  }

  async fetchTweet(id: string | number) {
    const response = await this.client.get(`/i/web/status/${id}`);
    return response.data;
  }
}

export default Twitter;
