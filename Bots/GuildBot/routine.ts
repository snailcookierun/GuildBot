class _Routine {
  isRunning: boolean;
  timer: any;
  backupTask: any;
  ticketSeasonTask: any;

  backup() {
    if (Backup.save()) {
      Logs.d("백업 저장 완료");
    } else {
      Logs.e("백업 저장 실패");
    }
  }

  addTickets() {
    Users.userList.forEach(x => x.tickets = x.tickets + TICKETS_PER_DAY);
    Logs.d("티켓 충전 완료");
  }

  resetSeason() {
    Bosses.totalCounts = 0;
    Users.userList.forEach(x => x.tickets = TICKETS_PER_DAY);
    Users.userList.forEach(x => x.prevRelics = x.relics);
    Users.userList.forEach(x => x.resetCountsAndLogs());
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].relayUsers = {});
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].setLevel(1));
    Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].counts = 0);
    Logs.d("시즌 시작 완료");
  }

  ticketsAndSeason() {
    var date = new Date();
    var day = date.getDay(); // Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6
    if (day == 4) {
      this.resetSeason();
    } else if ((day >= 0 && day <= 2) || (day >= 5 && day <= 6)) {
      this.addTickets();
    }
  }

  constructor() { this.isRunning = false; }

  start() {
    if (!this.isRunning) {
      // @ts-ignore
      const Timer = java.util.Timer;
      // @ts-ignore
      const TimerTask = java.util.TimerTask;

      this.timer = new Timer();
      this.backupTask = new TimerTask({ run() { Routine.backup(); } });
      this.ticketSeasonTask = new TimerTask({ run() { Routine.ticketsAndSeason(); } });

      var tsDate = new Date();
      tsDate.setDate(tsDate.getDate() + 1);
      tsDate.setHours(0, 0, 0, 0); // run on every midnight
      var tsPeriod = 1 * 24 * 60 * 60 * 1000; // period: 1 day
      this.timer.scheduleAtFixedRate(this.ticketSeasonTask, tsDate, tsPeriod);

      var backupDate = new Date();
      backupDate.setHours(backupDate.getHours() + 1);
      backupDate.setMinutes(30, 0, 0); // run on every 30 min
      var backupPeriod = 60 * 60 * 1000; // period: 1 hour
      this.timer.scheduleAtFixedRate(this.backupTask, backupDate, backupPeriod);

      this.isRunning = true;
    }
  }
  stop() {
    if (this.isRunning) {
      this.timer.cancel();
      this.isRunning = false;
    }
  }
}
const Routine = new _Routine();
