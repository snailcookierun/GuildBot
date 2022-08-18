/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 JavaScript ES5로 컴파일 할 수 있습니다.
*/

import { stringify } from "querystring";
import { NumberLiteralType } from "typescript";

/* Global functions */
const isNumber = (n) => !isNaN(Number(n))
const isUnsigned = (n) => isNumber(n) && Number(n) >= 0;
const isNatural = (n) => isNumber(n) && Number(n) > 0;
const isDuplicateExist = arr => new Set(arr).size !== arr.length;

/* Global constants and data structures */
/* enum BOSS_TYPE */
/* Boss가 추가될 경우 BOSS_TYPE과 bossList에 추가해야 함. 보스 체력도 입력해주시면 감사. */
enum BOSS_TYPE {
  DRAGON = "용",
  ANGEL = "천사",
  LICORICE = "감초"
}

const bossTypeMap = (fn:Function) => (Object.keys(BOSS_TYPE) as (keyof typeof BOSS_TYPE)[]).map(
  (key, index) => {return fn(BOSS_TYPE[key]);}
)

const MAX_COUNTS = 8; //max count for each boss
const TICKETS_PER_DAY = 3; //charged tickets per day
const MAX_TICKETS = 9; //max tickets for each user
const MAX_TOTAL_COUNTS = 540; // max count for one season
const MAX_BOSS_COUNTS = 240; // max boss count for one season

/**
 * class Log - boss:(BOSS_TYPE), level:(number), damage:(number)
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
 * class User - name:(string), tickets:(number), counts:({BOSS_TYPE:number}) log:(array<Log>)
 * (string) name: user's name
 * (number) tickets: current remained tickets
 * ({BOSS_TYPE:number}) counts: counts battles with each boss
 * (array<Log>) log: damage log for each boss/level/damage
 * 
*/
class User {
  name: string;
  tickets: number;
  counts: {[key in BOSS_TYPE]: number};
  log: Array<Log>;

  constructor(name: string, tickets: number) {
    this.name = name;
    this.tickets = tickets;
    this.counts = Object.assign({}, ...bossTypeMap((x) => ({[x]: 0})));    
    this.log = [];
  }

  printTickets(): string {
    return this.tickets.toString();
  }

  printCounts(): string {
    var arr = bossTypeMap((x) => x + " " + (this.counts[x]));
    return arr.join(", ");
  }

  printTicketsAndCounts(): string {
    var arr = bossTypeMap((x) => x + " " + (this.counts[x]));
    return "잔여 티켓 수: " + this.tickets + "\n참여 횟수: " + arr.join(", ");
  }

  printInfo(): string {
    return this.name + "\n" + this.printTicketsAndCounts();
  }

  resetCountsAndLogs() {
    var arr = bossTypeMap(x => this.counts[x]);
    arr.forEach(x => x = 0);
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
    var arr = this.userList.map((x) => (x.name + ": " + x.printTickets()));
    return "유저 별 잔여 티켓 수\n" + arr.join("\n");
  }

  /* printCounts: print counts for each boss of users */
  printCounts(): string {
    var arr = this.userList.map((x) => (x.name + ": " + x.printCounts()));
    return "유저 별 토벌 참여 횟수\n" + arr.join("\n");
  }

  printUserList(): string {
    return "유저 리스트\n" + this.userList.map(x => x.name).join(", ");
  }

  /* isNameValid: check name is valid */
  isNewNameValid(name: string): boolean {
    if (isNumber(name)) {
      return false;
    }
    // duplication check
    var username = this.userList.map((x) => (x.name));
    if (username.includes(name)) {
      return false;
    }
    // check with boss keywords
    if (Object.keys(rBossList).includes(name)) {
      return false;
    }
    return true;
  }

  isNameExist(name: string): boolean {
    var arr = this.userList.map(x => x.name);
    return arr.includes(name);
  }

  find(name: string): User {
    for(var u of this.userList) {
      if(u.name == name) return u;
    }
    return this.userList[0];
  }

  /* push: add user */
  push(user: User) {
    this.userList.push(user);
  }

