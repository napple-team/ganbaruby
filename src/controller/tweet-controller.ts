import { Request, Response } from 'express-serve-static-core'
import axios, { AxiosResponse } from 'axios'
import path from 'path'
import { promises as fs } from 'fs'
import uuid from 'uuid-random';

import { Status as Tweet } from '../types/twitter'
import { MediaEntity } from 'twitter-d';
import { Twitter } from '../module/twitter'
import { S3 } from '../module/s3';
import { Tumblr } from '../module/tumblr';

export class TweetController {
  static async execute(req: Request, res: Response): Promise<void> {
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
    } catch(err) {
      res.status(500).send('Lookup tweet is something error')
    }
    if ( !tweet.extended_entities || !tweet.extended_entities.media ) {
      res.status(404).send('Tweet has no media')
      return
    }

    const photoMedia = tweet.extended_entities.media.filter((media: MediaEntity) => media.type === 'photo')

    if ( photoMedia.length === 0 ) {
      res.status(404).send('Tweet has no image photos')
      return
    }

    const workspaceDirPath = path.resolve(process.cwd(), `temp/${uuid()}`)
    await fs.mkdir(workspaceDirPath)

    const savedPhotoPaths: Array<string> = await Promise.all(photoMedia.map(async (media): Promise<string> => {
      const ext: string = media.media_url_https.split('.').pop() || 'jpg'
      const image: AxiosResponse = await axios.get(
        `${media.media_url_https}?format=${ext}&name=orig`,
        { responseType: 'arraybuffer' }
      )
      const imagePath = path.resolve(workspaceDirPath, `${media.id}.${ext}`)
      await fs.writeFile(imagePath, Buffer.from(image.data, 'binary'))
      return imagePath
    }))

    const tweetUrl = Twitter.generateTweetUrl(tweet)

    const tumblrClient = new Tumblr();
    try {
      await tumblrClient.postPhotos(tweet, savedPhotoPaths)
    } catch(err) {
      console.error(err)
    }

    const s3Client = new S3();
    try {
      await s3Client.postPhotos(tweet.id_str, savedPhotoPaths, {
        timestamp: req.body.timestamp,
        tweetUser: tweet.user.screen_name,
      });
    } catch (err) {
      console.error(err)
    }

    await fs.rmdir(workspaceDirPath, { recursive: true })

    res.send(`Completed: ${tweetUrl}\n`)
  }
}
