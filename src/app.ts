import express from 'express';
import helmet from 'helmet'
import morgan from 'morgan'
import basicAuth from 'express-basic-auth'

import { TweetController } from './controller/tweet-controller';

const app = express()
app.use(helmet())
app.use(morgan('combined'));
app.disable('x-powered-by')

if ( process.env.BASIC_USER && process.env.BASIC_PASS ) {
  app.use(basicAuth({
    users: { [process.env.BASIC_USER]: process.env.BASIC_PASS },
    challenge: true
  }))
}

app.get('/', (req, res) => {
  res.send('⌒°(・ω・)°⌒')
})

app.get('/tweet/:id', async (req, res) => {
  try {
    TweetController.execute(req, res)
  } catch (err) {
    res.status(500)
    throw err;
  }
})

app.listen(3000);
