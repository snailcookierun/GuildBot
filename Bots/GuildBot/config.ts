/* Script Name */
const SCRIPT_NAME = "GuildBot";
exports.scriptName = SCRIPT_NAME;

interface BossConfig {
  type: BOSS_TYPE;
  name: Array<string>;
  hps: Array<number>;
  maxDamage: number;
  minDamage: number;
}
class _Config {
  MAX_COUNTS: number;
  TICKETS_PER_DAY: number;
  MAX_TICKETS: number;
  skipMsgs: Array<string>;
  roomName: Array<string>;
  bosses: Array<BossConfig>;

  loadConfig() {
    var path = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME + "/config.json";
    var [valid, str] = Files.read(path);
    if(!valid) {
      Logs.e("Failed to load config.json");
      // @ts-ignore
      Api.off(SCRIPT_NAME);
    }
  }
}
const Config = new _Config();
Config.loadConfig();