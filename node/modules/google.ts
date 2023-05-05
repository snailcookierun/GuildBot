var fs = require('fs').promises;
var path = require('path');
var {google} = require('googleapis');
var {authenticate} = require('@google-cloud/local-auth');
var crypto: Crypto = require('crypto');

class _Google {
  scopes: Array<string>;
  config: any;
  credentials_path: string;
  token_path: string;
  formid: string;
  questionMap: {[key in string]: string};
  otp: string;

  constructor() {
    this.scopes = [
      'https://www.googleapis.com/auth/forms.responses.readonly',
      'https://www.googleapis.com/auth/forms.body.readonly'];
    this.config = require("./config-plugin.json");

    this.credentials_path = path.join(process.cwd(), this.config.google.credentials_path);
    this.token_path = path.join(process.cwd(), this.config.google.token_path);
    this.formid = this.config.google.formid;
    this.questionMap = {};
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(this.token_path);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      Logs.e(err,false);
      return null;
    }
  }

  async saveCredentials(client) {
    console.log(this.credentials_path);
    const content = await fs.readFile(this.credentials_path);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(this.token_path, payload);
  }

  async authorize() {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: this.scopes,
      keyfilePath: this.credentials_path,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  generateOtp():string {
    const array = new Uint16Array(1);
    crypto.getRandomValues(array);
    this.otp = String(array[0]).slice(-4).padStart(4,'0')
    return this.otp;
  }

  async showForm(msg) {
    const auth = await this.authorize();
    const forms = google.forms({
      version: 'v1',
      auth: auth,
    });
    const res = await forms.forms.get({formId: this.formid});
    res.data.items.forEach(i => this.questionMap[String(i.questionItem.question.questionId)]=String(i.title));
    const otp = this.generateOtp();
    msg.reply("비밀번호는 " + otp + " 입니다.\nhttps://docs.google.com/forms/d/" + this.formid);
  }

  async updateFormResponses(msg) {
    const auth = await this.authorize();
    const forms = google.forms({
      version: 'v1',
      auth: auth,
    });
    const res = await forms.forms.responses.list({ formId: this.formid });
    if(Object.keys(this.questionMap).length == 0) {
      const res2 = await forms.forms.get({formId: this.formid});
      res2.data.items.forEach(i => this.questionMap[String(i.questionItem.question.questionId)]=String(i.title));
    }
    var answerList = [];
    res.data.responses.forEach(r => {
      var answer = {};
      answer["datetime"] = new Date(r["lastSubmittedTime"]);
      Object.keys(this.questionMap).forEach(k => answer[k] = String(r.answers[k].textAnswers.answers[0].value));
      answerList.push(answer);
    });
    if(answerList.length == 0) {
      msg.reply("기록된 응답이 없습니다.");
      return;
    }
    var subjectKey = Object.keys(this.questionMap).filter(k => this.questionMap[k] == "제목")[0];
    var contentKey = Object.keys(this.questionMap).filter(k => this.questionMap[k] == "내용")[0];
    var passwordKey = Object.keys(this.questionMap).filter(k => this.questionMap[k] == "비밀번호")[0];
    var correctAnswerList = answerList.filter(a => a[passwordKey] == this.otp);
    if(correctAnswerList.length == 0) {
      msg.reply("비밀번호가 맞는 응답이 없습니다.");
      return;
    } else {
      var correctAnswer = correctAnswerList.sort((a,b) => (b["datetime"]-a["datetime"]))[0];
      Cafe.updateContents(correctAnswer[subjectKey], correctAnswer[contentKey]);
      msg.reply("비밀번호가 맞는 가장 마지막 응답으로 업데이트 하였습니다.");
    }
  }
}

const Google = new _Google;
Google.authorize();

function googleFormCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /구인글 작성\n- /구인글 업데이트"); break;
    case '작성': Google.showForm(msg); break;
    case '업데이트': Google.updateFormResponses(msg); break;
  }
}