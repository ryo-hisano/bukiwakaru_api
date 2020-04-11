# ぶきわかるくん Discord Bot

ほとんど下記のページにやり方は書いてあります。  
[簡単な Discord Bot の作り方（初心者向け）｜ bami ｜ note](https://note.com/bami55/n/ncc3a68652697)

「ぶきわかるくん Discord Bot」では、ギルドグループチャット内での利用を考慮し、モノガタリスキルを出さなかったりなど、最小限の情報を表示させています。

JavaScript が分かる方であれば、応用して下記のことが出来ることと思います。

- 解析した武器を一つずつ Bot にリプライさせる
- Google スプレッドシートに武器リストを書き出す
- 総コスト数を算出する
- SINoALICE Database 様の武器ページへリンクを貼る
- 補助支援の数を数える…など

## .env

```
DISCORD_BOT_TOKEN={Botのトークン}
DISCORD_BOT_CLIENT_ID={BotのクライアントID}
BUKIWAKARU_API_KEY={API_KEY}
```

## main.js

「ぶきわかるくん Discord Bot」での実際のコードは[こちら](https://github.com/ryo-hisano/bukiwakaru_api/blob/master/main.js)
です。  
表記の仕方を自分好みに変えたりしてご利用下さい。
