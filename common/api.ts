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
  sendHttpRequestPost(url:string, body:string):string;
  turnOffScript():void;
}
const Apis = new _Apis();