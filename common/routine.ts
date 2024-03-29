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

class _Routine {
  lastTsDay: number;
  isAsOn: boolean;
  backupRoutine: RoutineConfig;

  constructor() {
    this.lastTsDay = -1;
    this.isAsOn = false;
  }

  autoSave(): string {
    var str = "";
    if (this.isAsOn) {
      if (Backup.save()) {
        str = "백업 자동저장 완료";
      } else {
        str = "백업 자동저장 실패";
      }
    } else {
      str = "자동저장이 꺼져있음";
    }
    Logs.d(str,false);
    return str;
  }

  addTickets(): string {
    Users.userList.forEach(x => x.tickets = x.tickets + TICKETS_PER_DAY);
    var str = "티켓이 +" + TICKETS_PER_DAY + "만큼 충전되었습니다.";
    var maxedTicketUsers = Users.userList.filter(x => x.tickets > MAX_TICKETS);
    if (maxedTicketUsers.length > 0) {
      str += "\n티켓 초과 유저: " + maxedTicketUsers.map(x => x.name).join(", ");
      maxedTicketUsers.forEach(x => x.tickets = MAX_TICKETS);
    }
    var names = Users.userList.filter(u => u.tickets >= (MAX_TICKETS - TICKETS_PER_DAY + 1)).map(u => u.name + "(" + u.tickets + ")");
    if (names.length >= 1) {
      str += "\n잔여 티켓이 " + (MAX_TICKETS - TICKETS_PER_DAY + 1) + "개 이상 남으신 분들입니다.\n" + names.join(", ");
    }
    return str;
  }

  resetSeason(): string {
    Bosses.totalCounts = 0;
    Bosses.duplicateAllowed = false;
    Users.userList.forEach(x => x.tickets = TICKETS_PER_DAY);
    Users.userList.forEach(x => x.prevRelics = x.relics);
    Users.userList.forEach(x => x.prevRelicScore = x.relicScore);
    Users.userList.forEach(x => x.resetCountsAndLogs());
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].relayUsers = {});
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].setLevel(1));
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].counts = 0);
    return "새로운 시즌을 시작합니다.\n토벌 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS;
  }

  ticketsAndSeason(resetSeason = false): string {
    var date = new Date();
    var str = "";
    var day = date.getDay();
    if (this.lastTsDay == day) {
      if (day == 4) {
        str = "오늘 이미 시즌시작이 되었습니다."
      } else {
        str = "오늘 이미 티켓충전이 되었습니다."
      }
    } else {
      if ((day >= 0 && day <= 2) || (day >= 5 && day <= 6)) { // 0, 1, 2, 5, 6 (Sun - Tue, Fri - Sat)
        if (resetSeason) {
          str = "오늘은 시즌 시작일이 아닙니다."
        } else {
          str = this.addTickets();
        }
      } else if (day == 4) { // 4 (Thu)
        str = this.resetSeason();
      } else { // 3 (Wed)
        str = "오늘은 시즌 정산일입니다.";
      }
      this.lastTsDay = day;
    }
    Logs.d(str,false);
    return str;
  }

  updateConfig() {
    if (Config.routines.length == 0) { return; }
    var [valid, routine] = Config.findRoutine("백업");
    if (valid) { this.backupRoutine = routine; }
  }

  checkNotification(sbn) {
    if (this.isAsOn) {
      if (sbn.getPackageName() == this.backupRoutine.appName) {
        var extras = sbn.getNotification().extras;
        var title = extras.getString("android.title");
        if (title == this.backupRoutine.title) {
          Routine.autoSave();
        }
      }
    }
  }
}
const Routine = new _Routine();
