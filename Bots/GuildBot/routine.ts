class _Routine {
  lastTsDay: number;
  isAsOn: boolean;

  constructor() { 
    this.lastTsDay = -1; 
    this.isAsOn = true;
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
    Logs.d(str);
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
    Users.userList.forEach(x => x.tickets = TICKETS_PER_DAY);
    Users.userList.forEach(x => x.prevRelics = x.relics);
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
    Logs.d(str);
    return str;
  }
}
const Routine = new _Routine();
exports.autoSave = Routine.autoSave;
exports.ticketsAndSeason = Routine.ticketsAndSeason;