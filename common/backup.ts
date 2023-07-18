
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

class _Backup {
  load(): boolean {
    var base = ROOT_DIR + "/data/";
    var [valid1, userListStr] = Files.read(base + "userList.json");
    var [valid2, bossListStr] = Files.read(base + "bossList.json");
    var [valid3, totalCountsStr] = Files.read(base + "totalCounts.json");
    var [valid4, nicknameMapStr] = Files.read(base + "nicknameMap.json");
    var [valid5, cookieCoolTimeStr] = Files.read(base + "cookieCoolTime.json");
    var [valid6, emailInfoStr] = Files.read(base + "emailInfo.json");
    if (valid1 && valid2 && valid3 && valid4 && valid5 && valid6) {
      var userListBackup = JSON.parse(userListStr);
      Users.userList = userListBackup.map((u: IUser) => new User(u));
      Users.nicknameMap = JSON.parse(nicknameMapStr);
      CoolTime.cookieCoolTime = JSON.parse(cookieCoolTimeStr);
      Coupon.emailInfo = JSON.parse(emailInfoStr);

      var bossListBackup = JSON.parse(bossListStr);
      var bossListCopy = {};
      Object.keys(bossListBackup).forEach(function (x) {
        var boss = bossListBackup[x];
        boss.curUsers = boss.curUsers.filter(name => Users.isNameExist(name)).map(name => Users.find(name));
        boss.loggedUsers = boss.loggedUsers.filter(name => Users.isNameExist(name)).map(name => Users.find(name));
        Object.keys(boss.relayUsers).forEach(n => boss.relayUsers[n] = boss.relayUsers[n].filter(name => Users.isNameExist(name)).map(name => Users.find(name)));
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
    var base = ROOT_DIR + "/data/";
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
    var nicknameMapBackup = JSON.stringify(Users.nicknameMap);
    var valid4 = Files.write(base + "nicknameMap.json", nicknameMapBackup);
    var cookieCoolTimeBackup = JSON.stringify(CoolTime.cookieCoolTime);
    var valid5 = Files.write(base + "cookieCoolTime.json",cookieCoolTimeBackup);
    var emailInfoBackup = JSON.stringify(Coupon.emailInfo);
    var valid6 = Files.write(base + "emailInfo.json",emailInfoBackup);
    return valid1 && valid2 && valid3 && valid4 && valid5 && valid6;
  }
}
const Backup = new _Backup();