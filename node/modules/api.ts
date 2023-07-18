/*
Copyright [2023] [snailcookierun]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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