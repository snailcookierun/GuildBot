class _Routine {
  isRunning: boolean;
  backupHandler: any;
  tsHandler: any;
  tsLastDay: number;

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
    this.tsLastDay = day;
  }

  constructor() { 
    this.isRunning = false; 
    this.tsLastDay = -1;
  }

  start() {
    if(!this.isRunning){
      // @ts-ignore
      const Handler = android.os.Handler;
      // @ts-ignore
      const Runnable = java.lang.Runnable;
      // @ts-ignore
      const Looper = android.os.Looper;

      var curDate = new Date();

      this.backupHandler = new Handler(Looper.getMainLooper());
      var backupRunnable = new Runnable({
        run(){
          Routine.backup();
          Logs.d("Routine.backupHandler(Routine.backup()) executed");
          Routine.backupHandler.postDelayed(this, 60*60*1000); // 1 hour period
        }
      });
      var backupDate = new Date(curDate);
      backupDate.setHours(backupDate.getHours() + 1);
      backupDate.setMinutes(30, 0, 0); // run on every 30 min
      Routine.backupHandler.postDelayed(backupRunnable, backupDate.getTime() - curDate.getTime());

      this.tsHandler = new Handler(Looper.getMainLooper());
      var tsRunnable = new Runnable({
        run(){
          var date = new Date();
          var day = date.getDay();
          if (day != Routine.tsLastDay) {
            Routine.ticketsAndSeason();
            Logs.d("Routine.tsHandler(Routine.ticketsAndSeason()) executed");
            Routine.tsHandler.postDelayed(this, 24*60*60*1000); // 1 day period
          } else {
            Logs.d("Routine.tsHandler: 1 minute delayed");
            Routine.tsHandler.postDelayed(this, 60*1000); // retry after 1 minute
          }
        }
      });
      var tsDate = new Date(curDate);
      tsDate.setDate(tsDate.getDate() + 1);
      tsDate.setHours(0, 0, 10, 0); // run on every midnight + 10 s
      Routine.tsHandler.postDelayed(tsRunnable, tsDate.getTime() - curDate.getTime());

      this.isRunning = true;
    }
  }
  stop() {
    if (this.isRunning) {
      this.backupHandler.removeCallbacksAndMessages(null);
      this.tsHandler.removeCallbacksAndMessages(null);
      this.isRunning = false;
    }
  }
}
const Routine = new _Routine();
