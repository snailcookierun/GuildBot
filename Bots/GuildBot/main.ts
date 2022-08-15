/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 JavaScript ES5로 컴파일 할 수 있습니다.
*/

import { stringify } from "querystring";

/* Global functions */
const isNumber = (n) => !isNaN(Number(n))
const isUnsigned = (n) => isNumber(n) && Number(n) >= 0;
const isDuplicateExist = arr => new Set(arr).size !== arr.length;

/* Global constants and data structures */
/* enum BOSS_TYPE */
/* Boss가 추가될 경우 BOSS_TYPE과 bossList에 추가해야 함 */
enum BOSS_TYPE {
  DRAGON = "용",
  ANGEL = "천사",
  LICORICE = "감초"
}


/**
 * class Log - boss:(BOSS_TYPE), level:(int), damage:(int)
 */
class Log {
  boss: BOSS_TYPE;
  level: number;
  damage: number;

  constructor(boss: BOSS_TYPE, level: number, damage: number) {
    this.boss = boss;
    this.level = level;
    this.damage = damage;
  }
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
  userList: Array<User>;

  constructor() {
    this.userList = [];
  }

  /* printTickets: print remained tickets of users */
  printTickets(): string {
    var text = "유저 당 잔여 티켓 수\n";
    var i = 0;
    var last = this.userList.length - 1;
    for (i = 0; i < last; i++) {
      text += this.userList[i].name + ": " + this.userList[i].tickets + "\n";
    }
    text += this.userList[i].name + ": " + this.userList[i].tickets;
    return text;
  }

  /* isNameValid: check name is valid */
  isNameValid(name: string): boolean {
    if (isNumber(name)) {
      return false;
    }
    // duplication check
    var username: Array<string> = [];
    this.userList.forEach(u => username.push(u.name));
    return !username.includes(name);
  }

  /* push: add user */
  push(user: User) {
    this.userList.push(user);
  }
}
const Users = new _Users;

/**
 * class Boss - type(BOSS_TYPE), name:(Array<string>), hps:(array<int>), curLevel:(int), curHp:(int), curUsers:(array<string>)}
 */
class Boss {
  type: BOSS_TYPE;
  name: Array<string>;
  hps: Array<number>;
  curLevel: number;
  curDamage: number;
  curUsers: Array<User>;

  // constructor - type:BOSS_TYPE, name:boss's nickname
  constructor(type: BOSS_TYPE, name: Array<string>) {
    this.type = type;
    this.name = name;
    this.hps = [0];
    this.curLevel = 0;
    this.curDamage = 0;
    this.curUsers = [];
  }

  isLevelExist(n:number) :boolean {
    return this.hps.hasOwnProperty(n);
  }

  printHps(): string {
    var text = this.type + " 보스의 단계 별 체력\n";
    var i = 1;
    var last = this.hps.length - 1;
    for (i = 1; i < last; i++) {
      text += (i) + "단계: " + this.hps[i] + "\n";
    }
    text += (i) + "단계: " + this.hps[i];
    return text;
  }
}

const bossList: { [key in BOSS_TYPE]: Boss } = {
  [BOSS_TYPE.DRAGON]: new Boss(BOSS_TYPE.DRAGON, ["용", "레벨", "드래곤", "ㅇ", "ㄼ", "ㄹㅂ"]),
  [BOSS_TYPE.ANGEL]: new Boss(BOSS_TYPE.ANGEL, ["천사", "천", "대천사", "ㅊㅅ", "ㅊ"]),
  [BOSS_TYPE.LICORICE]: new Boss(BOSS_TYPE.LICORICE, ["감초", "감", "ㄱㅊ", "ㄱ"])
};
const rBossList: { [key: string]: BOSS_TYPE } = Object.keys(bossList).reduce((acc, propName) =>
  bossList[propName].name.reduce((a, name) => { a[name] = propName; return a; }, acc), {});


class _Bosses {
  bossList: { [key in BOSS_TYPE]: Boss };
  rBossList: { [key: string]: BOSS_TYPE };

  constructor(bossList: { [key in BOSS_TYPE]: Boss }, rBossList: { [key: string]: BOSS_TYPE }) {
    this.bossList = bossList;
    this.rBossList = rBossList;
  }

