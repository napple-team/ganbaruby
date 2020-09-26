import { Twitter } from '~/twitter'

import dotenv from 'dotenv'

(async () => {
  dotenv.config()
  const twitterClient = new Twitter()
  const tweet = await twitterClient.lookupTweet('1308763864968777728')
  console.log(JSON.stringify(tweet))
})();
