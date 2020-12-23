import express from 'express';
import helmet from 'helmet'
import morgan from 'morgan'
import basicAuth from 'express-basic-auth'
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { TweetController } from './controller/tweet-controller';

const app = express()
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.disable('x-powered-by')

if (process.env.SENTRY_DSN) {
  console.log(process.env.SENTRY_DSN)
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  app.use((err: any, req: any, res: any, next: any) => {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  });
}

if ( process.env.BASIC_USER && process.env.BASIC_PASS ) {
  app.use(basicAuth({
    users: { [process.env.BASIC_USER]: process.env.BASIC_PASS },
    challenge: true
  }))
}

app.get('/', (req, res) => {
  throw new Error('sentry test')
  res.send('⌒°(・ω・)°⌒')
})

app.post('/post', async (req, res) => {
  try {
    TweetController.execute(req, res)
  } catch (err) {
    res.status(500)
    throw err;
  }
})

app.listen(3000);
