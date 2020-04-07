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

## main.js

「ぶきわかるくん Discord Bot」での実際のコードを紹介します。  
表記の仕方を自分好みに変えたりしてご利用下さい。

```javascript
// Response for Uptime Robot
const http = require("http");
const axios = require("axios");

http
  .createServer(function(request, response) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Discord bot is active now \n");
  })
  .listen(3000);

// Discord bot implements
const discord = require("discord.js");
const client = new discord.Client();

client.on("ready", message => {
  client.user.setPresence({ game: { name: "SINoALICE ーシノアリスー" } });
  console.log("bot is ready!");
});

client.on("message", message => {
  // 自分のメッセージには反応しない
  if (message.author.id == "botのCLIENT_IDを入力") {
    return;
  }

  // bot宛かつ画像添付時
  if (message.isMemberMentioned(client.user) && message.attachments.size > 0) {
    // 画像形式チェック
    if (message.attachments.every(attachIsImage)) {
      message.attachments.forEach(function(attachment) {
        const url = `https://bukiwakaru.herokuapp.com/api/measurement?key={API_KEY}&img=${attachment.url}`;
        axios
          .get(url)
          .then(response => {
            if (response.data.error) {
              message.channel.send("画像が正しくありません");
              return;
            }
            message.channel.send("解析を開始します。しばらくお待ち下さい。");
            const data = response.data;
            const img = data.img;
            const coordinates = data.coordinates;
            let weapons = \[];
            let text = "解析完了！\n";
            const loop = async () => {
              for (let i = 0; i &lt; coordinates.length; i++) {
                let coordinate = coordinates[i];
                const url = `https://bukiwakaru.herokuapp.com/api/recognition?key={API_KEY}&i=${img}&x=${coordinate.x}&y=${coordinate.y}`;
                console.log(url);
                await axios
                  .get(url)
                  .then(response => {
                    const weapon = response.data;
                    if (response.data.error) return;
                    //console.log(weapon);
                    weapons[i] = `【${weapon.name}】${weapon.gvg_skill},${weapon.gvg2_skill},${returnAttribute(weapon.attribute)}`;
                    //weapons[i] = `【${i + 1}】${weapon.name},${weapon.quest_skill},${weapon.gvg_skill},${weapon.gvg2_skill},${returnAttribute(weapon.attribute)},${weapon.cost},${returnRarity(weapon.rarity)}`;
                  })
                  .catch(error => {
                    console.log(error);
                    message.reply(error);
                  });
                await sleep();
              }
            };
            loop().then(() => {
              console.log(weapons);
              weapons.forEach(
                weapon => (text += weapon + "\n")
                //console.log(weapon)
              );
              message.reply(text);
            });
          })
          .catch(error => {
            console.log(error);
            message.reply(error);
          });
      });
    }
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.log("please set ENV: DISCORD_BOT_TOKEN");
  process.exit(0);
}

// PNGとJPEG画像のみ反応
function attachIsImage(msgAttach) {
  var url = msgAttach.url;
  return (
    url.indexOf("png", url.length - "png".length) !== -1 ||
    url.indexOf("jpg", url.length - "jpg".length) !== -1
  );
}

// 属性判定
function returnAttribute(id) {
  if (id === 1) {
    return "火";
  } else if (id === 2) {
    return "水";
  } else if (id === 3) {
    return "風";
  }
}

// レアリティ判定
function returnRarity(id) {
  if (id === 4) {
    return "S";
  } else if (id === 5) {
    return "SS";
  } else if (id === 6) {
    return "L";
  }
}

// スリーブ
function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

client.login(process.env.DISCORD_BOT_TOKEN);
```
