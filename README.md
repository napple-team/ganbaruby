# ganbaruby

⌒°(・ω・)°⌒

Twitter の画像つきツイートのURLを投げると Tumblr にポストしつつ Amazon S3 にも保存してくれるやつ

## Usage

### Setup Environments

`.env.sample` ファイルを参考に `.env` ファイルを用意します。

- `TWTR_OAUTH_*` には Twitter に登録したアプリの各種キー
- `TUMBLR_OAUTH_*` は Tumblr のアプリのキーを登録する
  - Tumblr の `ACCESS_TOKEN_KEY` ・ `ACCESS_TOKEN_SECRET` は [Tumblr の API コンソール](https://api.tumblr.com/console) から発行することができるのでそれを使う
- `TUMBLR_POST_BLOG_NAME` は投稿したいブログのURLが `https://nihongo.tumblr.com/` であれば `nihongo` を指定する
- `AWS_*` も同様に AWS の IAM から発行したアカウントのキーを登録する

### Build

```
docker-compose build
```

### Start

```
docker-compose -f docker-compose.yml -f docker-compose.development.yml up -d
```

以下のようにすることで通常の起動コマンドで立ち上げることもできます

```
mv docker-compose.development.yml docker-compose.override.yml
docker-compose up -d
```

## Endpoints

### `POST /post`

```bash
curl -X POST \
  -H 'Content-type: application/json' \
  -d '{"tweetUrl":"https://twitter.com/MITLicense/status/1310171890162438145"}' \
  http://ganbaruby/post
```

## License

Under the [MIT License](LICENSE)

## Copyright

&copy; 2020 windyakin
