/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
*/

/* Global functions */
const isNumber = (n) => Number(n) != null;
const isUnsigned = (n) => isNumber(n) && Number(n) >= 0;

/* Global data structures */
var Users = [];

function printUsersTickets() {
  var text = "";
  var i = 0;
  var last = Users.length - 1;
  for (i=0; i<last; i++) {
    text += Users[i].name + ": " + Users[i].tickets + "\n";
  }
  text += Users[i].name + ": " + Users[i].tickets;
  return text;
}

function isUserNameValid(name) {
  if (isNumber(name)) {
    return;
  }
  // duplication check
  const notSame = (n) => n != name;
  var username = [];
  Users.forEach(u => username.push(u.name));
  return username.every(notSame);
}

function findUser(name) {
  for (let i=0; i < Users.length; i++) {
    if(name == Users[i].name) {
      return Users[i];
    }
  }
}

/**
 * addUser: add user
 * user struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
 * (string) name: user's name
 * (int) tickets: current remained tickets
 * (array<damage_struct>) log: damage log for each boss/level/damage
 * damage_struct should be {boss:(string), level:(int), damage:(int)}
*/
function addUser(commands) {
  if(commands.length == 2 && isUserNameValid(commands[1])){ // /유저추가 이름
    user = {name:commands[1], tickets:0, log:[]};
    Users.push(user);
    return printUsersTickets();
  } else if (commands.length == 3 && isUserNameValid(commands[1]) && isUnsigned(commands[2]) && Number(commands[2]) <= 9){
    user = {name:commands[1], tickets:Number(commands[2]), log:[]};
    Users.push(user);
    return printUsersTickets();
  } else if (commands.length >= 3) { 
    commands.shift();
    if(commands.every(isUserNameValid)) {
      commands.forEach(u => Users.push({name:u, tickets:0, log:[]}));
      return printUsersTickets();
    } else {
      return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수(0~9)\n- /유저추가 이름1 이름2";
    }
  } else {
    return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수(0~9)\n- /유저추가 이름1 이름2";
  }
}

/**
 * processCommand: Process command with parsing msg
 * trim multi-whitespace cases and map to specific commands
 */
function processCommand(msg) {
  try {
    commands = msg.trim().split(/\s+/);
    switch (commands[0]) {
      default : return "알 수 없는 명령어입니다. '/명령어'"; break;
      case '/유저추가': return addUser(commands); break;
    }
  } catch(e) {
    Log.debug(e + ", " + e.lineNumber);
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