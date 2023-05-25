import { Request, Response } from 'express-serve-static-core'
import axios, { AxiosResponse } from 'axios'
import path from 'path'
import { promises as fs } from 'fs'
import uuid from 'uuid-random';

import S3 from '../lib/s3';
import { Tweet } from '../types/twitter'

export class SaveController {
  static async execute(req: Request, res: Response): Promise<void> {
    const twitterClient = req.app.get('twitterClient')

    const matchPettern = new RegExp('^https://twitter.com/[a-zA-Z0-9_]+/status/([0-9]+)', 'i');
    const requestTweetUrl = req.body.tweetUrl || ''

    if (!requestTweetUrl || requestTweetUrl.match(matchPettern).length === 0) {
      res.status(422).send('Not match tweet url pattern')
      return
    }

    const tweetId: string = requestTweetUrl.replace(matchPettern, '$1')

    let tweet: Tweet = {} as Tweet

    try {
      tweet = await twitterClient.lookupTweet(tweetId)
    } catch(err) {
      res.status(500).send('Lookup tweet is something error')
    }
    if (tweet.imageUrls.length === 0) {
      res.status(404).send('Tweet has no media')
      return
    }

    const workspaceDirPath = path.resolve(process.cwd(), `temp/${uuid()}`)
    await fs.mkdir(workspaceDirPath)

    const savedPhotoPaths: Array<string> = await Promise.all(tweet.imageUrls.map(async (imageUrl, index): Promise<string> => {
      const ext: string = imageUrl.split('.').pop() || 'jpg'
      const image: AxiosResponse = await axios.get(
        `${imageUrl}?format=${ext}&name=orig`,
        { responseType: 'arraybuffer' }
      )
      const imagePath = path.resolve(workspaceDirPath, `${tweet.identifier}_${index}.${ext}`)
      await fs.writeFile(imagePath, Buffer.from(image.data, 'binary'))
      return imagePath
    }))

    const s3Client = new S3();
    try {
      await s3Client.postTweetPictures(tweet.identifier, savedPhotoPaths, {
        timestamp: req.body.timestamp,
        tweetUser: tweet.userId,
      });
    } catch (err) {
      console.error(err)
    }

    await fs.rmdir(workspaceDirPath, { recursive: true })

    res.send(`Completed: ${requestTweetUrl}\n`)
  }
}
