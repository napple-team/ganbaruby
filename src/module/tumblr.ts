import tumblr from 'tumblr.js'
import fs from 'fs'

import { Twitter } from './twitter'
import { Status as Tweet } from '../types/twitter'

export class Tumblr {
  private client: tumblr.TumblrClient
  private blogId: string

  constructor() {
    this.client = tumblr.createClient({
      consumer_key: process.env.TUMBLR_OAUTH_API_CONSUMER_KEY,
      consumer_secret: process.env.TUMBLR_OAUTH_API_SECRET_KEY,
      token: process.env.TUMBLR_OAUTH_ACCESS_TOKEN_KEY,
      token_secret: process.env.TUMBLR_OAUTH_ACCESS_TOKEN_SECRET
    })
    if (!process.env.TUMBLR_POST_BLOG_NAME) {
      throw new Error('No specific Tumblr blog ID')
    }
    this.blogId = process.env.TUMBLR_POST_BLOG_NAME
  }

  postPhotos(tweet: Tweet, photoPaths: Array<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.createPhotoPost(this.blogId, {
        caption: Tumblr.createCaption(tweet),
        data: photoPaths.map(path => fs.createReadStream(path))
      }, (err, response) => {
        if (err) reject(err)
        resolve(response)
      })
    });
  }

  static createCaption(tweet: Tweet): string {
    const tweetText = tweet.text.replace(/\r?\n/, ' ')
    return `<a href="${Twitter.generateTweetUrl(tweet)}">${tweet.user.name} (@${tweet.user.screen_name}) 「${tweetText}」 / Twitter</a>`
  }
}
