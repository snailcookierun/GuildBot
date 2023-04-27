const fs = require('fs');
const request = require('sync-request');

/* Script Name */
const SCRIPT_NAME = "GuildBot";
const ROOT_DIR = "./";
exports.scriptName = SCRIPT_NAME;

class _Files {
  read(path: string): [boolean, string] {
    try {
      var res = fs.readFileSync(path);
      return [true, res.toString()];
    } catch (e) {
      return [false, ""];
    }
  }
  write(path: string, data: string): boolean {
    try {
      fs.writeFileSync(path, data);
      return true;
    } catch(e) {
      return false;
    }
  }
  append(path: string, data: string): boolean {
    try {
      fs.appendFileSync(path, data);
      return true;
    } catch(e) {
      return false;
    }
  }
  remove(path: string): boolean {
    try {
      fs.unlink(path, (e) => {if(e) throw e;});
      return true;
    } catch(e) {
      return false;
    }
  }
}
const Files = new _Files();

class _Logs {
  d(data: string, showToast: boolean):void {
    console.debug(data);
  }
  e(data: string, showToast: boolean):void {
    console.error(data);
  }
  i(data: string, showToast: boolean):void {
    console.info(data);
  }
  clear():void {
    console.clear();
  }
}
const Logs = new _Logs();

class _Apis {
  sendHttpRequestPost(url:string, body:string):any {
    var res = request('POST', url, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      json: JSON.parse(body)
    })
    return JSON.parse(res.getBody());
  }
  turnOffScript(){
    return;
  }
}
const Apis = new _Apis();