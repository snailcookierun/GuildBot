
class _Backup {
  load(): boolean {
    var base = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME + "/data/";
    var [valid1, userListStr] = Files.read(base + "userList.json");
    var [valid2, bossListStr] = Files.read(base + "bossList.json");
    var [valid3, rBossListStr] = Files.read(base + "rBossList.json");
    var [valid4, totalCountsStr] = Files.read(base + "totalCounts.json");
    if (valid1 && valid2 && valid3 && valid4) {
      var userListBackup = JSON.parse(userListStr);
      Users.userList = userListBackup.map((u: IUser) => new User(u));

      var bossListBackup = JSON.parse(bossListStr);
      var bossListCopy = {};
      Object.keys(bossListBackup).forEach(function (x) {
        var boss = bossListBackup[x];
        boss.curUsers = boss.curUsers.map(name => Users.find(name));
        boss.loggedUsers = boss.loggedUsers.map(name => Users.find(name));
        Object.keys(boss.relayUsers).forEach(n => boss.relayUsers[n] = boss.relayUsers[n].map(name => Users.find(name)));
        bossListCopy[x] = boss;
      });
      Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x] = new Boss(bossListCopy[x]));

      var rBossListBackup = JSON.parse(rBossListStr);
      Bosses.rBossList = rBossListBackup;

      var totalCountsBackup = JSON.parse(totalCountsStr);
      Bosses.totalCounts = totalCountsBackup;

      return true;
    } else {
      return false;
    }
  }
  save(): boolean {
    var base = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME + "/data/";
    var bossListCopy = {};
    Object.keys(Bosses.bossList).forEach(function (x) {
      var bossCopy: any = new Boss(Bosses.bossList[x]);
      bossCopy.curUsers = bossCopy.curUsers.map(u => u.name);
      bossCopy.loggedUsers = bossCopy.loggedUsers.map(u => u.name);
      Object.keys(bossCopy.relayUsers).forEach(n => bossCopy.relayUsers[n] = bossCopy.relayUsers[n].map(u => u.name));
      bossListCopy[x] = bossCopy;
    });
    var userListBackup = JSON.stringify(Users.userList);
    var valid1 = Files.write(base + "userList.json", userListBackup);
    var bossListBackup = JSON.stringify(bossListCopy);
    var valid2 = Files.write(base + "bossList.json", bossListBackup);
    var rBossListBackup = JSON.stringify(Bosses.rBossList);
    var valid3 = Files.write(base + "rBossList.json", rBossListBackup);
    var totalCountsBackup = JSON.stringify(Bosses.totalCounts);
    var valid4 = Files.write(base + "totalCounts.json", totalCountsBackup);
    return valid1 && valid2 && valid3 && valid4;
  }
}
const Backup = new _Backup();