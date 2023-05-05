var fs_sync = require('fs');
var request = require('sync-request');

function now():string {
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul'});
}

/* Script Name */
const SCRIPT_NAME = "GuildBot";
const ROOT_DIR = "./";
exports.scriptName = SCRIPT_NAME;

class _Files {
  read(path: string): [boolean, string] {
    try {
      var res = fs_sync.readFileSync(path);
      return [true, res.toString()];
    } catch (e) {
      console.error('[' + now() + '] ' + e);
      return [false, ""];
    }
  }
  write(path: string, data: string): boolean {
    try {
      fs_sync.writeFileSync(path, data);
      return true;
    } catch(e) {
      console.error('[' + now() + '] ' + e);
      return false;
    }
  }
  append(path: string, data: string): boolean {
    try {
      fs_sync.appendFileSync(path, data);
      return true;
    } catch(e) {
      console.error('[' + now() + '] ' + e);
      return false;
    }
  }
  remove(path: string): boolean {
    try {
      fs_sync.unlink(path, (e) => {if(e) throw e;});
      return true;
    } catch(e) {
      console.error('[' + now() + '] ' + e);
      return false;
    }
  }
}
const Files = new _Files();

class _Logs {
  d(data: string, showToast: boolean):void {
    console.debug('[' + now() + '] ' + data);
  }
  e(data: string, showToast: boolean):void {
    console.error('[' + now() + '] ' + data);
  }
  i(data: string, showToast: boolean):void {
    console.info('[' + now() + '] ' + data);
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