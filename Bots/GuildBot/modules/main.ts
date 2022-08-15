/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 ES5로 컴파일 할 수 있습니다.
*/

/* Global functions */
const isNumber = (n) => Number(n) != null;
const isUnsigned = (n) => isNumber(n) && Number(n) >= 0;

/* Global constants and data structures */
/* boss constants */
const DRAGON = "용";
const ANGEL = "천사";
const LICORICE = "감초";

/* enum BOSS_NAME */
const BOSS_NAME = {
  [DRAGON]: ["용", "레벨", "드래곤", "ㅇ", "ㄼ", "ㄹㅂ"],
  [ANGEL]: ["천사", "대천사", "ㅊㅅ", "ㅊ"],
  [LICORICE]: ["감초", "ㄱㅊ", "ㄱ"]
};
Object.freeze(BOSS_NAME);

/**
 * Bosses struct: type(BOSS_TYPE): {name:(BOSS_NAME), hps:(array<int>), curLevel:(int), curHp:(int), curUsers:(array<string>)}
 * e.g., var dragonName = Bosses[BOSS_TYPE.DRAGON].name;
 */
var Bosses = {
  [DRAGON]: {name:BOSS_NAME[DRAGON], hps:[], curLevel:0, curHp:0, curUsers:[]},
  [ANGEL]: {name:BOSS_NAME[ANGEL], hps:[], curLevel:0, curHp:0, curUsers:[]},
  [LICORICE]: {name:BOSS_NAME[LICORICE], hps:[], curLevel:0, curHp:0, curUsers:[]}
};


/**
 * Users struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
 * (string) name: user's name
 * (int) tickets: current remained tickets
 * (array<damage_struct>) log: damage log for each boss/level/damage
 * damage_struct should be {boss:(string), level:(int), damage:(int)}
*/
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
 * Users struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
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

function addDamage(commands) {

}

function deleteDamage(commands) {

}

/**
 * processCommand: Process command with parsing msg
 * trim multi-whitespace cases and map to specific commands
 */
function processCommand(msg) {
  try {
    commands = msg.trim().split(/\s+/);
    switch (commands[0]) {
      default : return "알 수 없는 명령어입니다.\n- /명령어"; break;
      case '/유저추가': return addUser(commands); break;
      case '/딜': 
      case '/딜량':
      case '/ㄷ': 
      case '/ㄷㄹ': return addDamage(commands); break;
      case '/딜오타':
      case '/ㄷㅇㅌ': return deleteDamage(commands); break;
      case '/이달':
      case '/이어달리기': //TODO
      case '/컷': return moveBossLevel(commands); break;
      case '/보스셋팅': return setBossLevel(commands); break;
    }
  } catch(e) {
    Log.e(e + ", " + e.lineNumber);
  }
}