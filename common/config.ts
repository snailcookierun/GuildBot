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

/* Global constants */
let MAX_COUNTS = 9; //max count for each boss
let TICKETS_PER_DAY = 3; //charged tickets per day
let MAX_TICKETS = 9; //max tickets for each user
let MAX_TOTAL_COUNTS = TICKETS_PER_DAY * 6 * 30; // max count for one season
let MAX_BOSS_COUNTS = MAX_COUNTS * 30; // max boss count for one season
let AVG_LEVEL = 34; // minimum boss level to calculate average
let HP_RATE = 1.030225; // Bosses' HP rate by level
let HP_MAX_LEVEL = 120; // Bosses' HP limit level

class BossConfig {
  type: BOSS_TYPE;
  hps: Array<number>;
  maxDamage: number;
  minDamage: number;

  constructor(type: BOSS_TYPE, hps: Array<number>, maxDamage: number, minDamage: number) {
    this.type = type;
    this.hps = hps;
    this.maxDamage = maxDamage;
    this.minDamage = minDamage;
  }
}

class RoutineConfig {
  type: string;
  appName: string;
  title: string;

  constructor(type: string, appName: string, title: string) {
    this.type = type;
    this.appName = appName;
    this.title = title;
  }
}

class _Config {
  MAX_COUNTS: number;
  TICKETS_PER_DAY: number;
  MAX_TICKETS: number;
  AVG_LEVEL: number;
  HP_RATE: number;
  HP_MAX_LEVEL: number;
  countBosses: Array<string>;
  skipMsgs: Array<string>;
  roomName: Array<string>;
  publicRoomName: Array<string>;
  adminRoomName: Array<string>;
  bosses: Array<BossConfig>;
  relics: any;
  routines: Array<RoutineConfig>;
  cookieCoolTime: { [key in string]: number };

  constructor() {
    this.MAX_COUNTS = MAX_COUNTS;
    this.TICKETS_PER_DAY = TICKETS_PER_DAY;
    this.MAX_TICKETS = MAX_TICKETS;
    this.AVG_LEVEL = AVG_LEVEL;
    this.HP_RATE = HP_RATE;
    this.HP_MAX_LEVEL = HP_MAX_LEVEL;
    this.skipMsgs = [];
    this.roomName = [];
    this.publicRoomName = [];
    this.adminRoomName = [];
    this.bosses = [];
    this.relics = { legend: 2000, epic: 800, rare: 300, common: 100 };
    this.routines = [];
  }

