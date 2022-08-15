/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 JavaScript ES5로 컴파일 할 수 있습니다.
*/

/* Global functions */
const isNumber = (n) => !isNaN(Number(n))
const isUnsigned = (n) => isNumber(n) && Number(n) >= 0;
const isDuplicateExist = arr => new Set(arr).size !== arr.length;

/* Global constants and data structures */
/* enum BOSS_TYPE */
enum BOSS_TYPE {
  DRAGON = "용",
  ANGEL = "천사",
  LICORICE = "감초"
}

/**
 * type Log - boss:(Boss), level:(int), damage:(int)
 */
type Log = {
  boss: BOSS_TYPE;
  level: number;
  damage: number;
}

/**
 * class User - name:(string), tickets:(int), log:(array<Log>)
 * (string) name: user's name
 * (int) tickets: current remained tickets
 * (array<Log>) log: damage log for each boss/level/damage
*/
class User {
  name: string;
  tickets: number;
  log: Array<Log>;

  constructor(name: string, tickets: number) {
    this.name = name;
    this.tickets = tickets;
    this.log = [];
  }
}

class _Users {
  userList : Array<User>;

  constructor() {
    this.userList = [];
  }

  printTickets() : string {
    var text = "";
    var i = 0;
    var last = this.userList.length - 1;
    for (i = 0; i < last; i++) {
      text += this.userList[i].name + ": " + this.userList[i].tickets + "\n";
  }
    text += this.userList[i].name + ": " + this.userList[i].tickets;
    return text;
  }

  isNameValid(name:string) : boolean {
    if (isNumber(name)) {
      return false;
    }
    // duplication check
    var username: Array<string> = [];
    this.userList.forEach(u => username.push(u.name));
    return !username.includes(name);
  }
  push(user:User) {
    this.userList.push(user);
  }
}
const Users = new _Users;

/**
 * class Boss - type(BOSS_TYPE): {name:(BOSS_NAME), hps:(array<int>), curLevel:(int), curHp:(int), curUsers:(array<string>)}
 * e.g., var dragonName = Bosses[BOSS_TYPE.DRAGON].name;
 */
class Boss {
  name: BOSS_TYPE;
  hps: Array<number>;
  curLevel: number;
  curHp: number;
  curUsers: Array<User>;

  constructor(name: BOSS_TYPE) {
    this.name = name;
    this.hps = [];
    this.curLevel = 1;
    this.curHp = 0;
    this.curUsers = [];
  }
}

const Bosses: { [key in BOSS_TYPE]: Boss } = {
  [BOSS_TYPE.DRAGON]: new Boss(BOSS_TYPE.DRAGON),
  [BOSS_TYPE.ANGEL]: new Boss(BOSS_TYPE.ANGEL),
  [BOSS_TYPE.LICORICE]: new Boss(BOSS_TYPE.LICORICE)
};




/**
 * addUser: add user
 * Users struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
 * (string) name: user's name
 * (int) tickets: current remained tickets
 * (array<damage_struct>) log: damage log for each boss/level/damage
 * damage_struct should be {boss:(string), level:(int), damage:(int)}
*/
function addUser(commands: Array<string>) : string {
  if (commands.length == 2) { // /유저추가 이름
    if (!Users.isNameValid(commands[1])) {
      return "유효하지 않는 닉네임입니다.";
    }
    Users.push(new User(commands[1],0));
    return Users.printTickets();
  } else if (commands.length == 3 && isUnsigned(commands[2]) && Number(commands[2]) <= 9) { // /유저추가 이름 티켓수
    if (!Users.isNameValid(commands[1])) {
      return "유효하지 않는 닉네임입니다.";
    }
    Users.push(new User(commands[1],Number(commands[2])));
    return Users.printTickets();
  } else if (commands.length >= 3) { // /유저추가 이름1 이름2
    commands.shift();
    if (commands.every(u => Users.isNameValid(u))) {
      if (isDuplicateExist(commands)) {
        return "중복 닉네임이 있습니다.";
      }
      commands.forEach(u => Users.push(new User(u,0)));
      return Users.printTickets();
    } else {
      return "유효하지 않는 닉네임입니다.";
    }
  } else {
    return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수(0~9)\n- /유저추가 이름1 이름2";
  }
}

function addDamage(commands:Array<string>) :string {
  return "";
}

function deleteDamage(commands:Array<string>) :string {
  return "";
}

function moveBossLevel(commands:Array<string>) :string {
  return "";
}

function setBossLevel(commands:Array<string>) :string {
  return "";
}

/**
 * processCommand: Process command with parsing msg
 * trim multi-whitespace cases and map to specific commands
 */
function processCommand(msg:string) : string {
  var commands = msg.trim().split(/\s+/);
  switch (commands[0]) {
    default: return "알 수 없는 명령어입니다.\n- /명령어"; break;
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
}

exports.processCommand = processCommand;