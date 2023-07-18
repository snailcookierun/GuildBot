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

// Load main module
const main = require("modules/main");

const scriptName = main.scriptName;
main.init();
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if(main.checkRoomName(room) && (msg.startsWith('/') || msg.startsWith(' /')) && !main.checkSkipMsgs(msg)) {
    replier.reply(room, main.processCommand(msg));
  } else if (main.checkPublicRoomName(room) && (msg.startsWith('/') || msg.startsWith(' /')) && !main.checkSkipMsgs(msg)) {
    replier.reply(room, main.processPublicCommand(msg));
  }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hi, I'm GuildBot.");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}

function onStartCompile() {}

// To debug & observe notifications
function onNotificationPosted(sbn, sm) {
  main.checkNotification(sbn);
  
  /*
  var packageName = sbn.getPackageName();
  var extras = sbn.getNotification().extras;
  var title = extras.getString("android.title");
  var text = extras.getString("android.text");
  var subText = extras.getString("android.subText");
  Log.d("packageName: " + packageName + "\ntitle: " + title + "\ntext: " + text + "\nsubText: " + subText);
  */
  
}