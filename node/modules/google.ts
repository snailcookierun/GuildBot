var fs = require('fs').promises;
var path = require('path');
var {google} = require('googleapis');
var {authenticate} = require('@google-cloud/local-auth');

class _Google {
  scopes: Array<string>;
  config: any;
  credentials_path: string;
  token_path: string;
  formid: string;

  constructor() {
    this.scopes = ['https://www.googleapis.com/auth/forms.responses.readonly'];
    this.config = require("./config-plugin.json");

    this.credentials_path = path.join(process.cwd(), this.config.google.credentials_path);
    this.token_path = path.join(process.cwd(), this.config.google.token_path);
    this.formid = this.config.google.formid;
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(this.token_path);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
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

  async readFormResponses(msg) {
    const auth = await this.authorize();
    const forms = google.forms({
      version: 'v1',
      auth: auth,
    });
    const res = await forms.forms.responses.list({
      formId: this.formid,
    });
    console.log(res.data);
    msg.reply(JSON.stringify(res.data.responses));
  }
}

const Google = new _Google;
Google.authorize();

function googleCommand(msg) {
  var commands = msg.content.trim().split(/\s+/);
  switch (commands[1]) {
    default: msg.reply("명령어 오입력\n- /구글 폼읽기"); break;
    case '폼읽기': Google.readFormResponses(msg); break;
  }
}