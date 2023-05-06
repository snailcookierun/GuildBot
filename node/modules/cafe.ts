var express = require('express');
var axios = require('axios');
var fs = require('fs').promises;
var crypto: Crypto = require('crypto');

class _Cafe {
  config: any;
  app: any;
  client_id: string;
  client_secret: string;
  redirectURI: string;
  access_token: string;
  refresh_token: string;
  clubid: string;
  menuid: string;
  subject: string;
  content: string;

  period: number;
  start: number;
  end: number;

  constructor() {
    this.config = require('./config-plugin.json');
    this.app = express();
    this.client_id = this.config.cafe.client_id;
    this.client_secret = this.config.cafe.client_secret;
    this.redirectURI = this.config.cafe.host + ":" + this.config.cafe.port + "/callback";
    this.access_token = "";
    this.refresh_token = "";

    this.clubid = this.config.cafe.clubid;
    this.menuid = this.config.cafe.menuid;
    this.subject = "";
    this.content = "";
  }

  async saveTokenToFile() {
    var payload = JSON.stringify({refresh_token: this.refresh_token});
    await fs.writeFile(this.config.cafe.token_path, payload);
  }

  async loadSavedTokenIfExist():Promise<string> {
    try {
      const content = await fs.readFile(this.config.cafe.token_path);
      const credentials = JSON.parse(content);
      return credentials.refresh_token;
    } catch (err) {
      Logs.e(err, false);
      return "";
    }
  }

  async refreshToken(msg, verbose:boolean, successCallback:Function) {
    if (this.refresh_token == "") {
      this.refresh_token = await this.loadSavedTokenIfExist();
    }
    var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&'
      + "client_id=" + this.client_id + '&client_secret=' + this.client_secret + '&refresh_token=' + this.refresh_token;
    axios.get(api_url).then(function (response) {
      if (response.data.error != null) {
        if(verbose) { msg.reply("리프레시에 실패하였습니다."); }
      } else {
        Cafe.access_token = response.data.access_token;
        Cafe.refresh_token = response.data.refresh_token;
        Cafe.saveTokenToFile();
        if(verbose) { msg.reply("리프레시에 성공하였습니다."); }
      }
      successCallback(msg);
    }).catch(function (error) {
      Logs.e(error,false);
      if(verbose) { msg.reply("리프레시에 실패하였습니다."); }
    })
  }

  async writeCafePost(msg, verbose:boolean) {
    if(this.subject == "" || this.content == "") {
      try {
        var data = await fs.readFile(this.config.cafe.form_path);
        var dataStr = JSON.parse(data);
        if (dataStr.subject == undefined || dataStr.content == undefined || dataStr.subject == "" || dataStr.content == "") {
          msg.reply("구인글이 비어있습니다.");
          return;
        } else {
          this.subject = dataStr.subject;
          this.content = dataStr.content;
        }
      } catch(e) {
        Logs.e(e,false);
        msg.reply("구인글이 비어있습니다.");
        return;
      }
    }
    var header = "Bearer " + this.access_token;
    var api_url = 'https://openapi.naver.com/v1/cafe/' + this.clubid + '/menu/' + this.menuid + '/articles';
    var form = new FormData();
    form.append('subject', this.subject);
    form.append('content', this.content);
    axios.post(api_url, form, { headers: { 'Authorization': header } }).then(function (response) {
      if(verbose) { msg.reply("포스트에 성공하였습니다.\n" + response.data.message.result.articleUrl); }
    }).catch(function (error) {
      Logs.e(error, false);
      msg.reply("포스트에 실패하였습니다.");
    });
  }

  async updateContents(sub:string, con:string) {
    this.subject = encodeURI(sub).replace(/%0A/g, "%5Cn");
    this.content = encodeURI(con).replace(/%0A/g, "%5Cn");
    var payload = JSON.stringify({subject: this.subject, content: this.content});
    await fs.writeFile(this.config.cafe.form_path, payload);
  }

  async loadTimePeriodIfExist() {
    try {
      const content = await fs.readFile(this.config.cafe.setting_path);
      const data = JSON.parse(content);
      this.start = Number(data.start);
      this.end = Number(data.end);
      this.period = Number(data.period);
      return;
    } catch (err) {
      Logs.e(err,false);
      this.start = 9;
      this.end = 24;
      this.period = 2;
      return;
    }
  }

  async saveTimePeriod() {
    const data = JSON.stringify({start:this.start, end:this.end, period:this.period});
    await fs.writeFile(this.config.cafe.setting_path, data);
  }

  async showTimePeriod(msg) {
    await this.loadTimePeriodIfExist();
    msg.reply("시작: " + this.start + ", 끝: " + this.end + ", 주기: " + this.period);
  }
  
