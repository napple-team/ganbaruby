import express from 'express';
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import axios, { AxiosResponse } from 'axios'
import path from 'path'
import { promises as fs } from 'fs'
import uuid from 'uuid-random';

import { Twitter } from '~/twitter'
import { Status as Tweet } from '~/types/twitter'
import { Tumblr } from '~/tumblr';

dotenv.config()
const app = express()
app.use(helmet())
app.use(morgan('combined'));
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.send('nakamise')
})

app.get('/tweet/:id', async (req, res) => {
  const twitterClient = new Twitter()
  const tweet: Tweet = await twitterClient.lookupTweet(req.params.id)
  if ( !tweet.extended_entities || !tweet.extended_entities.media ) return

  const photoMedia = tweet.extended_entities.media.filter((media: any) => media.type === 'photo')

  if ( photoMedia.length === 0 ) return

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

  const caption = `<a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}">${tweet.user.name} (@${tweet.user.screen_name}) 「${tweet.text}」 / Twitter</a>`

  const tumblrClient = new Tumblr()
  await tumblrClient.postPhotos(process.env.TUMBLR_POST_BLOG_NAME || '', caption, savedPhotoPaths)

  await fs.rmdir(workspaceDirPath, { recursive: true })

  res.send('response')
})

app.listen(3000);
