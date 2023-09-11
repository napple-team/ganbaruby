import axios, { AxiosInstance } from 'axios'
import { parse, HTMLElement } from 'node-html-parser';

class Twitter {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://twitter.com',
      headers: {
        // NOTE: UserAgent を Googlebot にすると OGP などのタグを返してくれる
        'User-Agent': 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'
      }
    })
  }

  async lookupTweet(id: string | number): Promise<any> {
    const response = await this.client.get(
      `/i/web/status/${id}`
    );
    const html = parse(response.data);
    const identifierElement = html.querySelector('meta[itemProp="identifier"]')

    if (!identifierElement || identifierElement.attrs.content !== id) {
      throw new Error('Failed fetching data');
    }

    const parsedData = this.parse(html);

    return parsedData;
  }

  parse(html: HTMLElement) {
    const identifierElement = html.querySelector('meta[itemProp="identifier"]')
    const identifier = identifierElement?.attrs.content;
    const urlElement = html.querySelector('meta[itemProp="url"]');
    const url = urlElement?.attrs.content;
    const userIdElement = html.querySelector('div[itemProp="author"] > meta[itemProp="additionalName"]');
    const userId = userIdElement?.attrs.content;
    const imageElements = html.querySelectorAll('div[itemProp="image"] > meta[itemProp="contentUrl"]');
    const images = imageElements.map((imageElement) => imageElement?.attrs.content);

    if (!identifier || !url || !userId || images.length === 0) {
      throw new Error('Failed parsing data');
    }

    return {
      identifier,
      url,
      userId,
      images
    }
  }
}

export default Twitter;
