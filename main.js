// Response for Uptime Robot
const http = require("http");
const axios = require("axios");
const api_key = process.env.BUKIWAKARU_API_KEY;

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
  if (message.author.id == process.env.DISCORD_BOT_CLIENT_ID) {
    return;
  }

  if (message.isMemberMentioned(client.user)) {
    if (/help|HELP|へるぷ|ヘルプ/gi.test(message.content)) {
      let bot_message = "コマンド一覧は下記です（2020/04/11）。\n";
      bot_message += "```";
      bot_message +=
        "l|L\n調べる武器をL武器に絞ることで、処理時間が約半分以下と高速になります。\n\n";
      bot_message +=
        "s|summary|さまり|サマリ|がいよう|概要|ぶき|武器\nサマリ（【武器名】,コロシアムスキル,コロシアム補助スキル,属性）を表示します。\n\n";
      bot_message +=
        "c|C|ころ|コロ\nコロシアムスキルとその数を表示します。\n\n";
      bot_message +=
        "h|補助|ほじょ|ほ\nコロシアム補助スキルとその数を表示します。\n\n";
      bot_message +=
        "コマンドは複数組み合わせ可能です。\n例：@ぶきわかるくん lh（画像添付）、@ぶきわかるくん L武器サマリ（画像添付）";
      bot_message += "```";
      message.reply(bot_message);
    }
  }

  // bot宛
  let bot_message = "";

  // L武器のみフラグ
  let l_flag = false;

  // 表示形式フラグ
  let summary_flag = true;
  let col_skill_flag = true;
  let col_aid_skill_flag = true;

  // bot宛かつ画像添付時
  if (message.isMemberMentioned(client.user) && message.attachments.size > 0) {
    // 画像形式チェック
    if (message.attachments.every(attachIsImage)) {
      message.attachments.forEach(function(attachment) {
        // メッセージにコマンド含む場合
        bot_message += /l|L/gi.test(message.content)
          ? "L武器のみで解析を開始します。"
          : "全武器で解析を開始します。";
        bot_message += "しばらくお待ち下さい。";

        // L武器のみフラグ
        if (/l|L/gi.test(message.content)) {
          l_flag = true;
        }

        // 表示形式フラグ（一旦falseに）
        if (
          /s|summary|さまり|サマリ|がいよう|概要|ぶき|武器|c|C|ころ|コロ|h|補助|ほじょ|ほ/gi.test(
            message.content
          )
        ) {
          summary_flag = false;
          col_skill_flag = false;
          col_aid_skill_flag = false;
        }
        if (
          /s|summary|さまり|サマリ|がいよう|概要|ぶき|武器/gi.test(
            message.content
          )
        ) {
          summary_flag = true;
        }
        if (/c|C|ころ|コロ/gi.test(message.content)) {
          col_skill_flag = true;
        }
        if (/h|補助|ほじょ|ほ/gi.test(message.content)) {
          col_aid_skill_flag = true;
        }

        const url = `https://bukiwakaru.herokuapp.com/api/measurement?key=${api_key}&img=${attachment.url}`;
        //message.channel.send("<" + url + ">");
        axios
          .get(url)
          .then(response => {
            if (response.data.error) {
              message.channel.send("画像が正しくありません");
              return;
            }
            message.channel.send(bot_message);
            const data = response.data;
            const img = data.img;
            const coordinates = data.coordinates;
            let weapons = [];
            let text = "解析完了！\n";

            // コロシアムスキル
            let col_gvg_skills = [];

            // コロシアム補助スキル
            let col_gvgaid_skills = [];

            const loop = async () => {
              for (let i = 0; i < coordinates.length; i++) {
                let coordinate = coordinates[i];
                const type = l_flag ? "&t=l" : "";
                const url = `https://bukiwakaru.herokuapp.com/api/recognition?key=${api_key}&i=${img}&x=${coordinate.x}&y=${coordinate.y}${type}`;
                await axios
                  .get(url)
                  .then(response => {
                    const weapon = response.data;
                    // 武器の入っていないマス対応
                    if (response.data.error) return;
                    //console.log(response);
                    weapons[i] = `【${weapon.name}】${weapon.gvg_skill},${
                      weapon.gvg2_skill
                    },${returnAttribute(weapon.attribute)}`;
                    col_gvg_skills.push(weapon.gvg_skill);
                    col_gvgaid_skills.push(weapon.gvg2_skill);
                    /*weapons[i] = `【${i + 1}】${weapon.name},${
                      weapon.quest_skill
                    },${weapon.gvg_skill},${
                      weapon.gvg2_skill
                    },${returnAttribute(weapon.attribute)},${
                      weapon.cost
                    },${returnRarity(weapon.rarity)}`;*/
                  })
                  .catch(error => {
                    console.log("内err : " + error.response);
                    //message.reply(error);
                  });
                await sleep();
              }
            };
            loop().then(() => {
              if (weapons.length > 0) {
                if (summary_flag) {
                  weapons.forEach(weapon => (text += weapon + "\n"));
                  text += "\n";
                }

                if (col_skill_flag) {
                  text += "【コロシアムスキル】\n";

                  // コロシアムスキル名配列
                  const col_skill_names = returnSkillNames(col_gvg_skills);

                  // コロシアムスキル配列
                  var col_skills = getSkillsTag(col_gvg_skills);

                  /*col_skills.forEach(function(skill, index) {
										text += skill + '\n';
									});*/

                  // コロシアムスキル名でグループ化
                  col_skill_names.forEach(function(skill_name, index) {
                    let skill_text = "";
                    col_skills.forEach(function(skill) {
                      if (skill.indexOf(skill_name) !== -1) {
                        skill_text += skill + " / ";
                      }
                    });
                    text += skill_text.slice(0, -3) + "\n";
                  });
                  text += "\n";
                }

                if (col_aid_skill_flag) {
                  text += "【コロシアム補助スキル】\n";

                  // コロシアム補助スキル名配列
                  const col_aid_skill_names = returnSkillNames(
                    col_gvgaid_skills
                  );

                  // コロシアム補助スキル配列
                  var col_aid_skills = getSkillsTag(col_gvgaid_skills);

                  /*col_aid_skills.forEach(function(skill, index) {
										text += skill + '\n';
									});*/

                  // コロシアム補助スキル名でグループ化
                  col_aid_skill_names.forEach(function(skill_name, index) {
                    let skill_text = "";
                    col_aid_skills.forEach(function(skill) {
                      if (skill.indexOf(skill_name) !== -1) {
                        skill_text += skill + " / ";
                      }
                    });
                    text += skill_text.slice(0, -3) + "\n";
                  });
                }

                // テキスト連結
                message.channel.send(text);
              } else {
                message.channel.send(
                  "エラーが発生しました。しばらく時間をおいてから再度お願いします。"
                );
              }
            });
          })
          .catch(error => {
            console.log("外err : " + error.response);
            //message.reply(error);
          });
      });
    }
  }
  /*if (message.isMemberMentioned(client.user)) {
    message.reply("呼びましたか？");
    return;
  }*/
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

