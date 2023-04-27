/* Script Name */
const SCRIPT_NAME = "GuildBot";
const ROOT_DIR = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME;
exports.scriptName = SCRIPT_NAME;

class _Files {
  read(path: string): [boolean, string] {
    // @ts-ignore
    var res = FileStream.read(path);
    if (res == null) {
      return [false, ""];
    } else {
      return [true, res];
    }
  }
  write(path: string, data: string): boolean {
    // @ts-ignore
    var res = FileStream.write(path, data);
    if (res == null) {
      return false;
    } else {
      return true;
    }
  }
  append(path: string, data: string): boolean {
    // @ts-ignore
    var res = FileStream.append(path, data);
    if (res == null) {
      return false;
    } else {
      return true;
    }
  }
  remove(path: string): boolean {
    // @ts-ignore
    var res = FileStream.remove(path);
    if (res == true) {
      return true;
    } else {
      return false;
    }
  }
}
const Files = new _Files();

class _Logs {
  d(data: string, showToast = false):void {
    // @ts-ignore
    Log.d(data, showToast);
  }
  e(data: string, showToast = false):void {
    // @ts-ignore
    Log.e(data, showToast);
  }
  i(data: string, showToast = false):void {
    // @ts-ignore
    Log.i(data, showToast);
  }
  clear():void {
    // @ts-ignore
    Log.clear();
  }
}
const Logs = new _Logs();

class _Apis {
  sendHttpRequestPost(url:string, body:string) :any {
    //@ts-ignore
    var res = org.jsoup.Jsoup.connect(url)
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .requestBody(body)
    .post().body().text();
    return JSON.parse(res);
  }
  turnOffScript(){
    //@ts-ignore
    Api.off(SCRIPT_NAME);
  }
}
const Apis = new _Apis();