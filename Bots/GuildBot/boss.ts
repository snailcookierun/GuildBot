/* enum BOSS_TYPE */
/* Boss가 수정될 경우 BOSS_TYPE 수정 및 config.json을 고쳐야 함. */
enum BOSS_TYPE {
  DRAGON = "용",
  ANGEL = "천사",
  LICORICE = "감초"
}

/**
 * class Boss - type(BOSS_TYPE), name:(Array<string>), hps:(array<number>), curLevel:(number), curHp:(number), curUsers:(array<string>)}
 * level indices are same with hps indices.
 */
interface IBoss {
  type: BOSS_TYPE;
  name: Array<string>;
  hps: Array<number>;
  curLevel: number;
  curDamage: number;
  curUsers: Array<User>; //users who are currently participating in curLevel
  loggedUsers: Array<User>; //users who already participated in curLevel
  holdingUsers: Array<User>; //users who holds their relays
  relayUsers: { [id: number]: Array<User> }; //users who cutted the previous level and possibly relay in curLevel
  isRelayLogged: boolean; //returns relay user has logged the damage
  counts: number;
  maxDamage: number;
  minDamage: number;
}

class Boss {
  type: BOSS_TYPE;
  name: Array<string>;
  hps: Array<number>;
  curLevel: number;
  curDamage: number;
  curUsers: Array<User>; //users who are currently participating in curLevel
  loggedUsers: Array<User>; //users who already participated in curLevel
  holdingUsers: Array<User>; //users who holds their relays
  relayUsers: { [id: number]: Array<User> }; //users who cutted the previous level and possibly relay in curLevel
  isRelayLogged: boolean; //returns relay user has logged the damage
  counts: number;
  maxDamage: number;
  minDamage: number;

  // constructor - type:BOSS_TYPE, name:boss's nickname
  constructor(type: BOSS_TYPE, name: Array<string>, max: number, min: number);
  constructor(obj: IBoss);

  constructor(first: any, name?: any, max?: any, min?: any) {
    if (bossTypeMap((x: BOSS_TYPE) => x).includes(first)) {
      this.type = first;
      this.name = name;
      this.hps = [0];
      this.curLevel = 0;
      this.curDamage = 0;
      this.curUsers = [];
      this.loggedUsers = [];
      this.holdingUsers = [];
      this.relayUsers = {};
      this.isRelayLogged = false;
      this.counts = 0;
      this.maxDamage = max;
      this.minDamage = min;
    } else {
      this.type = first.type;
      this.name = first.name;
      this.hps = first.hps;
      this.curLevel = first.curLevel;
      this.curDamage = first.curDamage;
      this.curUsers = first.curUsers;
      this.loggedUsers = first.loggedUsers;
      this.holdingUsers = first.holdingUsers;
      this.relayUsers = first.relayUsers;
      this.isRelayLogged = first.isRelayLogged;
      this.counts = first.counts;
      this.maxDamage = first.maxDamage;
      this.minDamage = first.minDamage;
    }
  }


  isLevelExist(n: number): boolean {
    return (n > 0) && this.hps.hasOwnProperty(n);
  }

  printHps(): string;
  printHps(start: number, end: number): string;
  printHps(start?: number, end?: number): string {
    if (start != undefined && end != undefined) {
      return this.hps.slice(start,end+1).map((x, i) => (start+i) + "단계: " + x + "만").join("\n");
    } else {
      return this.hps.slice(1).map((x, i) => (1+i) + "단계: " + x + "만").join("\n");
    }
  }

  getRemained(): number {
    return this.hps[this.curLevel] - this.curDamage;
  }

  printRemainedAndTactics(): string {
    var text = "잔여: " + this.getRemained() + "만";
      // calculate average damages
      if(this.curLevel >= AVG_LEVEL) {
        var avgNumber = Math.ceil(this.getRemained()/this.maxDamage) < 1 ? 1 : Math.ceil(this.getRemained()/this.maxDamage);
        var avgDamage = Math.round(this.getRemained()/avgNumber);
        text += " (" + avgDamage + "만/" + avgNumber + "명)";
      }
    return text;
  }

  setLevel(level: number) {
    this.curLevel = (level);
    this.curDamage = 0;
    this.curUsers = [];
    this.loggedUsers = [];
    this.relayUsers[this.curLevel] = [];
    this.isRelayLogged = false;
  }

  addParticipate(user: User) {
    this.curUsers.push(user);
    this.counts += 1;
  }

  revertParticipate(user: User) {
    this.curUsers = removeItemOnceIfExist(this.curUsers, user);
    this.counts -= 1;
  }

  addDamage(user: User, damage: number) {
    this.curDamage += damage;
    this.loggedUsers.push(user);
    this.curUsers = removeItemOnceIfExist(this.curUsers, user);
  }

