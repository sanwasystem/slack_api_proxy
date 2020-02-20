slack api proxy
===============

SlackのIncoming Webhooks, File upload APIのラッパーLambda。

### パラメータ
| パラメータ名               | 意味                                                |
|---------------------------|----------------------------------------------------|
| `channel`                 | チャンネル名、またはユーザー名                       |
| `name` または `username`  | 通知する際の名前                                     |
| `icon` または `user_icon` | 通知する際のアイコン。前後のコロンは省略可能            |
| `text`                   | 送信するテキストメッセージの内容、またはテキストファイルの内容   |
| `file`                    | 送信するファイルの内容                               |
| `filename`                | 送信するスニペット・ファイルのファイル名               |
| `mode`                   | `json` を与えると `text` をJSONとみなしてそのままSlackに送信する。複雑なフォーマットの場合に使える。 `snippet` を与えると `text` の内容をスニペットとして送信する | 

### API Gateway経由で利用する場合
#### テキストメッセージを送信する
##### GETで送信
テキスト、チャンネル名等をクエリパラメーターに含めてGETを送る。

```sh
curl \
    -G \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    -d 'text=HELLO%20WORLD&channel=@username' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

##### POSTで送信
同様にテキスト、チャンネル名等をPOSTで送ればテキストメッセージが送信できる。

```sh
curl -X POST \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    --form-string 'channel=@username' \
    -F "text=HELLO WORLD" \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

```sh
curl -X POST \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    --form-string 'channel=@username' \
    -F 'text=@utf-8-file-text.txt' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

#### 複雑なテキストメッセージを送信する
[複雑なテキストメッセージ](https://api.slack.com/messaging/webhooks)を送信する場合は `mode` パラメーターに `json` を指定し、 `text` にJSON形式のテキストまたはファイルを与える。GETでもPOSTでも使える。

```sh
curl \
    -G \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    -d 'mode=json&channel=@username&text=...' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

`...` の部分はJSONをURLエンコードしたもの。

```
%7B%22text%22%3A%20%22Nya-%22%2C%22attachments%22%3A%20%5B%7B%22color%22%3A%20%22%23
D00000%22%2C%22fields%22%3A%20%5B%7B%22title%22%3A%20%22Aisatsu%22%2C%22value%22%3A
%20%22Nya!%20Nya!%20Nya!%22%7D%5D%7D%5D%7D
```

```sh
curl -X POST \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    --form-string 'channel=@username' \
    -F 'mode=json' \
    -F 'text={"text": "Nya-","attachments": [{"color": "#00FF00","fields": [{"title": "Aisatsu","value": "Nya! Nya! Nya!"}]}]}' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

```sh
curl -X POST \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    --form-string 'channel=@username' \
    -F 'mode=json' \
    -F 'text=@message.json' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

#### スニペット・ファイルを送信する
##### GETで送信（スニペットを送信する）
```sh
curl \
    -G \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    -d 'text=HELLO%20WORLD&channel=@username&mode=snippet' \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

`mode` に `sinppet` を指定する。それ以外の場合は通常のメッセージ送信になる。

##### POSTで送信
```sh
curl -X POST \
    -H 'x-api-key:XXXX_MY_API_KEY_XXXX' \
    -F 'filename=filename_to_overwrite.txt' \
    --form-string "channel=@username" \
    -F "file=@utf8-test-file.txt" \
    https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/xxxx/slack
```

`filename` パラメータは省略可能。またテキストファイルでなければ自動的にファイル送信になる。

### Lambdaを直接呼び出す場合
#### テキストメッセージ・複雑なテキストメッセージを送信する
`text` に送信するテキストまたはJSONを与える。
```json
{
    "channel": "@username",
    "text": "HELLO, WORLD!"
}
```

```json
{
    "channel": "@username",
    "text": {
        "text": "Nya-",
        "attachments": [
            {
            "color": "#00FF00",
            "fields": [
                {
                "title": "Aisatsu",
                "value": "Nya! Nya! Nya!"
                }
            ]
            }
        ]
    }
}
```

`text` の中に `text` が入るので注意。

#### スニペットを送信する
`text` に送信するテキスト、 `mode` に `snippet` を与える。
```json
{
    "channel": "@username",
    "mode": "snippet",
    "text": "HELLO, WORLD!"
}
```

#### バイナリファイルを送信する
`base64` にBASE64エンコードしたデータを与える。
```json
{
    "channel": "@username",
    "filename": "binary.zip",
    "base64": "....."
}
```


### セットアップ
#### Slack
##### Incoming WebHooks
https://YOUR-DOMAIN.slack.com/apps/manage/custom-integrations から Incoming WebHooks のエンドポイントを作成する。

Slack AppのIncoming Webhooksは **送信先チャンネル・名前等を指定できない** という制限があるため利用していない。送信するデータの形式にも互換性がないため、そちらのエンドポイントを指定してしまうと動作しない。

#### Slack App
ファイルアップロードを行えるようにするため、 Slack Appを作成、 Add features and functionality → Permissions → Scopes から `files:write` を有効にする。

これができたらBOTを必要なチャンネルに招待しておく。

#### API Gateway
* API GatewayでBinary Media Typesには `*/*` を指定する。
  * これでペイロードに何が渡されてもLambdaにはBase64でエンコードされた値が渡されるようになる。
* POST, GETを受け付けるエンドポイントを作り、それぞれで `Use Lambda Proxy integration` を有効にする。

#### Lambda
環境変数を設定する。

* `defaultChannel`: チャンネル名が指定されたなかったときのデフォルト送信先チャンネル
* `defaultName`: ユーザーネームが指定されなかったときのデフォルト値
* `defaultIcon`: アイコンが指定されなかったときのデフォルト値。コロンは省略可能
* `webhookUrl`: Incoming Webhookのエンドポイント。 `https://hooks.slack.com/...` の形式
* `botToken`: BOTのアクセストークン。 `xoxb-....` の形式

#### 暗号化は？
してない
