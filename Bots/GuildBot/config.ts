/* Script Name */
const SCRIPT_NAME = "GuildBot";
exports.scriptName = SCRIPT_NAME;

/* Global constants */
let MAX_COUNTS = 9; //max count for each boss
let TICKETS_PER_DAY = 3; //charged tickets per day
let MAX_TICKETS = 9; //max tickets for each user
let MAX_TOTAL_COUNTS = TICKETS_PER_DAY * 6 * 30; // max count for one season
let MAX_BOSS_COUNTS = MAX_COUNTS * 30; // max boss count for one season

class BossConfig {
  type: BOSS_TYPE;
  hps: Array<number>;
  maxDamage: number;
  minDamage: number;

  constructor(type: BOSS_TYPE, hps: Array<number>, maxDamage: number, minDamage: number){
    this.type = type;
    this.hps = hps;
    this.maxDamage = maxDamage;
    this.minDamage = minDamage;
  }
}

class _Config {
  MAX_COUNTS: number;
  TICKETS_PER_DAY: number;
  MAX_TICKETS: number;
  skipMsgs: Array<string>;
  roomName: Array<string>;
  bosses: Array<BossConfig>;

  constructor() {
    this.MAX_COUNTS = MAX_COUNTS;
    this.TICKETS_PER_DAY = TICKETS_PER_DAY;
    this.MAX_TICKETS = MAX_TICKETS;
    this.skipMsgs = [];
    this.roomName = [];
    this.bosses = [];
  }

  load() : [boolean, string] {
    var path = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME + "/config.json";
    var [valid, str] = Files.read(path);
    if(!valid) { return [false, "missing " + path]; }
    var obj = JSON.parse(str);

    var _MAX_COUNTS = obj["MAX_COUNTS"];
    if(_MAX_COUNTS == undefined || !(typeof _MAX_COUNTS == "number")) { 
      return [false, "MAX_COUNTS"]; }

    var _TICKETS_PER_DAY = obj["TICKETS_PER_DAY"];
    if(_TICKETS_PER_DAY == undefined || !(typeof _TICKETS_PER_DAY == "number")) { 
      return [false, "TICKETS_PER_DAY"]; }

    var _MAX_TICKETS = obj["MAX_TICKETS"];
    if(_MAX_TICKETS == undefined || !(typeof _MAX_TICKETS == "number")) { 
      return [false, "MAX_TICKETS"]; }

    var _skipMsgs = obj["skipMsgs"];
    if(_skipMsgs == undefined || !Array.isArray(_skipMsgs) || !_skipMsgs.every(v => typeof v == "string")) { 
      return [false, "skipMsgs"]; }

    var _roomName = obj["roomName"];
    if(_roomName == undefined || !Array.isArray(_roomName) || !_roomName.every(v => typeof v == "string")) { 
      return [false, "roomName"]; }

    var _bosses = obj["bosses"];
    if(_bosses == undefined || !Array.isArray(_bosses) || !_bosses.every(function(boss){
      var t = boss["type"];
      if(t == undefined || !(typeof t == "string")) { return false; }
      var h = boss["hps"];
      if(h == undefined || !Array.isArray(h) || !h.every(e => (typeof e == "number"))) { return false; }
      var max = boss["maxDamage"];
      if(max == undefined || !(typeof max == "number")) { return false; }
      var min = boss["minDamage"];
      if(min == undefined || !(typeof min == "number")) { return false; }
      return true;
    })) { return [false, "bosses"]; }

    this.MAX_COUNTS = _MAX_COUNTS;
    this.TICKETS_PER_DAY = _TICKETS_PER_DAY;
    this.MAX_TICKETS = _MAX_TICKETS;
    this.skipMsgs = _skipMsgs;
    this.roomName = _roomName;

    this.bosses = _bosses.map(function(boss){
      var t = boss["type"];
      var h = boss["hps"];
      h.splice(0,0,0); // Insert zero
      var max = boss["maxDamage"];
      var min = boss["minDamage"];
      return new BossConfig(t,h,max,min);
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
  }

  find(b:BOSS_TYPE): [boolean, BossConfig] {
    for(const x of this.bosses){
      if(x.type == b) { return [true, x];}
    }
    return [false, undefined];
  }

  init() {
    var [valid, str] = this.load();
    if(!valid) {
      Logs.e("Error on config.json: "+str, true);
      // @ts-ignore
      Api.off(SCRIPT_NAME);
    }
  }

}
const Config = new _Config();