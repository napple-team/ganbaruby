import crypto from 'crypto'
import axios from 'axios'
import OAuth from 'oauth-1.0a'
import { Status as Tweet } from '../types/twitter'

export class Twitter {
  private oauthClient: OAuth

  constructor() {
    this.oauthClient = new OAuth({
      consumer: {
        key: process.env.TWTR_OAUTH_API_CONSUMER_KEY || '',
        secret: process.env.TWTR_OAUTH_API_SECRET_KEY || ''
      },
      signature_method: 'HMAC-SHA1',
      hash_function: this.hashFunction,
    })
  }

  async lookupTweet(id: string | number): Promise<Tweet> {
    const request = {
      url: `https://api.twitter.com/1.1/statuses/lookup.json?id=${id}`,
      method: 'GET'
    }
    const response = await axios.get(request.url, {
      headers: this.authorizeHeader(request)
    })
    if (Array.isArray(response.data) && response.data.length === 1) {
      return response.data[0]
    } else {
      throw new Error('Got empty or multi array data')
    }
  }

  static generateTweetUrl(tweet: Tweet): string {
    return `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
  }

  private authorizeHeader(request: any) {
    return this.oauthClient.toHeader(
      this.oauthClient.authorize(request, {
        key: process.env.TWTR_OAUTH_ACCESS_TOKEN_KEY || '',
        secret: process.env.TWTR_OAUTH_ACCESS_TOKEN_SECRET || ''
      })
    )
  }

  private hashFunction(base_string: string, key: any): string {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64')
  }
}
