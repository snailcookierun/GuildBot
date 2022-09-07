/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 main.ts는 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 JavaScript ES5로 컴파일 할 수 있습니다.
 * 메신저봇R은 CommonJS / JavaScript ES5로 돌아갑니다.
*/

// Load main module
const main = require("modules/main");

/* 메신저봇R 셋팅 */
const scriptName = "GuildBot";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

var skipMsgs = ['/훈련장','/우르힁의보물상자','/쿠폰자동입력','/쿠폰입력','/스킬쿨타임표','/초반용','/수용소'];

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if(room == "달팽" && !skipMsgs.includes(msg) && (msg.startsWith('/') || msg.startsWith(' /'))) {
    replier.reply(room, main.processCommand(msg));
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