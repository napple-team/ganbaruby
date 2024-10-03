import express from 'express';
import helmet from 'helmet'
import morgan from 'morgan'
import basicAuth from 'express-basic-auth'

import { SaveController } from './controller/save-controller';
import Twitter from './lib/twitter'

const app = express()
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.disable('x-powered-by')

if ( process.env.BASIC_USER && process.env.BASIC_PASS ) {
  app.use(basicAuth({
    users: { [process.env.BASIC_USER]: process.env.BASIC_PASS },
    challenge: true
  }))
}

const twitterClient = new Twitter();

app.set('twitterClient', twitterClient);

app.get('/', (req, res) => {
  res.send('⌒°(・ω・)°⌒')
})

app.post('/save', async (req, res) => {
  try {
    await SaveController.execute(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).send()
  }
});

app.listen(3000);
