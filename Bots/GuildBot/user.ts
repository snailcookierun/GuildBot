/* enum LOG_TYPE - 미입력, 기본, 막타, 이달, 중복 */

enum LOG_TYPE {
  NONE = "미입력",
  NORMAL = "기본",
  LAST = "막타",
  RELAY = "이달",
  SOLO = "솔플",
  DUPLICATE = "중복"
}

/**
 * class DLog - boss:(BOSS_TYPE), level:(number), damage:(number)
 */
class DLog {
  boss: BOSS_TYPE;
  level: number;
  damage: number;
  type: LOG_TYPE;
  user: string;
  date: number;

  constructor(boss: BOSS_TYPE, level: number, damage: number, type: LOG_TYPE, user: string) {
    this.boss = boss;
    this.level = level;
    this.damage = damage;
    this.type = type;
    this.user = user;
    this.date = (new Date()).getTime();
  }
}

/**
 * class User - name:(string), tickets:(number), counts:({BOSS_TYPE:number}) log:(array<DLog>)
 * (string) name: user's name
 * (number) tickets: current remained tickets
 * ({BOSS_TYPE:number}) counts: counts battles with each boss
 * (array<DLog>) log: damage log for each boss/level/damage
 * 
*/
interface IUser {
  name: string;
  tickets: number;
  relics: number;
  prevRelics: number;
  counts: { [key in BOSS_TYPE]: number };
  log: Array<DLog>;
}

class User {
  name: string;
  tickets: number;
  relics: number;
  prevRelics: number;
  counts: { [key in BOSS_TYPE]: number };
  log: Array<DLog>;

  constructor(name: string, tickets: number);
  constructor(obj: IUser); //copy constructor

  constructor(first: string | IUser, tickets?: number) {
    if (typeof (first) == 'string') {
      this.name = first;
      this.tickets = Number(tickets);
      this.relics = 0;
      this.prevRelics = 0;
      this.counts = Object.assign({}, ...bossTypeMap((x) => ({ [x]: 0 })));
      this.log = [];
    } else {
      this.name = first.name;
      this.tickets = first.tickets;
      this.relics = first.relics;
      this.prevRelics = first.prevRelics;
      this.counts = first.counts;
      this.log = first.log;
    }
  }

  printTickets(): string {
    return this.tickets.toString();
  }

  printCounts(): string {
    var arr: string[] = bossTypeMap((x) => x + " " + (this.counts[x]));
    return arr.join(", ");
  }

  printTicketsAndCounts(): string {
    var arr: string[] = bossTypeMap((x) => x + " " + (this.counts[x]));
    return "잔여 티켓 수: " + this.tickets + "\n참여 횟수: " + arr.join(", ");
  }

  printInfo(): string {
    return this.name + "\n" + this.printTicketsAndCounts();
  }

  resetCountsAndLogs() {
    bossTypeMap(x => this.counts[x] = 0);
    this.log = [];
  }

  isPossibleToParticipate(bossType: BOSS_TYPE) {
    return (this.tickets > 0) && (this.counts[bossType] < MAX_COUNTS);
  }

  numFoundLogs(bossType: BOSS_TYPE, curLevel: number, damage: number, logType: LOG_TYPE) {
    var findLogs = this.log.filter(l => l.boss == bossType && l.damage == damage && l.level == curLevel && l.type == logType);
    return findLogs.length;
  }

  findLogsIfUnique(bossType: BOSS_TYPE, curLevel: number, damage: number, logType: LOG_TYPE) {
    var findLogs = this.log.filter(l => l.boss == bossType && l.damage == damage && l.level == curLevel && l.type == logType);
    return findLogs[findLogs.length - 1];
  }

  addParticipate(bossType: BOSS_TYPE, curLevel: number) {
    this.log.push(new DLog(bossType, curLevel, 0, LOG_TYPE.NONE, this.name));
    this.tickets -= 1;
    this.counts[bossType] += 1;
  }

  revertParticipate(bossType: BOSS_TYPE, curLevel: number) {
    if (this.numFoundLogs(bossType, curLevel, 0, LOG_TYPE.NONE) > 0) {
      this.log = removeItemOnceIfExist(this.log, this.findLogsIfUnique(bossType, curLevel, 0, LOG_TYPE.NONE));
    }
    this.tickets += 1;
    this.counts[bossType] -= 1;
  }

  addDamage(bossType: BOSS_TYPE, curLevel: number, newDamage: number, newLogType: LOG_TYPE) {
    if (this.numFoundLogs(bossType, curLevel, 0, LOG_TYPE.NONE) > 0) {
      var foundLog = this.findLogsIfUnique(bossType, curLevel, 0, LOG_TYPE.NONE);
      foundLog.damage = newDamage;
      foundLog.type = newLogType;
    }
  }

  changeDamage(bossType: BOSS_TYPE, curLevel: number, damage: number, logType: LOG_TYPE, newDamage: number) {
    if (this.numFoundLogs(bossType, curLevel, damage, logType) > 0) {
      var foundLog = this.findLogsIfUnique(bossType, curLevel, damage, logType);
      foundLog.damage = newDamage;
    }
  }

  revertDamage(bossType: BOSS_TYPE, curLevel: number, damage: number, logType: LOG_TYPE) {
    if (this.numFoundLogs(bossType, curLevel, damage, logType) > 0) {
      var foundLog = this.findLogsIfUnique(bossType, curLevel, damage, logType);
      foundLog.damage = 0;
      foundLog.type = LOG_TYPE.NONE;
    }
  }
}

class _Users {
  userList: Array<User>;
  nicknameMap: {[key: string]: string};

  constructor() {
    this.userList = [];
    this.nicknameMap = {};
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
    return "유저 리스트\n" + this.userList.map(x => x.name).join(" ");
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
    // check with nickname map
    if (Object.keys(this.nicknameMap).includes(name)) {
      return false;
    }
    return true;
  }

  isNicknameExist(nick: string): boolean {
    return Object.keys(this.nicknameMap).includes(nick);
  }

  isUserExist(name: string): boolean {
    var arr = this.userList.map(x => x.name);
    return arr.includes(name);
  }

  isNameExist(name: string): boolean {
    return this.isNicknameExist(name) || this.isUserExist(name);
  }

  find(nick: string): User {
    var findName = this.nicknameMap[nick];
    if (findName == undefined || findName == null) {
      var name = nick;
    } else {
      var name = findName;
    }
    for (var u of this.userList) {
      if (u.name == name) return u;
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
    this.userList.splice(index, 1);
  }

  addNickname(name: string, nick: string) {
    this.nicknameMap[nick] = name;
  }

  changeNickname(nick: string, newNick: string) {
    if (nick != newNick) {
      this.nicknameMap[newNick] = this.nicknameMap[nick];
      delete this.nicknameMap[nick];
    }
  }

  deleteNickname(nick: string) {
    delete this.nicknameMap[nick];
  }
}
const Users = new _Users;