  /* remove: remove user with name */
  remove(name: string) {
    var u = this.find(name); 
    var index = this.userList.indexOf(u);
    this.userList.splice(index,1);
  }
}
const Users = new _Users;

/**
 * class Boss - type(BOSS_TYPE), name:(Array<string>), hps:(array<number>), curLevel:(number), curHp:(number), curUsers:(array<string>)}
 * level indices are same with hps indices.
 */
class Boss {
  type: BOSS_TYPE;
  name: Array<string>;
  hps: Array<number>;
  curLevel: number;
  curDamage: number;
  curUsers: Array<User>;
  counts: number;
  maxDamage: number;
  minDamage: number;

  // constructor - type:BOSS_TYPE, name:boss's nickname
  constructor(type: BOSS_TYPE, name: Array<string>) {
    this.type = type;
    this.name = name;
    this.hps = [0];
    this.curLevel = 0;
    this.curDamage = 0;
    this.curUsers = [];
    this.counts = 0;
    this.maxDamage = 0;
    this.minDamage = 0;
  }

  isLevelExist(n:number) :boolean {
    return (n > 0) && this.hps.hasOwnProperty(n);
  }

  printHps(): string {
    var text = this.type + " 단계 별 체력\n";
    var i = 1;
    var last = this.hps.length - 1;
    for (i = 1; i < last; i++) {
      text += (i) + "단계: " + this.hps[i] + "\n";
    }
    text += (i) + "단계: " + this.hps[i];
    return text;
  }

  getRemained(): number {
    return this.hps[this.curLevel] - this.curDamage;
  }

  setLevel(level: number) {
    this.curLevel = (level);
    this.curDamage = 0;
    this.curUsers = [];
  }
}

const bossList: { [key in BOSS_TYPE]: Boss } = {
  [BOSS_TYPE.DRAGON]: new Boss(BOSS_TYPE.DRAGON, ["용", "레벨", "드래곤", "ㅇ", "ㄼ", "ㄹㅂ"]),
  [BOSS_TYPE.ANGEL]: new Boss(BOSS_TYPE.ANGEL, ["천사", "천", "대천사", "ㅊㅅ", "ㅊ"]),
  [BOSS_TYPE.LICORICE]: new Boss(BOSS_TYPE.LICORICE, ["감초", "감", "ㄱㅊ", "ㄱ"])
};
// Why are the bosses hps same...?
bossList[BOSS_TYPE.DRAGON].hps = bossList[BOSS_TYPE.DRAGON].hps.concat(
  [   840,  1369,  2125,  3139,  4417,  5919,  7555,  9183, 10230, 10853, 
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765, 
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580, 
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412, 
    31332, 32279, 33255, 34260
  ]
);
bossList[BOSS_TYPE.ANGEL].hps = bossList[BOSS_TYPE.ANGEL].hps.concat(
  [   840,  1369,  2125,  3139,  4417,  5919,  7555,  9183, 10230, 10853, 
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765, 
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580, 
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412, 
    31332, 32279, 33255, 34260
  ]
);bossList[BOSS_TYPE.LICORICE].hps = bossList[BOSS_TYPE.LICORICE].hps.concat(
  [   840,  1369,  2125,  3139,  4417,  5919,  7555,  9183, 10230, 10853, 
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765, 
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580, 
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412, 
    31332, 32279, 33255, 34260
  ]
);
const rBossList: { [key: string]: BOSS_TYPE } = Object.keys(bossList).reduce((acc, propName) =>
  bossList[propName].name.reduce((a, name) => { a[name] = propName; return a; }, acc), {});


class _Bosses {
  bossList: { [key in BOSS_TYPE]: Boss };
  rBossList: { [key: string]: BOSS_TYPE };
  totalCounts: number;

  constructor(bossList: { [key in BOSS_TYPE]: Boss }, rBossList: { [key: string]: BOSS_TYPE }) {
    this.bossList = bossList;
    this.rBossList = rBossList;
    this.totalCounts = 0;
  }

  isNameExist(str: string): boolean {
    return rBossList.hasOwnProperty(str);
  }

