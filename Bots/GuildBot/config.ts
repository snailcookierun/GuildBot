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

    cosntructor() {
        
    }
}
const Config = new _Config();