  changeDamage(damage: number, newDamage: number) {
    this.curDamage += (newDamage - damage);
  }

  revertDamage(user: User, damage: number, isRelay: boolean) {
    this.curDamage -= damage;
    if (isRelay) {
      this.isRelayLogged = false;
    } else {
      this.curUsers.push(user);
    }
    this.loggedUsers = removeItemOnceIfExist(this.loggedUsers, user);
  }
}

const bossList: { [key in BOSS_TYPE]: Boss } = {
  [BOSS_TYPE.DRAGON]: new Boss(BOSS_TYPE.DRAGON, ["용", "레벨", "드래곤", "ㅇ", "ㄼ", "ㄹㅂ"], 3900, 3300),
  [BOSS_TYPE.ANGEL]: new Boss(BOSS_TYPE.ANGEL, ["천사", "천", "대천사", "ㅊㅅ", "ㅊ"], 5500, 4000),
  [BOSS_TYPE.LICORICE]: new Boss(BOSS_TYPE.LICORICE, ["감초", "감", "ㄱㅊ", "ㄱ"], 5500, 4000)
};
// Why are the bosses hps same...?
bossList[BOSS_TYPE.DRAGON].hps = bossList[BOSS_TYPE.DRAGON].hps.concat(
  [840, 1369, 2125, 3139, 4417, 5919, 7555, 9183, 10230, 10853,
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765,
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580,
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412,
    31332, 32279, 33255, 34260, 35296, 36362, 37462, 38594, 39760, 40962,
    42200, 43475, 44789, 46143, 47538, 48975, 50455, 51980
  ]
);
bossList[BOSS_TYPE.ANGEL].hps = bossList[BOSS_TYPE.ANGEL].hps.concat(
  [840, 1369, 2125, 3139, 4417, 5919, 7555, 9183, 10230, 10853,
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765,
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580,
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412,
    31332, 32279, 33255, 34260, 35296, 36362, 37462, 38594, 39760, 40962,
    42200, 43475, 44789, 46143, 47538, 48975, 50455, 51980
  ]
); bossList[BOSS_TYPE.LICORICE].hps = bossList[BOSS_TYPE.LICORICE].hps.concat(
  [840, 1369, 2125, 3139, 4417, 5919, 7555, 9183, 10230, 10853,
    11514, 12215, 12958, 13482, 14027, 14594, 15183, 15796, 16274, 16765,
    17272, 17795, 18333, 18887, 19457, 20045, 20651, 21275, 21918, 22580,
    23263, 23966, 24690, 25436, 26205, 26997, 27813, 28654, 29520, 30412,
    31332, 32279, 33255, 34260, 35296, 36362, 37462, 38594, 39760, 40962,
    42200, 43475, 44789, 46143, 47538, 48975, 50455, 51980
  ]
);
const rBossList: { [key: string]: BOSS_TYPE } = Object.keys(bossList).reduce((acc, propName) =>
  bossList[propName].name.reduce((a, name) => { a[name] = propName; return a; }, acc), {});


class _Bosses {
  bossList: { [key in BOSS_TYPE]: Boss };
  rBossList: { [key: string]: BOSS_TYPE };
  totalCounts: number;
  duplicateAllowed: boolean;

  constructor(bossList: { [key in BOSS_TYPE]: Boss }, rBossList: { [key: string]: BOSS_TYPE }) {
    this.bossList = bossList;
    this.rBossList = rBossList;
    this.totalCounts = 0;
    this.duplicateAllowed = false;
  }

  updateConfig() {
    Object.keys(this.bossList).forEach(function(x){
      var [valid, config] = Config.findBoss(this.bossList[x].type);
      if (valid) {
        this.bossList[x].hps = config.hps;
        this.bossList[x].maxDamage = config.maxDamage;
        this.bossList[x].minDamage = config.minDamage;
      }
    })

  }

  isNameExist(str: string): boolean {
    return this.rBossList.hasOwnProperty(str);
  }

  find(str: string): Boss {
    return this.bossList[this.rBossList[str]];
  }

  printNames(): string {
    return Object.keys(this.bossList).map(x => "- " + this.bossList[x].type + ": " + this.bossList[x].name.join(" ")).join("\n");
  }

  isPossibleToParticipate(boss: BOSS_TYPE): boolean {
    return (this.totalCounts < MAX_TOTAL_COUNTS) && (this.bossList[boss].counts < MAX_BOSS_COUNTS);
  }

  increaseTotalCounts() {
    this.totalCounts += 1;
  }

  decreaseTotalCounts() {
    this.totalCounts -= 1;
  }
}
const Bosses = new _Bosses(bossList, rBossList);