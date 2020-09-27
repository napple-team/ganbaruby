import { Request, Response } from 'express-serve-static-core'
import axios, { AxiosResponse } from 'axios'
import path from 'path'
import { promises as fs } from 'fs'
import uuid from 'uuid-random';

import { Twitter } from '../module/twitter'
import { Status as Tweet } from '../types/twitter'
import { Tumblr } from '../module/tumblr';

export class TweetController {
  static async execute(req: Request, res: Response) {
    const twitterClient = new Twitter()
    let tweet: Tweet = {} as Tweet

    const matchPettern = new RegExp('^https://twitter.com/[a-zA-Z0-9_]+/status/([0-9]+)', 'i');
    const requestTweetUrl = req.body.tweetUrl || ''

    if (!requestTweetUrl || requestTweetUrl.match(matchPettern).length === 0) {
      res.status(422).send('Not match tweet url pattern')
      return
    }

    const tweetId: string = requestTweetUrl.replace(matchPettern, '$1')

    try {
      tweet = await twitterClient.lookupTweet(tweetId)
      if ( !tweet.extended_entities || !tweet.extended_entities.media ) {
        res.status(404).send('Tweet has no media')
        return
      }
    } catch (err) {
      throw err;
    }

    const photoMedia = tweet.extended_entities.media.filter((media: any) => media.type === 'photo')

    if ( photoMedia.length === 0 ) {
      res.status(404).send('Tweet has no image photos')
      return
    }

    const workspaceDirPath = path.resolve(process.cwd(), `temp/${uuid()}`)
    await fs.mkdir(workspaceDirPath)

    const savedPhotoPaths: Array<string> = await Promise.all(photoMedia.map(async (media: any): Promise<string> => {
      const ext: string = media.media_url_https.split('.').pop()
      const image: AxiosResponse = await axios.get(
        `${media.media_url_https}?format=${ext}&name=orig`,
        { responseType: 'arraybuffer' }
      )
      const imagePath = path.resolve(workspaceDirPath, `${media.id}.${ext}`)
      await fs.writeFile(imagePath, Buffer.from(image.data, 'binary'))
      return imagePath
    }))

    const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    const caption = `<a href="${tweetUrl}">${tweet.user.name} (@${tweet.user.screen_name}) 「${tweet.text}」 / Twitter</a>`

    const tumblrClient = new Tumblr()
    const response = await tumblrClient.postPhotos(process.env.TUMBLR_POST_BLOG_NAME || '', caption, savedPhotoPaths)
    const tumblrPostUrl = `https://${process.env.TUMBLR_POST_BLOG_NAME}.tumblr.com/post/${response.id}`
    await fs.rmdir(workspaceDirPath, { recursive: true })

    res.send(`${tweetUrl} send to ${tumblrPostUrl}`)
  }
}
