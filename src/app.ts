import express from 'express';
import helmet from 'helmet'
import morgan from 'morgan'

import { TweetController } from './controller/tweet-controller';

const app = express()
app.use(helmet())
app.use(morgan('combined'));
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.send('nakamise')
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
