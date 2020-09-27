# ganbaruby

⌒°(・ω・)°⌒

Twitter の投稿IDを投げると Tumblr に展開してくれるやつ

## Usage

### Setup Environments

- `.env.sample` ファイルを参考に `TWTR_OAUTH_*` には Twitter に登録したアプリの各種キー、 `TUMBLR_OAUTH_*` も同様に Tumblr のアプリのキーを登録する
  - Tumblr の `ACCESS_TOKEN_KEY` ・ `ACCESS_TOKEN_SECRET` は [Tumblr の API コンソール](https://api.tumblr.com/console) から発行することができるのでそれを使う
- `TUMBLR_POST_BLOG_NAME` は投稿したいブログのURLが `https://nihongo.tumblr.com/` であれば `nihongo` を指定する


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

Request sample

```json
{
  "tweetUrl": "https://twitter.com/MITLicense/status/1310171890162438145"
}
```

- `tweetUrl` はツイートのURL
- 指定したURLのツイートに画像が含まれていればその画像を Tumblr に POST します

## License

Under the [MIT License](LICENSE)

## Copyright

&copy; 2020 windyakin
