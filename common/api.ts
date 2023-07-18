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

/* Script Name */
const SCRIPT_NAME = "GuildBot";
const ROOT_DIR = "./";
exports.scriptName = SCRIPT_NAME;

declare class _Files {
  read(path: string): [boolean, string];
  write(path: string, data: string): boolean;
  append(path: string, data: string): boolean;
  remove(path: string): boolean;
}
const Files = new _Files();

declare class _Logs {
  d(data: string, showToast: boolean):void;
  e(data: string, showToast: boolean):void;
  i(data: string, showToast: boolean):void;
  clear():void;
}
const Logs = new _Logs();

declare class _Apis {
  sendHttpRequestPost(url:string, body:string):any;
  turnOffScript():void;
}
const Apis = new _Apis();