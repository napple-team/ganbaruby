import dotenv from 'dotenv'
import axios, { AxiosResponse } from 'axios'
import path from 'path'
import { promises as fs } from 'fs'

import { Twitter } from '~/twitter'
import { Status as Tweet } from '~/types/twitter'

(async () => {
  dotenv.config()

  const twitterClient = new Twitter()
  const tweet: Tweet = await twitterClient.lookupTweet('1308763864968777728')
  console.log(JSON.stringify(tweet))
  if ( !tweet.extended_entities || !tweet.extended_entities.media ) return

  const photoMedia = tweet.extended_entities.media.filter((media: any) => media.type === 'photo')

  if ( photoMedia.length === 0 ) return

  const savedPhotoPaths: Array<string> = await Promise.all(photoMedia.map(async (media: any): Promise<string> => {
    const ext: string = media.media_url_https.split('.').pop()
    const image: AxiosResponse = await axios.get(
      `${media.media_url_https}?format=${ext}&name=orig`,
      { responseType: 'arraybuffer' }
    )
    const imagePath = path.resolve(process.cwd(), `temp/${media.id}.${ext}`)
    await fs.writeFile(imagePath, Buffer.from(image.data, 'binary'))
    return imagePath
  }))
})();
