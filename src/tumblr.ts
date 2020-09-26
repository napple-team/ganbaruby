import tumblr from 'tumblr.js'
import fs from 'fs'

export class Tumblr {
  private client: tumblr.TumblrClient

  constructor() {
    this.client = tumblr.createClient({
      consumer_key: process.env.TUMBLR_OAUTH_API_CONSUMER_KEY,
      consumer_secret: process.env.TUMBLR_OAUTH_API_SECRET_KEY,
      token: process.env.TUMBLR_OAUTH_ACCESS_TOKEN_KEY,
      token_secret: process.env.TUMBLR_OAUTH_ACCESS_TOKEN_SECRET
    })
  }

  postPhotos(blogId: string, caption: string, photoPaths: Array<string>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.createPhotoPost(blogId, { caption, data: photoPaths.map(path => fs.createReadStream(path)) }, (err, response) => {
        if (err) reject(err)
        resolve(response)
      })
    });
  }
}