  find(str: string): Boss {
    return this.bossList[this.rBossList[str]];
  }

  printNames(): string {
    return Object.keys(rBossList).join(" ");
  }

}
const Bosses = new _Bosses(bossList, rBossList);

class _Commands {

  printCommands(commands: Array<string>): string {
    var text = "현재 지원되는 명령어입니다.\n- /체력추가\n- /체력수정\n- /보스체력\n- /보스셋팅\n- /딜량(딜, ㄷㄹ, ㄷ)\n- /딜오타(ㄷㅇㅌ)\n- /잔여(ㅈㅇ)\n- /컷(ㅋ)";
    return text;
  }

  addUser(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) { // /유저추가 이름
      if (!Users.isNewNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      var user = new User(commands[1], 0);
      Users.push(user);
      return user.name + " 님이 추가되었습니다.\n" + user.printTicketsAndCounts();
    } else if (commands.length == 3 && isUnsigned(commands[2]) && Number(commands[2]) <= 9) { // /유저추가 이름 티켓수
      if (!Users.isNewNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      var user = new User(commands[1], Number(commands[2]));
      Users.push(user);
      return user.name + " 님이 추가되었습니다.\n" + user.printTicketsAndCounts();
    } else if (commands.length >= 3) { // /유저추가 이름1 이름2
      commands.shift();
      if (commands.every(u => Users.isNewNameValid(u))) {
        if (isDuplicateExist(commands)) {
          return "중복 닉네임이 있습니다.";
        }
        commands.forEach(u => Users.push(new User(u, 0)));
        return Users.printUserList();
      } else {
        return "유효하지 않는 닉네임입니다.";
      }
    } else {
      return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수(0~9)\n- /유저추가 이름1 이름2";
    }
  }

  changeUser(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && isUnsigned(commands[2])){  // /유저수정 이름 티켓수
        if(!Users.isNameExist(commands[1])) {
          return commands[1] + " 님은 없는 닉네임입니다.";
        }
        var u = Users.find(commands[1]);    
        var tickets = Number(commands[2]);
        if (tickets > MAX_TICKETS) {
          return "티켓 수가 최대치(" + MAX_TICKETS + ")보다 큽니다.";
        }
        u.tickets = tickets;
        return u.name + " 님의 잔여 티켓 수가 " + u.tickets + "로 수정되었습니다.";
    } else if (commands.length == 4 && !isNumber(commands[1]) && !isNumber(commands[2]) && isUnsigned(commands[3])){  // /유저수정 이름 보스명 참여횟수
        if(!Users.isNameExist(commands[1])) {
          return commands[1] + " 님은 없는 닉네임입니다.";
        }
        var u = Users.find(commands[1]);
        if(!Bosses.isNameExist(commands[2])) {
          return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
        var counts = Number(commands[3]);
        if (counts > MAX_COUNTS) {
          return "참여 횟수가 최대치(" + MAX_COUNTS + ")보다 큽니다.";
        }
        u.counts[boss.type] = counts;
        return u.name + " 님의 " + boss.type + " 참여 횟수가 " + u.counts[boss.type] + "로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /유저수정 이름 티켓수(0~9)\n- /유저수정 이름 보스명 참여횟수(0~8)"
    }
  }

  changeUserName(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) { // /이름변경 이름 새이름
      if(!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]); 
      var prevName = u.name; 
      u.name = commands[2];
      return prevName + " 님의 이름이 " + u.name + " 으로 변경되었습니다."
    } else {
      return "명령어 오입력\n- /이름변경 이름 새이름";
    }
  }

  removeUser(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) { // /유저추가 이름
      if(!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      Users.remove(commands[1]);
      return Users.printUserList();
    } else if (commands.length >= 3) { // /유저추가 이름1 이름2
      commands.shift();
      if (commands.every(name => Users.isNameExist(name))) {
        var nameSet = new Set(commands);
        var names = Array.from(nameSet);
        names.forEach(n => Users.remove(n));
        return Users.printUserList();
      } else {
        return "없는 닉네임이 있습니다.";
      }     
    } else {
      return "명령어 오입력\n- /유저삭제 이름\n- /유저삭제 이름1 이름2";
    }
  }

  printUser(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) { // /유저 이름
      if(!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      return u.printInfo();
    } else if (commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {  // /유저 이름 [티켓, 횟수, 보스명]
      if(!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      if(commands[2] == "티켓") {
        return u.name + " 님의 잔여 티켓 수: " + u.printTickets();
      } else if(commands[2] == "횟수") {
        return u.name + " 님의 보스 별 참여 횟수\n" + u.printCounts();
      } else if(Bosses.isNameExist(commands[2])) {
        var boss = Bosses.find(commands[2]);
        return u.name + " 님의 " + boss.type + " 참여 횟수: " + u.counts[boss.type];
      } else {
        return "명령어 오입력\n- /유저(확인, ㅎㅇ) 이름\n- /유저(확인, ㅎㅇ) 이름 [티켓, 횟수, 보스명]";
      }
    } else {
      return "명령어 오입력\n- /유저(확인, ㅎㅇ) 이름\n- /유저(확인, ㅎㅇ) 이름 [티켓, 횟수, 보스명]";
    }
  }

  addTickets(commands: Array<string>): string {
    if(commands.length == 1) {
      var addedTickets = TICKETS_PER_DAY;
      var maxedTicketUsers = Users.userList.filter(x => (x.tickets + addedTickets) > MAX_TICKETS);
      Users.userList.forEach(x => x.tickets = (x.tickets + addedTickets) > MAX_TICKETS ? MAX_TICKETS : (x.tickets + addedTickets));  //Limit the number of tickets up to MAX_TICKETS
      var str = "티켓 수가 +" + addedTickets + "만큼 충전되었습니다.";
      if (maxedTicketUsers.length > 0) {
        str += "\n티켓 초과 유저: " + maxedTicketUsers.map(x => x.name).join(", ");
      }
      return str;
    } else {
      return "명령어 오입력\n- /티켓충전"
    }
  }

  resetSeason(commands: Array<string>): string {
    if(commands.length == 1) {
      Bosses.totalCounts = 0;
      Users.userList.forEach(x => x.tickets = TICKETS_PER_DAY);
      Users.userList.forEach(x => x.resetCountsAndLogs());
      Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].setLevel(1));
      return "새로운 시즌을 시작합니다.\n토벌 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS;
    } else {
      return "명령어 오입력\n- /시즌시작"
    }
  }

  printTotalCounts(commands: Array<string>): string {
    if(commands.length == 1) {
      return "토벌 진행 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS;
    } else if(commands.length == 2 && !isNumber(commands[1])) {
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      return boss.type + " 토벌 진행 횟수: " + boss.counts + "/" + MAX_BOSS_COUNTS;
    } else {
      return "명령어 오입력\n- /횟수(ㅎㅅ)\n- /횟수 보스명"
    }
  }

  addDamage(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if(boss.curLevel <= 0) {
        return " 보스셋팅이 되어 있지 않습니다.\n- /보스셋팅 보스명 단계(1~n)";
      }
      var damage = Number(commands[2]);
      boss.curDamage += damage;
      var remained = boss.getRemained();
      return boss.type + " " + boss.curLevel + "단계 잔여: " + remained + "만";
    } else {
      return "명령어 오입력\n- /딜량(딜, ㄷㄹ, ㄷ) 보스명 딜량";
    }
  }

  revertDamage(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if(boss.curLevel <= 0) {
        return " 보스셋팅이 되어 있지 않습니다.\n- /보스셋팅 보스명 단계(1~n)";
      }
      var damage = Number(commands[2]);
      boss.curDamage -= damage;
      var remained = boss.getRemained();
      return boss.type + " " + boss.curLevel + "단계 잔여: " + remained + "만";
    } else {
      return "명령어 오입력\n- /딜오타(ㄷㅇㅌ) 보스명 딜량";
    }
  }

  printRemained(commands: Array<string>): string {
    if(commands.length == 1) {
      var arr = Object.keys(Bosses.bossList).map(function(k,i){
        var boss = Bosses.bossList[k];
        return boss.type + " " + boss.curLevel + "단계 잔여: " + boss.getRemained() + "만";
      });
      return arr.join("\n");
    }else if(commands.length == 2 && !isNumber(commands[1])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if(boss.curLevel <= 0) {
        return " 보스셋팅이 되어 있지 않습니다.\n- /보스셋팅 보스명 단계(1~n)";
      }
      return boss.type + " " + boss.curLevel + "단계 잔여: " + boss.getRemained() + "만";
    } else {
      return "명령어 오입력\n- /잔여(ㅈㅇ)\n- /잔여 보스명"
    }
  }

  moveBossLevel(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      boss.setLevel(boss.curLevel+1);
      var text = boss.isLevelExist(boss.curLevel) ? "잔여: " + boss.getRemained() + "만" : "/체력추가 를 통해 체력을 설정해주세요.";
      return boss.type + " " + boss.curLevel + "단계로 넘어갑니다.\n" + text;
    } else {
      return "명령어 오입력\n- /컷(ㅋ) 보스명";
    }
  }

  setBossLevel(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var level = Number(commands[2]);
      if(!boss.isLevelExist(level)) {
        return boss.type + " " + level + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
      }
      boss.setLevel(level);
      return boss.type + " " + level + "단계로 셋팅되었습니다.\n잔여: " + boss.getRemained() + "만";
    } else {
      return "명령어 오입력\n- /보스셋팅 보스명 단계(1~n)";
    }
  }

  printBossHp(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      return boss.printHps();
    } else if(commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2])) { 
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var level = Number(commands[2]);
      if(!boss.isLevelExist(level)) {
        return boss.type + " " + level + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
      }
      return boss.type + " " + level + "단계 체력: " + boss.hps[level];     
    } else {
      return "명령어 오입력\n- /보스체력 보스명\n- /보스체력 보스명 단계";
    }
  }

  addBossHp(commands: Array<string>): string {
    if(commands.length >= 3 && !isNumber(commands[1])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
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

  replaceBossHp(commands: Array<string>): string {
    if(commands.length == 4 && !isNumber(commands[1]) && isNatural(commands[2]) && isNatural(commands[3])){
      if(!Bosses.isNameExist(commands[1])) {
        return "없는 보스명입니다.\n - 보스명: " + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var level = Number(commands[2]);
      var newHp = Number(commands[3]);
      if(!boss.isLevelExist(level)) {
        return boss.type + " " + level + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
      }
      boss.hps[level] = newHp;
      return boss.type + " " + level + "단계 체력이 " + boss.hps[level] + "만으로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /체력수정 보스명 단계 체력";
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
    case '/유저수정': return Commands.changeUser(commands); break;
    case '/이름변경': return Commands.changeUserName(commands); break;
    case '/유저삭제': return Commands.removeUser(commands); break;
    case '/티켓충전': return Commands.addTickets(commands); break;
    case '/시즌시작': return Commands.resetSeason(commands); break;
    case '/ㅎㅇ':
    case '/확인':
    case '/유저': return Commands.printUser(commands); break;
    case '/ㅎㅅ':
    case '/횟수': return Commands.printTotalCounts(commands); break;
    case '/딜':
    case '/딜량':
    case '/ㄷ':
    case '/ㄷㄹ': return Commands.addDamage(commands); break;
    case '/딜오타':
    case '/ㄷㅇㅌ': return Commands.revertDamage(commands); break;
    case '/잔여':
    case '/ㅈㅇ': return Commands.printRemained(commands); break;
    case '/이달':
    case '/이어달리기':
    case '/이어하기':
    case '/ㅇㄷ':
    case '/ㅋ':
    case '/컷': return Commands.moveBossLevel(commands); break;
    case '/보스세팅':
    case '/보스셋팅': return Commands.setBossLevel(commands); break;
    case '/보스체력': return Commands.printBossHp(commands); break;
    case '/체력추가': return Commands.addBossHp(commands); break;
    case '/체력수정': return Commands.replaceBossHp(commands); break;
    case '/명령어': return Commands.printCommands(commands); break;
  }
}

exports.processCommand = processCommand;