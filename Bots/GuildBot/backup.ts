
class _Backup {
  load(): boolean {
    var base = "/storage/emulated/0/msgbot/Bots/" + SCRIPT_NAME + "/data/";
    var [valid1, userListStr] = Files.read(base + "userList.json");
    var [valid2, bossListStr] = Files.read(base + "bossList.json");
    var [valid3, totalCountsStr] = Files.read(base + "totalCounts.json");
    if (valid1 && valid2 && valid3) {
      var userListBackup = JSON.parse(userListStr);
      Users.userList = userListBackup.map((u: IUser) => new User(u));

      var bossListBackup = JSON.parse(bossListStr);
      var bossListCopy = {};
      Object.keys(bossListBackup).forEach(function (x) {
        var boss = bossListBackup[x];
        boss.curUsers = boss.curUsers.filter(name => Users.isNicknameExist(name)).map(name => Users.find(name));
        boss.loggedUsers = boss.loggedUsers.filter(name => Users.isNicknameExist(name)).map(name => Users.find(name));
        Object.keys(boss.relayUsers).forEach(n => boss.relayUsers[n] = boss.relayUsers[n].filter(name => Users.isNicknameExist(name)).map(name => Users.find(name)));
        bossListCopy[x] = boss;
      });
      Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x] = new Boss(bossListCopy[x]));


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
      var relayUsersCopy = {};
      Object.keys(bossCopy.relayUsers).forEach(n => relayUsersCopy[n] = bossCopy.relayUsers[n].map(u => u.name));
      bossCopy.relayUsers = relayUsersCopy;
      bossListCopy[x] = bossCopy;
    });
    var userListBackup = JSON.stringify(Users.userList);
    var valid1 = Files.write(base + "userList.json", userListBackup);
    var bossListBackup = JSON.stringify(bossListCopy);
    var valid2 = Files.write(base + "bossList.json", bossListBackup);
    var totalCountsBackup = JSON.stringify(Bosses.totalCounts);
    var valid3 = Files.write(base + "totalCounts.json", totalCountsBackup);
    return valid1 && valid2 && valid3;
  }
}
const Backup = new _Backup();