  isNameExist(str: string): boolean {
    return rBossList.hasOwnProperty(str);
  }

  find(str: string): Boss {
    return this.bossList[this.rBossList[str]];
  }

  

}
const Bosses = new _Bosses(bossList, rBossList);

class _Commands {

  /**
   * addUser: add user
   * Users struct: {name:(string), tickets:(int), log:(array<damage_struct>)}
   * (string) name: user's name
   * (int) tickets: current remained tickets
   * (array<damage_struct>) log: damage log for each boss/level/damage
   * damage_struct should be {boss:(string), level:(int), damage:(int)}
  */
  addUser(commands: Array<string>): string {
    if (commands.length == 2) { // /유저추가 이름
      if (!Users.isNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      Users.push(new User(commands[1], 0));
      return Users.printTickets();
    } else if (commands.length == 3 && isUnsigned(commands[2]) && Number(commands[2]) <= 9) { // /유저추가 이름 티켓수
      if (!Users.isNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      Users.push(new User(commands[1], Number(commands[2])));
      return Users.printTickets();
    } else if (commands.length >= 3) { // /유저추가 이름1 이름2
      commands.shift();
      if (commands.every(u => Users.isNameValid(u))) {
        if (isDuplicateExist(commands)) {
          return "중복 닉네임이 있습니다.";
        }
        commands.forEach(u => Users.push(new User(u, 0)));
        return Users.printTickets();
      } else {
        return "유효하지 않는 닉네임입니다.";
      }
    } else {
      return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수(0~9)\n- /유저추가 이름1 이름2";
    }
  }

  addDamage(commands: Array<string>): string {
    return "현재 지원되지 않는 명령어입니다.";
  }

  revertDamage(commands: Array<string>): string {
    return "현재 지원되지 않는 명령어입니다.";
  }

  moveBossLevel(commands: Array<string>): string {
    return "현재 지원되지 않는 명령어입니다.";
  }

  setBossLevel(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Object.keys(rBossList).join(" ");
      }
      var boss = Bosses.find(commands[1]);
      var level = Number(commands[2]);
      if(!boss.isLevelExist(level)) {
        return boss.type + " " + level + "단계는 현재 입력되지 않은 단계입니다.";
      }
      boss.curLevel = (level); //level index starts with 0
      boss.curDamage = 0;
      boss.curUsers = [];
      return boss.type + " " + level + "단계로 셋팅되었습니다.";
    } else {
      return "명령어 오입력\n- /보스셋팅 보스명 단계(1~n)";
    }
  }

  addBossHp(commands: Array<string>): string {
    if(commands.length >= 3 && !isNumber(commands[1])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Object.keys(rBossList).join(" ");
      }
      var newHps = commands.slice(2);
      if(!newHps.every(isNumber)){
        return "체력이 숫자가 아닙니다.";
      }
      var boss = Bosses.find(commands[1]);
      var newHpsNumber = newHps.map(x => Number(x));
      boss.hps = boss.hps.concat(newHpsNumber);
      return boss.printHps();
    } else {
      return "명령어 오입력\n- /체력추가 보스명 체력1 체력2";
    }
  }
}
const Commands = new _Commands();

/**
 * processCommand: Process command with parsing msg
 * trim multi-whitespace cases and map to specific commands
 */
function processCommand(msg: string): string {
  var commands = msg.trim().split(/\s+/);
  switch (commands[0]) {
    default: return "알 수 없는 명령어입니다.\n- /명령어"; break;
    case '/유저추가': return Commands.addUser(commands); break;
    case '/딜':
    case '/딜량':
    case '/ㄷ':
    case '/ㄷㄹ': return Commands.addDamage(commands); break;
    case '/딜오타':
    case '/ㄷㅇㅌ': return Commands.revertDamage(commands); break;
    case '/이달':
    case '/이어달리기':
    case '/컷': return Commands.moveBossLevel(commands); break;
    case '/보스셋팅': return Commands.setBossLevel(commands); break;
    case '/체력추가': return Commands.addBossHp(commands); break;
  }
}

exports.processCommand = processCommand;