  load(): [boolean, string] {
    var path = ROOT_DIR + "/config.json";
    var [valid, str] = Files.read(path);
    if (!valid) { return [false, "Error on config.json: missing " + path]; }
    var obj = JSON.parse(str);

    var _MAX_COUNTS = obj["MAX_COUNTS"];
    if (_MAX_COUNTS == undefined || !(typeof _MAX_COUNTS == "number")) {
      return [false, "Error on config.json: MAX_COUNTS"];
    }

    var _TICKETS_PER_DAY = obj["TICKETS_PER_DAY"];
    if (_TICKETS_PER_DAY == undefined || !(typeof _TICKETS_PER_DAY == "number")) {
      return [false, "Error on config.json: TICKETS_PER_DAY"];
    }

    var _MAX_TICKETS = obj["MAX_TICKETS"];
    if (_MAX_TICKETS == undefined || !(typeof _MAX_TICKETS == "number")) {
      return [false, "Error on config.json: MAX_TICKETS"];
    }

    var _AVG_LEVEL = obj["AVG_LEVEL"];
    if (_AVG_LEVEL == undefined || !(typeof _AVG_LEVEL == "number")) {
      return [false, "Error on config.json: AVG_LEVEL"];
    }

    var _HP_RATE = obj["HP_RATE"];
    if (_HP_RATE == undefined || !(typeof _HP_RATE == "number")) {
      return [false, "Error on config.json: HP_RATE"];
    }

    var _HP_MAX_LEVEL = obj["HP_MAX_LEVEL"];
    if (_HP_MAX_LEVEL == undefined || !(typeof _HP_MAX_LEVEL == "number")) {
      return [false, "Error on config.json: HP_MAX_LEVEL"];
    }

    var _countBosses = obj["countBosses"];
    if (_countBosses == undefined || !Array.isArray(_countBosses) || !_countBosses.every(v => typeof v == "string")) {
      return [false, "Error on config.json: countBosses"];
    }

    var _skipMsgs = obj["skipMsgs"];
    if (_skipMsgs == undefined || !Array.isArray(_skipMsgs) || !_skipMsgs.every(v => typeof v == "string")) {
      return [false, "Error on config.json: skipMsgs"];
    }

    var _roomName = obj["roomName"];
    if (_roomName == undefined || !Array.isArray(_roomName) || !_roomName.every(v => typeof v == "string")) {
      return [false, "Error on config.json: roomName"];
    }

    var _publicRoomName = obj["publicRoomName"];
    if (_publicRoomName == undefined || !Array.isArray(_publicRoomName)) {
      return [false, "Error on config.json: publicRoomName"];
    }

    var _adminRoomName = obj["adminRoomName"];
    if (_adminRoomName == undefined || !Array.isArray(_adminRoomName)) {
      return [false, "Error on config.json: adminRoomName"];
    }

    var _relics = obj["relics"];
    var l = _relics["legend"];
    if (l == undefined || !(typeof l == "number")) { return [false, "Error on config.json: relics.legend"];}
    var e = _relics["epic"];
    if (e == undefined || !(typeof e == "number")) { return [false, "Error on config.json: relics.epic"];}
    var r = _relics["rare"];
    if (r == undefined || !(typeof r == "number")) { return [false, "Error on config.json: relics.rare"];}
    var c = _relics["common"];
    if (c == undefined || !(typeof c == "number")) { return [false, "Error on config.json: relics.common"];}


    var _bosses = obj["bosses"];
    if (_bosses == undefined || !Array.isArray(_bosses) || !_bosses.every(function (boss) {
      var t = boss["type"];
      if (t == undefined || !(typeof t == "string")) { return false; }
      var h = boss["hps"];
      if (h == undefined || !Array.isArray(h) || !h.every(e => (typeof e == "number"))) { return false; }
      var max = boss["maxDamage"];
      if (max == undefined || !(typeof max == "number")) { return false; }
      var min = boss["minDamage"];
      if (min == undefined || !(typeof min == "number")) { return false; }
      return true;
    })) { return [false, "Error on config.json: bosses"]; }

    var _routines = obj["routines"];
    if (_routines == undefined || !Array.isArray(_routines) || !_routines.every(function (routine) {
      var t = routine["type"];
      if (t == undefined || !(typeof t == "string")) { return false; }
      var an = routine["appName"];
      if (an == undefined || !(typeof an == "string")) { return false; }
      var ti = routine["title"];
      if (ti == undefined || !(typeof ti == "string")) { return false; }
      return true;
    })) { return [false, "Error on config.json: bosses"]; }

    var path2 = ROOT_DIR + "/config-cooltime.json";
    var [valid2, str2] = Files.read(path2);
    if (!valid2) { return [false, "Error on config-cooltime.json: missing " + path2]; }
    var obj2 = JSON.parse(str2);

    if (!Object.keys(obj2).every(x => typeof x == "string")) { return [false, "Error on config-cooltime.json: some cookie name is not a string"] };
    if (!Object.keys(obj2).map(k => obj2[k]).every(x => typeof x == "number")) { return [false, "Error on config-cooltime.json: some cookie cooltime is not a number"] };

    this.cookieCoolTime = obj2;

    this.MAX_COUNTS = _MAX_COUNTS;
    this.TICKETS_PER_DAY = _TICKETS_PER_DAY;
    this.MAX_TICKETS = _MAX_TICKETS;
    this.AVG_LEVEL = _AVG_LEVEL;
    this.HP_RATE = _HP_RATE;
    this.HP_MAX_LEVEL = _HP_MAX_LEVEL;
    this.countBosses = _countBosses;
    this.skipMsgs = _skipMsgs;
    this.roomName = _roomName;
    this.adminRoomName = _adminRoomName;
    this.publicRoomName = _publicRoomName;

    this.bosses = _bosses.map(function (boss) {
      var t = boss["type"];
      var h = boss["hps"];
      h.splice(0, 0, 0); // Insert zero
      var max = boss["maxDamage"];
      var min = boss["minDamage"];
      return new BossConfig(t, h, max, min);
    })

    this.relics.legend = _relics["legend"];
    this.relics.epic = _relics["epic"];
    this.relics.rare = _relics["rare"];
    this.relics.common = _relics["common"];

    this.routines = _routines.map(function (routine) {
      var t = routine["type"];
      var an = routine["appName"];
      var ti = routine["title"];
      return new RoutineConfig(t, an, ti);
    })

    this.update();
    return [true, ""];
  }

  update() {
    MAX_COUNTS = this.MAX_COUNTS;
    TICKETS_PER_DAY = this.TICKETS_PER_DAY;
    MAX_TICKETS = this.MAX_TICKETS;
    MAX_TOTAL_COUNTS = TICKETS_PER_DAY * 6 * 30; // max count for one season
    MAX_BOSS_COUNTS = MAX_COUNTS * 30; // max boss count for one season
    AVG_LEVEL = this.AVG_LEVEL;
    HP_RATE = this.HP_RATE;
    HP_MAX_LEVEL = this.HP_MAX_LEVEL;
  }

  findBoss(b: BOSS_TYPE): [boolean, BossConfig] {
    for (const x of this.bosses) {
      if (x.type == b) { return [true, x]; }
    }
    return [false, undefined];
  }

  findRoutine(r: string): [boolean, RoutineConfig] {
    for (const x of this.routines) {
      if (x.type == r) { return [true, x]; }
    }
    return [false, undefined];
  }

  init() {
    var [valid, str] = this.load();
    if (!valid) {
      Logs.e("Error on config.json: " + str, true);
      Apis.turnOffScript();
    }
  }

}
const Config = new _Config();