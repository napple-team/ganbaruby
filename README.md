# ganbaruby

⌒°(・ω・)°⌒

Twitter の投稿IDを投げると ~~Tumblr に展開~~ Amazon S3 に保存してくれるやつ

## Usage

### Setup Environments

- `.env.sample` ファイルを参考に `TWTR_OAUTH_*` には Twitter に登録したアプリの各種キー、 `AWS_**` も同様に AWS のキーを登録する

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
  -d '{"tweetUrl":"https://twitter.com/MITLicense/status/1310171890162438145"}'
```

## License

Under the [MIT License](LICENSE)

## Copyright

&copy; 2020 windyakin