  async setTimePeriod(msg, argStart:number|null, argEnd:number|null, argPeriod:number|null) {
    await this.loadTimePeriodIfExist();
    if (argStart != null && !Number.isNaN(argStart)) {
      this.start = argStart;
    }
    if (argEnd != null && !Number.isNaN(argEnd)) {
      this.end = argEnd;
    }
    if (argPeriod != null && !Number.isNaN(argPeriod)) {
      this.period = argPeriod;
    }
    if(this.start >= this.end) {
      msg.reply("시작(" + this.start + "이 끝(" + this.end + ")보다 크거나 같습니다.");
      await this.showTimePeriod(msg);
      return;
    }
    if(this.period > 24) {
      msg.reply("주기(" + this.period + ")가 24시간보다 큽니다.");
      await this.showTimePeriod(msg);
      return;
    }
    await this.saveTimePeriod();
    await this.showTimePeriod(msg);
  }

  async setTime(msg) {
    const commands = msg.content.trim().split(/\s+/);
    if(commands.length != 5) {
      msg.reply("명령어 오입력\n- /카페 설정 시간 시작 끝(0~24)");
      return;
    }
    if(!isNumber(commands[3])) {
      msg.reply("시작(" + commands[3] + ")이 숫자가 아닙니다.\n- /카페 설정 시간 시작 끝(0~24)");
      return;
    }
    if(!isNumber(commands[4])) {
      msg.reply("끝(" + commands[4] + ")이 숫자가 아닙니다.\n- /카페 설정 시간 시작 끝(0~24)");
      return;
    }
    const argStart = Number(commands[3]);
    const argEnd = Number(commands[4]);

    if(argStart > 24) {
      msg.reply("시작(" + argStart + ")이 24보다 큽니다.");
      return;
    }
    if(argStart < 0) {
      msg.reply("시작(" + argStart + ")이 0시간보다 작습니다.");
      return;
    }
    if(argEnd > 24) {
      msg.reply("끝(" + argEnd + ")이 24보다 큽니다.");
      return;
    }
    if(argEnd < 0) {
      msg.reply("끝(" + argEnd + ")이 0시간보다 작습니다.");
      return;
    }
    if(argStart >= argEnd) {
      msg.reply("시작(" + argStart + ")이 끝(" + argEnd + ")보다 같거나 큽니다.");
      return;
    }
    await this.setTimePeriod(msg, argStart, argEnd, null);
  }

  async setPeriod(msg) {
    const commands = msg.content.trim().split(/\s+/);
    if(commands.length != 4) {
      msg.reply("명령어 오입력\n- /카페 설정 주기 시간(1~23)");
      return;
    }
    if(!isNumber(commands[3])) {
      msg.reply("시간(" + commands[3] + ")이 숫자가 아닙니다.\n- /카페 설정 주기 시간(1~24)");
      return;
    }
    const argPeriod = Number(commands[3]);
    if(argPeriod > 24) {
      msg.reply("시간(" + argPeriod + ")이 24시간보다 큽니다.");
      return;
    }
    if(argPeriod < 1) {
      msg.reply("시간(" + argPeriod + ")이 1시간보다 작습니다.");
      return;
    }
    await this.setTimePeriod(msg, null, null, this.period);
  }

  settings(msg) {
    const commands = msg.content.trim().split(/\s+/);
    switch (commands[2]) {
      default: msg.reply("명령어 오입력\n- /카페 설정 시간\n- /카페 설정 주기\n- /카페 설정 보기"); break;
      case '시간': Cafe.setTime(msg); break;  
      case '주기': Cafe.setPeriod(msg); break;
      case '보기': Cafe.showTimePeriod(msg); break;
    }
  }

  autoWrite(msg) {
    const commands = msg.content.trim().split(/\s+/);
    if(commands[2] == "켜기") {

    } else if (commands[2] == "끄기") {

    } else {
      msg.reply("명령어 오입력\n- /카페 자동작성 [커기/끄기]");
    }
  }
}

const Cafe = new _Cafe;

Cafe.app.get('/naverlogin', function (req, res) {
  var state = crypto.randomUUID();
  var api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + Cafe.client_id + '&redirect_uri=' + Cafe.redirectURI + '&state=' + state;
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.end("<a href='" + api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
});

Cafe.app.get('/callback', function (req, res) {
  var code = req.query.code;
  var state = req.query.state;
  var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
    + Cafe.client_id + '&client_secret=' + Cafe.client_secret + '&redirect_uri=' + Cafe.redirectURI + '&code=' + code + '&state=' + state;
  axios.get(api_url, { headers: { 'X-Naver-Client-Id': Cafe.client_id, 'X-Naver-Client-Secret': Cafe.client_secret } }).then(function (response) {
    Cafe.access_token = response.data.access_token;
    Cafe.refresh_token = response.data.refresh_token;
    Cafe.saveTokenToFile();
    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    res.end("로그인에 성공하였습니다.");
  }).catch(function (error) {
    Logs.e(error, false);
  })
});

Cafe.app.listen(Cafe.config.cafe.port, function () {
  Logs.d(Cafe.config.cafe.host + ':' + Cafe.config.cafe.port + '/naverlogin listening on port 8888!',false);
});

function cafeCommand(msg) {
  const commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /카페 설정\n- /카페 글작성\n- /카페 자동작성"); break;
    case '글작성': Cafe.refreshToken(msg, false, (msg) => Cafe.writeCafePost(msg, true)); break;
    case '설정': Cafe.settings(msg); break;
    case '자동작성': Cafe.autoWrite(msg); break;
  }
}