var express = require('express');
var axios = require('axios');
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

  refreshToken(msg, verbose:boolean, successCallback) {
    var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&'
      + "client_id=" + this.client_id + '&client_secret=' + this.client_secret + '&refresh_token=' + this.refresh_token;
    axios.get(api_url).then(function (response) {
      console.log(response.data);
      if (response.data.error != null) {
        if(verbose) { msg.reply("리프레시에 실패하였습니다."); }
      } else {
        Cafe.access_token = response.data.access_token;
        Cafe.refresh_token = response.data.refresh_token;
        if(verbose) { msg.reply("리프레시에 성공하였습니다."); }
      }
      successCallback(msg);
    }).catch(function (error) {
      console.log(error);
      msg.reply("리프레시에 실패하였습니다.");
    })
  }

  writeCafePost(msg, verbose) {
    var header = "Bearer " + this.access_token;
    var api_url = 'https://openapi.naver.com/v1/cafe/' + this.clubid + '/menu/' + this.menuid + '/articles';
    var form = new FormData();
    form.append('subject', this.subject);
    form.append('content', this.content);
    axios.post(api_url, form, { headers: { 'Authorization': header } }).then(function (response) {
      console.log(response.data);
      if(verbose) { msg.reply("포스트에 성공하였습니다.\n" + response.data.message.result.articleUrl); }
    }).catch(function (error) {
      console.log(error);
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
    console.log(response.data);
    Cafe.access_token = response.data.access_token;
    Cafe.refresh_token = response.data.refresh_token;
    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    res.end("로그인 성공");
  }).catch(function (error) {
    console.log(error);
  })
});


Cafe.app.listen(Cafe.config.cafe.port, function () {
  console.log(Cafe.config.cafe.host + ':' + Cafe.config.cafe.port + '/naverlogin listening on port 8888!');
});


function cafeCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /카페 리프레시\n- /카페 글작성"); break;
    case '글작성': Cafe.refreshToken(msg, false, (msg) => Cafe.writeCafePost(msg, true)); break;
    case '리프레시': Cafe.refreshToken(msg, true, function (msg) { }); break;
  }
}