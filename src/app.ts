import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { promises as fs } from 'fs'

import { Twitter } from '~/twitter'

(async () => {
  dotenv.config()

  const twitterClient = new Twitter()
  const tweet = await twitterClient.lookupTweet('1308763864968777728')
  console.log(JSON.stringify(tweet))

  const photoMedia = tweet.entities.media.filter((media: any) => media.type === 'photo')

  if ( photoMedia.length === 0 ) return

  const savedPhotoPaths = await Promise.all(photoMedia.map(async (media: any) => {
    const ext = media.media_url_https.split('.').pop()
    const image = await axios.get(
      `${media.media_url_https}?format=${ext}&name=orig`,
      { responseType: 'arraybuffer' }
    )
    const imagePath = path.resolve(process.cwd(), `temp/${media.id}.${ext}`)
    await fs.writeFile(imagePath, Buffer.from(image.data, 'binary'))
    return imagePath
  }))
})();
