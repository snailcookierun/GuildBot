var express = require('express');
var axios = require('axios');
var fs = require('fs');
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
    this.subject = encodeURI("테스트입니다.");
    this.content = encodeURI("테스트 글입니다.");
  }

  async saveTokenToFile() {
    var payload = JSON.stringify({refresh_token: this.refresh_token});
    await fs.writeFile(this.config.cafe.token_path, payload, (e) => {if(e){Logs.e(e,false)}});
  }

  async loadSavedTokenIfExist():Promise<string> {
    try {
      const content = await fs.readFile(this.config.cafe.token_path);
      const credentials = JSON.parse(content);
      return credentials.refresh_token;
    } catch (err) {
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
      msg.reply("리프레시에 실패하였습니다.");
    })
  }

  writeCafePost(msg, verbose:boolean) {
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
  var commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /카페 리프레시\n- /카페 글작성"); break;
    case '글작성': Cafe.refreshToken(msg, false, (msg) => Cafe.writeCafePost(msg, true)); break;
    case '리프레시': Cafe.refreshToken(msg, true, function (msg) { }); break;
  }
}