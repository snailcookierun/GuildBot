var express = require('express');
var axios = require('axios');
var crypto:Crypto = require('crypto');

var config = require('./config-plugin.json');

var app = express();
var client_id = config.cafe.client_id;
var client_secret = config.cafe.client_secret;
var redirectURI = config.cafe.host + ":" + config.cafe.port + "/callback";
var access_token = "";
var refresh_token = "";

var clubid = config.cafe.clubid;
var menuid = config.cafe.menuid;
var subject = encodeURI("테스트입니다.");
var content = encodeURI("테스트 글입니다.");

app.get('/naverlogin', function (req, res) {
  var state = crypto.randomUUID();
  var api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.end("<a href='" + api_url + "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>");
});

app.get('/callback', function (req, res) {
  var code = req.query.code;
  var state = req.query.state;
  var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
    + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
  axios.get(api_url, { headers: { 'X-Naver-Client-Id': client_id, 'X-Naver-Client-Secret': client_secret } }).then(function (response) {
    console.log(response.data);
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    res.end("로그인 성공");
  }).catch(function (error) {
    console.log(error);
  })
});

/*
app.get('/refresh', function (req, res) {
  var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&'
    + "client_id=" + client_id + '&client_secret=' + client_secret + '&refresh_token=' + refresh_token;
  axios.get(api_url).then(function (response) {
    console.log(response.data);
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    res.end('리프레시 성공');
  }).catch(function (error) {
    console.log(error);
  })
});

app.get('/cafe/post', function (req, res) {
  var header = "Bearer " + access_token;
  var api_url = 'https://openapi.naver.com/v1/cafe/' + clubid + '/menu/' + menuid + '/articles';
  var form = new FormData();
  form.append('subject', subject);
  form.append('content', content);
  axios.post(api_url, form, { headers: { 'Authorization': header } }).then(function (response) {
    console.log(response.data);
    res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
    res.end("포스트 성공: " + response.data.message.result.articleUrl);
  }).catch(function (error) {
    console.log(error);
  });
});
*/

app.listen(8888, function () {
  console.log(config.cafe.host + ':' + config.cafe.port + '/naverlogin listening on port 8888!');
});

function refreshToken(msg, successCallback) {
  var api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&'
  + "client_id=" + client_id + '&client_secret=' + client_secret + '&refresh_token=' + refresh_token;
  axios.get(api_url).then(function (response) {
    console.log(response.data);
    if (response.data.error != null) {
      msg.reply("로그인에 실패하였습니다.");
    } else {
      access_token = response.data.access_token;
      refresh_token = response.data.refresh_token;
      msg.reply("로그인에 성공하였습니다.");
    }
    successCallback(msg);
  }).catch(function (error) {
    console.log(error);
    msg.reply("로그인에 실패하였습니다. 관리자에게 문의하여 주세요.");
  })
}

function writeCafePost(msg) {
  var header = "Bearer " + access_token;
  var api_url = 'https://openapi.naver.com/v1/cafe/' + clubid + '/menu/' + menuid + '/articles';
  var form = new FormData();
  form.append('subject', subject);
  form.append('content', content);
  axios.post(api_url, form, { headers: { 'Authorization': header } }).then(function (response) {
    console.log(response.data);
    msg.reply("포스트 성공: " + response.data.message.result.articleUrl);
  }).catch(function (error) {
    console.log(error);
    msg.reply("포스트에 실패하였습니다.");
  });
}


async function cafeCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /카페 로그인\n- /카페 글작성"); break;
    case '글작성': refreshToken(msg, writeCafePost); break;
    case '로그인': refreshToken(msg, function(msg){}); break;
  }
}