// スキルのタグを返す
function getSkillsTag(skills) {
  // 再代入用オブジェクト
  let obj = {};
  for (let i = 0; i < skills.length; i++) {
    let key = skills[i];
    // ソート用に一旦置換する
    key = key.replace("壱", "_1");
    key = key.replace("弐", "_2");
    key = key.replace("参", "_3");
    if (obj[key] === undefined) obj[key] = 0;
    obj[key]++;
  }
  obj = objectSort(obj);

  const skill_disp = [];
  for (let i = 0; i < Object.keys(obj).length; i++) {
    const skill = Object.keys(obj)[i];
    if (skill === "") continue;
    // ソート用に置換したものを戻す
    let skill_after = skill.replace("_1", "壱");
    skill_after = skill_after.replace("_2", "弐");
    skill_after = skill_after.replace("_3", "参");
    skill_disp[i] = skill_after + "：" + obj[skill];
  }
  return skill_disp;
}

// オブジェクトをソート
function objectSort(object) {
  let sorted = {};
  let array = [];
  for (let key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      array.push(key);
    }
  }
  array.sort();
  for (let i = 0; i < array.length; i++) {
    sorted[array[i]] = object[array[i]];
  }
  return sorted;
}

// スキル名配列を返す
function returnSkillNames(array) {
  // 例：補助支援(弐)を補助支援に
  const array_before = array.map(function(skill) {
    skill = skill.replace(/(\((.)\)$|\/生|\/死|\/序曲|\/終曲)/g, "");
    return skill;
  });

  // 重複を削除したリスト
  let array_after = array_before.filter(function(x, i, self) {
    return self.indexOf(x) === i;
  });

  array_after.sort();
  console.log(array_after);
  return array_after;
}

client.login(process.env.DISCORD_BOT_TOKEN);