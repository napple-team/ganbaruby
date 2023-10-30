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
        'User-Agent': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'
      }
    })
  }

  async lookupTweet(id: string | number): Promise<Tweet> {
    const tweetUrlMatchPattern = new RegExp('^https://twitter.com/([a-zA-Z0-9_]+)/status/([0-9]+)$', 'i');
    const response = await this.fetchTweet(id);
    const html: HTMLElement = parse(response);
    const urlElement = html.querySelector('link[rel="canonical"]');
    const url = urlElement?.attrs.href;

    if (!url || !url.match(tweetUrlMatchPattern)) {
      throw new Error('Failed fetching data');
    }

    const identifier = url.replace(tweetUrlMatchPattern, '$2');

    const userId = url.replace(tweetUrlMatchPattern, '$1');

    if (!identifier || !userId) {
      throw new Error('Failed parsing data');
    }

    const imageUrlElement = html.querySelector('meta[property="og:image"]')
    const imageUrl = imageUrlElement?.attrs.content;

    if (!imageUrlElement || !imageUrl) {
      throw new Error('Failed fetching image url');
    }

    const imageUrls = [imageUrl].map((url) => {
      return url.replace(/:large$/, '')
    })

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
