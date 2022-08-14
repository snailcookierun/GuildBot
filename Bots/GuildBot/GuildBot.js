/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
*/

/**
 * addUser: add user
 * user struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
 * (string) name: user's name
 * (int) tickets: current remained tickets
 * (array<damage_struct>) log: damage log for each boss/level/damage
 * damage_struct should be {boss:(string), level:(int), damage:(int)}
*/
function addUser(commands) {
  if(commands.length == 2){
    user = {name:commands[1], tickets:0, log:[]}
    return [user.name, user.tickets, user.log];
  } else if (commands.length == 3 && Number(commands[2]) != null && Number(commands[2]) >= 0){
    user = {name:commands[1], tickets:Number(commands[2]), log:[]}
    return [user.name, user.tickets, user.log];
  } else {
    return "명령어 오입력: '/유저추가 이름' 또는 '/유저추가 이름 티켓수'";
  }
}

// Process command with parsing msg
function processCommand(msg) {

  commands = msg.trim().split(/\s+/);
  switch (commands[0]) {
    default : return "알 수 없는 명령어입니다."; break;
    case '/유저추가': return addUser(commands); break;
  }
}




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

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
  if(msg.startsWith('/')) {
    replier.reply(room, processCommand(msg));
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