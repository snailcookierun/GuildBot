/**
 * GuildBot: chatbot system to manage guild battle
 * 길드봇: 토벌을 관리해주는 챗봇 시스템입니다. 
 * by @snailcookierun
 * 편의를 위해 TypeScript으로 작성하였으며, tsc을 통해 메신저봇R과 호환되는 JavaScript ES5로 컴파일 할 수 있습니다.
*/

class _Commands {

  printCommands(commands: Array<string>): string {
    var text = "명령어 링크입니다.\n";
    var link = "https://snailcookierun.notion.site/826e99d07410464ab64394ea7ac8cf4b";
    return text + link;
  }

  addUser(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) { // /유저추가 이름
      if (!Users.isNewNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      var user = new User(commands[1], 0);
      Users.push(user);
      return user.name + " 님이 추가되었습니다.\n" + user.printTicketsAndCounts();
    } else if (commands.length == 3 && isUnsigned(commands[2]) && Number(commands[2]) <= 9) { // /유저추가 이름 티켓수
      if (!Users.isNewNameValid(commands[1])) {
        return "유효하지 않는 닉네임입니다.";
      }
      var user = new User(commands[1], Number(commands[2]));
      Users.push(user);
      return user.name + " 님이 추가되었습니다.\n" + user.printTicketsAndCounts();
    } else if (commands.length >= 3) { // /유저추가 이름1 이름2
      commands.shift();
      if (commands.every(u => Users.isNewNameValid(u))) {
        if (isDuplicateExist(commands)) {
          return "중복 닉네임이 있습니다.";
        }
        commands.forEach(u => Users.push(new User(u, 0)));
        return Users.printUserList();
      } else {
        return "유효하지 않는 닉네임입니다.";
      }
    } else {
      return "명령어 오입력\n- /유저추가 이름\n- /유저추가 이름 티켓수\n- /유저추가 이름1 이름2";
    }
  }

  changeUser(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isUnsigned(commands[2])) {  // /유저수정 이름 티켓수
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      var tickets = Number(commands[2]);
      if (tickets > MAX_TICKETS) {
        return "티켓 수가 최대치(" + MAX_TICKETS + ")보다 큽니다.";
      }
      u.tickets = tickets;
      return u.name + " 님의 잔여 티켓 수가 " + u.tickets + "로 수정되었습니다.";
    } else if (commands.length == 4 && !isNumber(commands[1]) && !isNumber(commands[2]) && isUnsigned(commands[3])) {  // /유저수정 이름 보스명 참여횟수
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      if (!Bosses.isNameExist(commands[2])) {
        return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[2]);
      var counts = Number(commands[3]);
      if (counts > MAX_COUNTS) {
        return "참여 횟수가 최대치(" + MAX_COUNTS + ")보다 큽니다.";
      }
      u.counts[boss.type] = counts;
      return u.name + " 님의 " + boss.type + " 참여 횟수가 " + u.counts[boss.type] + "로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /유저수정 이름 티켓수\n- /유저수정 이름 보스명 참여횟수"
    }
  }

  changeUserName(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) { // /이름변경 이름 새이름
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      var prevName = u.name;
      u.name = commands[2];

      //change nicknameMap
      var rNicknameMap = reverseObject(Users.nicknameMap);
      var nicknames = rNicknameMap[prevName];
      if (nicknames != null && nicknames != undefined && nicknames.length > 0) {
        nicknames.forEach(nick => {Users.deleteNickname(nick); Users.addNickname(u.name, nick)});
      }
      return prevName + " 님의 이름이 " + u.name + " (으)로 변경되었습니다."
    } else {
      return "명령어 오입력\n- /이름변경 이름 새이름";
    }
  }

  removeUser(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) { // /유저삭제 이름
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      var name = u.name;
      if (u.log.length > 0) {
        return "시즌 초기화 이후에 사용해주세요.";
      }
      Users.remove(name);

      //remove nicknameMap
      var rNicknameMap = reverseObject(Users.nicknameMap);
      var nicknames = rNicknameMap[name];
      if (nicknames != null && nicknames != undefined && nicknames.length > 0) {
        nicknames.forEach(nick => Users.deleteNickname(nick));
      }
      return Users.printUserList();
    } else {
      return "명령어 오입력\n- /유저삭제 이름";
    }
  }

  printUser(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) { // /유저 이름
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      return u.printInfo();
    } else if (commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {  // /유저 이름 [티켓, 횟수, 보스명]
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var u = Users.find(commands[1]);
      if (commands[2] == "티켓") {
        return u.name + " 님의 잔여 티켓 수: " + u.printTickets();
      } else if (commands[2] == "횟수") {
        return u.name + " 님의 보스 별 참여 횟수\n" + u.printCounts();
      } else if (Bosses.isNameExist(commands[2])) {
        var boss = Bosses.find(commands[2]);
        return u.name + " 님의 " + boss.type + " 참여 횟수: " + u.counts[boss.type];
      } else {
        return "명령어 오입력\n- /유저(확인, ㅎㅇ) 이름\n- /유저(확인, ㅎㅇ) 이름 [티켓, 횟수, 보스명]";
      }
    } else {
      return "명령어 오입력\n- /유저(확인, ㅎㅇ) 이름\n- /유저(확인, ㅎㅇ) 이름 [티켓, 횟수, 보스명]";
    }
  }

  printUserList(commands: Array<string>): string {
    if (commands.length == 1) {
      if (Users.userList.length < 1) {
        return "유저가 없습니다\n- /유저추가 이름"
      }
      return Users.printUserList();
    } else {
      return "명령어 오입력\n- /유저리스트"
    }
  }

  printLogs(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (Bosses.isNameExist(commands[1])) {
        var b = Bosses.find(commands[1]);
        return JSON.stringify(b);

      } else if (Users.isNameExist(commands[1])) {
        var u = Users.find(commands[1]);
        return JSON.stringify(u.log);
      } else {
        return "명령어 오입력\n- /디버그 이름 또는 보스명"
      }
    } else {
      return "명령어 오입력\n- /디버그 이름 또는 보스명";
    }
  }

  checkTickets(commands: Array<string>): string {
    if (commands.length == 1) {
      // Add tickets or reset season
      return Routine.ticketsAndSeason();
    } else if (commands.length == 2 && commands[1] == "강제") {
      return Routine.addTickets();
    } else {
      return "명령어 오입력\n- /티켓충전"
    }
  }

  resetSeason(commands: Array<string>): string {
    if (commands.length == 1) {
      return Routine.ticketsAndSeason(true);
    } else if (commands.length == 2 && commands[1] == "강제") {
      return Routine.resetSeason();
    } else {
      return "명령어 오입력\n- /시즌시작"
    }
  }

  printTotalCounts(commands: Array<string>): string {
    if (commands.length == 1) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      var arr = Object.keys(Bosses.bossList).map(x => x + ": " + Bosses.bossList[x].counts + "/" + MAX_BOSS_COUNTS);
      return "토벌 진행 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS + "\n" + arr.join(", ");
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";;
      }
      return boss.type + " 토벌 진행 횟수: " + boss.counts + "/" + MAX_BOSS_COUNTS;
    } else {
      return "명령어 오입력\n- /횟수(ㅎㅅ)\n- /횟수 보스명"
    }
  }

  changeTotalCounts(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isUnsigned(commands[2])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";;
      }
      var newCounts = Number(commands[2]);
      var prevCountsDiff = newCounts - boss.counts;
      boss.counts = newCounts;
      Bosses.totalCounts = Bosses.totalCounts + prevCountsDiff;

      var arr = Object.keys(Bosses.bossList).map(x => x + ": " + Bosses.bossList[x].counts + "/" + MAX_BOSS_COUNTS);
      return "토벌 진행 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS + "\n" + arr.join(", ");
    } else {
      return "명령어 오입력\n- /횟수수정 보스명 보스횟수"
    }
  }

  addParticipate(commands: Array<string>): string {
    if ((commands.length == 3 || commands.length == 4) && !isNumber(commands[1])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);

      if (!isNumber(commands[2])) { // If the input is string
        if (!Bosses.isNameExist(commands[2])) {
          return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
      } else if (isNatural(commands[2])) { // If the input is number 
        var level = Number(commands[2]);
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].curLevel == level);
        if (possibleBosses.length < 1) {
          return "현재 " + commands[2] + "단계인 보스가 없습니다.\n- /참여(ㅊㅇ) 이름 보스명"
        } else if (possibleBosses.length > 1) {
          return "현재 " + commands[2] + "단계인 보스가 여럿입니다.\n- /참여(ㅊㅇ) 이름 보스명"
        }
        var boss = Bosses.bossList[possibleBosses[0]];
      } else {
        return "명령어 오입력\n- /참여(ㅊㅇ) 이름 보스명\n- /참여 이름 보스명 [이달/중복]";
      }
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";;
      }
      var addStr = "";
      if (!user.isPossibleToParticipate(boss.type)) {
        return user.name + " 님은 티켓이 부족하거나 참여 횟수를 모두 사용하셨습니다.\n" + user.printTicketsAndCounts();
      }
      if (!Bosses.isPossibleToParticipate(boss.type)) {
        var arr = Object.keys(Bosses.bossList).map(x => x + ": " + Bosses.bossList[x].counts + "/" + MAX_BOSS_COUNTS);
        return "보스 별 또는 시즌 총 전투 가능 횟수를 모두 사용하였습니다.\n" + "토벌 진행 횟수: " + Bosses.totalCounts + "/" + MAX_TOTAL_COUNTS + "\n" + arr.join(", ");
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }     
      if (boss.holdingUsers.includes(user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계의 '/홀딩' 명령어를 입력하셨습니다.";
      }
      if (boss.curUsers.includes(user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계에 '/참여' 명령어를 입력하셨습니다.";
      }
      var isDuplicateAllowed = false;
      if (commands.length == 4) {
        if (!isNumber(commands[3])) {
          if (commands[3] == LOG_TYPE.DUPLICATE) {
            addStr = "\n중복 참여입니다.";
            isDuplicateAllowed = true;
          } else if (commands[3] == LOG_TYPE.RELAY || commands[3] == "ㅇㄷ") {
            if(boss.getAvgNumber() > 1) {
              return "보스체력이 많아 이어하기가 불가능합니다.";
            }
            addStr = "\n이어하기를 하지 않을 경우 중복 처리됩니다.";
            isDuplicateAllowed = true;
          } else {
            return "명령어 오입력\n- /참여(ㅊㅇ) 이름 보스명\n- /참여 이름 보스명 [이달/중복]";
          }
        } else if (Number(commands[3]) == boss.curLevel) {
          addStr = "\n이제 단계를 입력하지 않아도 됩니다.";
        } else {
          return "현재 " + boss.type + " 단계(" + boss.curLevel + ")와 입력한 단계(" + commands[3] + ")가 다릅니다."
        }
      }
      if (Bosses.duplicateAllowed) {
        addStr = "\n(중복 참여 허용)";
        isDuplicateAllowed = true;
      }
      if (!isDuplicateAllowed && boss.loggedUsers.includes(user) && !(boss.isRelayLogged && (boss.relayUsers[boss.curLevel])[0] == user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계에 참여한 기록이 있습니다.\n- /참여 이름 보스명 [이달/중복]";
      }
      if (!isDuplicateAllowed && boss.loggedUsers.includes(user) && boss.isRelayLogged && (boss.relayUsers[boss.curLevel])[0] == user) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계에 이어하기로 참여하셨습니다.\n- /참여 이름 보스명 [이달/중복]";
      }
      var bossAvgNumber = boss.getAvgNumber();
      var threshold = 1;
      if(((bossAvgNumber>threshold)&&(bossAvgNumber<=boss.curUsers.length+1))||((bossAvgNumber<=threshold)&&(bossAvgNumber<=boss.curUsers.length))) {
        return "현재 참여 대기인원이 많아 참여가 불가능합니다.";
      }
      user.addParticipate(boss.type, boss.curLevel);
      boss.addParticipate(user);
      Bosses.increaseTotalCounts();
      var res = user.name + " 님이 " + boss.type + " " + boss.curLevel + "단계에 참여합니다.\n";
      res += "[잔여 티켓: " + user.tickets;
      if (Config.countBosses.length > 0) {
        res += "(" + Config.countBosses.map(b => user.counts[b]).join("/") +  ")";
      }
      res += ", 대기 인원: " + boss.curUsers.length + "/" + boss.getAvgNumber() + "]" + addStr;
      return res;
    } else {
      return "명령어 오입력\n- /참여(ㅊㅇ) 이름 보스명\n- /참여 이름 보스명 [이달/중복]";
    }
  }

  revertParticipate(commands: Array<string>): string {
    if ((commands.length == 2 || commands.length == 3) && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);

      // Find boss
      if (commands.length == 2) {
        // Find bosses which the user participated with boss.curUser
        var participatedBosses: Boss[] = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].curUsers.includes(user)).map(x => Bosses.bossList[x]);
        if (participatedBosses.length > 1) {
          return commands[1] + " 님은 현재 여러 보스에 참여 중입니다. (참여: " + participatedBosses.map(x => x.type).join(" ") + ")\n- /오타 이름 보스명";
        } else if (participatedBosses.length < 1) {
          return commands[1] + " 님은 현재 참여 중인 보스가 없습니다.";
        }
        var boss = participatedBosses[0];
      } else if (commands.length == 3 && !isNumber(commands[2])) {
        // If boss name is specified
        if (!Bosses.isNameExist(commands[2])) {
          return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
      } else {
        return "명령어 오입력\n- /오타(ㅇㅌ) 이름";
      }

      // Check whether the boss is valid
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!boss.curUsers.includes(user)) {
        return user.name + " 님은 현재 " + boss.type + " " + boss.curLevel + "단계에 참여 중이지 않습니다.";
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      // Double check with user logs
      if (user.numFoundLogs(boss.type, boss.curLevel, 0, LOG_TYPE.NONE) < 1) {
        return user.name + " 님은 현재 " + boss.type + " " + boss.curLevel + "단계에 대한 참여 기록이 없습니다.";
      } else if (user.numFoundLogs(boss.type, boss.curLevel, 0, LOG_TYPE.NONE) > 1) {
        return user.name + " 님은 현재 " + boss.type + " " + boss.curLevel + "단계에 대한 2개 이상의 참여 기록이 있습니다. 버그이므로 관리자에게 문의하세요.";
      }

      user.revertParticipate(boss.type, boss.curLevel);
      boss.revertParticipate(user);
      Bosses.decreaseTotalCounts();
      return user.name + " 님의 " + boss.type + " " + boss.curLevel + "단계 참여가 삭제되었습니다.";

    } else {
      return "명령어 오입력\n- /오타(ㅇㅌ) 이름";
    }
  }

  addDamage(commands: Array<string>): string {
    if ((commands.length == 3 || commands.length == 4) && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (Bosses.isNameExist(commands[1])) {
        return "보스명이 아닌 닉네임을 입력해주세요.\n- /딜 이름 딜량";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);

      // Find boss
      if (commands.length == 3 && isNatural(commands[2])) {
        // Find bosses which the user participated with boss.curUser
        var participatedBosses: Boss[] = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].curUsers.includes(user)).map(x => Bosses.bossList[x]);
        // Find bosses which the user is in relay mode with boss.relayLogged && boss.relayUser
        var relayBosses: Boss[] = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isRelayLogged
          && Bosses.bossList[x].relayUsers[Bosses.bossList[x].curLevel].includes(user)).map(x => Bosses.bossList[x]);
        // Find bosses which the user is in holding mode
        var holdingBosses: Boss[] = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].holdingUsers.includes(user)).map(x => Bosses.bossList[x]);
        var unfilteredBossesUnion = unionArray(unionArray(participatedBosses, relayBosses),holdingBosses);
        var bossesUnion = unfilteredBossesUnion.filter(b => !b.isPaused);

        if (bossesUnion.length > 1) {
          var appendStr = participatedBosses.length > 0 ? ("참여: " + participatedBosses.map(x => x.type).join(" ")) : "";
          var appendStr = relayBosses.length > 0 ? (appendStr + ", 이달: " + relayBosses.map(x => x.type).join(" ")) : appendStr;
          var appendStr = holdingBosses.length > 0 ? (appendStr + ", 홀딩: " + holdingBosses.map(x => x.type).join(" ")) : appendStr;
          return "보스명을 특정해주세요. (" + appendStr + ")\n- /딜 이름 보스명 딜량";
          /*
          if (relayBosses.length < 1) {
            return commands[1] + " 님은 현재 여러 보스에 참여 중입니다. (참여: " + participatedBosses.map(x => x.type).join(" ") + ")\n- /딜 이름 보스명 딜량";
          } else if (participatedBosses.length < 1) {
            return commands[1] + " 님은 현재 여러 보스에 컷 기록이 있습니다. (컷: " + relayBosses.map(x => x.type).join(" ") + ")\n- /딜 이름 보스명 딜량";
          } else {
            return commands[1] + " 님은 현재 여러 보스에 참여와 컷 기록이 있습니다. (참여: " + participatedBosses.map(x => x.type).join(" ")
              + ", 컷: " + relayBosses.map(x => x.type).join(" ") + ")\n- /딜 이름 보스명 딜량";
          }
          */
        } else if (bossesUnion.length < 1) {
          if (unfilteredBossesUnion.length > 0) {
            return "딜량 입력이 가능한 보스가 현재 토벌 중지 상태입니다. (" + unfilteredBossesUnion.map(x => x.type).join(", ") + ")";
          }
          return commands[1] + " 님은 현재 참여 중인 보스가 없습니다.";
        }
        var boss = bossesUnion[0];
        var damage = Number(commands[2]);
      } else if (commands.length == 4 && !isNumber(commands[2]) && isNatural(commands[3])) {
        // If boss name is specified
        if (!Bosses.isNameExist(commands[2])) {
          return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
        var damage = Number(commands[3]);
      } else {
        return "명령어 오입력\n- /딜량(딜, ㄷㄹ, ㄷ) 이름 딜량\n- /딜 이름 보스명 딜량";
      }

      // Check whether the boss is valid
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!boss.isLevelExist(boss.curLevel)) {
        return boss.type + " " + boss.curLevel + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
      }
      if (!boss.holdingUsers.includes(user) && !boss.curUsers.includes(user) && !(!boss.isRelayLogged && boss.relayUsers[boss.curLevel].includes(user))) {
        return commands[1] + " 님은 " + boss.type + " " + boss.curLevel + "단계에 참여 중이지 않거나 컷 기록이 없습니다.";
      }
      if (boss.getRemained() + 2 <= Number(commands[2])) {
        return "입력한 딜량(" + commands[2] + "만)이 현재 잔여 체력(" + boss.getRemained() + "만)보다 큽니다."
      }

      var str = "";
      var logType = LOG_TYPE.NORMAL;
      if (boss.holdingUsers.includes(user)) {
        logType = LOG_TYPE.HOLD;
        str = "\n홀딩으로 기록되었습니다.";
      } else if (!boss.curUsers.includes(user) && !boss.isRelayLogged && boss.relayUsers[boss.curLevel].includes(user)) {
        // only one relay user can log damage
        // relay log is newly inserted in this function
        logType = LOG_TYPE.RELAY;
        boss.isRelayLogged = true;
        boss.relayUsers[boss.curLevel] = moveItemToFront(boss.relayUsers[boss.curLevel], user);
        user.log.push(new DLog(boss.type, boss.curLevel, 0, LOG_TYPE.NONE, user.name));
      } else if (boss.loggedUsers.includes(user)) {
        logType = LOG_TYPE.DUPLICATE;
        str = "\n중복으로 기록되었습니다.";
      }

      // Double-check with user log
      if (user.numFoundLogs(boss.type, boss.curLevel, 0, LOG_TYPE.NONE) < 1) {
        return user.name + " 님은 현재 " + boss.type + " " + boss.curLevel + "단계에 대한 참여 기록이 없습니다.";
      } else if (user.numFoundLogs(boss.type, boss.curLevel, 0, LOG_TYPE.NONE) > 1) {
        return user.name + " 님은 현재 " + boss.type + " " + boss.curLevel + "단계에 대한 2개 이상의 참여 기록이 있습니다. 버그이므로 관리자에게 문의하세요.";
      }

      user.addDamage(boss.type, boss.curLevel, damage, logType);
      boss.addDamage(user, damage);

      return boss.type + " " + boss.curLevel + "단계 (" + boss.counts + "/" + MAX_BOSS_COUNTS + ")\n" + boss.printRemainedAndTactics() + str;

    } else {
      return "명령어 오입력\n- /딜량(딜, ㄷㄹ, ㄷ) 이름 딜량\n- /딜 이름 보스명 딜량";
    }
  }

  revertDamage(commands: Array<string>): string {
    if ((commands.length == 2 || commands.length == 3) && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      if (commands.length == 3) {
        if (!Bosses.isNameExist(commands[2])) {
          return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
      } else { // commands.length == 2
        var possibleBosses : Boss[] = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].loggedUsers.includes(user)).map(x => Bosses.bossList[x]);
        if (possibleBosses.length > 1) {
          return user.name + " 님은 여러 보스(" + possibleBosses.map(b => b.type).join(" ") + ")에 딜량 기록이 있습니다.";
        } else if (possibleBosses.length < 1) {
          return user.name + " 님은 현재 보스 단계에 딜량 기록이 없습니다.";
        }
        var boss = possibleBosses[0];
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      if (boss.curUsers.includes(user)) {
        return user.name + " 님은 현재 " + boss.type + " " +  boss.curLevel + "단계에 참여 중입니다. /오타 후 딜취소를 해주세요.";
      }
      var logs = user.log.filter(x => (x.boss == boss.type) && (x.level == boss.curLevel)
        && (x.type != LOG_TYPE.NONE) && (x.type != LOG_TYPE.LAST) && (x.type != LOG_TYPE.SOLO) && (x.type != LOG_TYPE.HOLDLAST));
      if (logs.length < 1) {
        return user.name + " 님은 " + boss.type + " " + boss.curLevel + "단계 딜량 기록이 없습니다.";
      }
      var log = logs[logs.length - 1];
      if (log.type == LOG_TYPE.RELAY) { // delete relay log
        boss.revertDamage(user, log.damage, log.type);
        user.log = removeItemOnceIfExist(user.log, log);
      } else { // log.type = LOG_TYPE.HOLD or LOG_TYPE.NORMAL or LOG_TYPE.DUPLICATE
        boss.revertDamage(user, log.damage, log.type);
        user.revertDamage(log.boss, log.level, log.damage, log.type);
      }
      return user.name + " 님의 " + boss.type + " " + boss.curLevel + "단계 딜량 기록이 삭제되었습니다.";
    } else {
      return "명령어 오입력\n- /딜취소 이름\n- /딜취소 이름 보스명";
    }
  }

  changeDamage(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      var log = user.log[user.log.length - 1];
      if (log.type == LOG_TYPE.NONE) {
        return user.name + " 님의 마지막 참여 기록에 딜량이 입력되어 있지 않습니다.";
      }
      var newDamage = Number(commands[2]);
      var boss = Bosses.bossList[log.boss];
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      if (Bosses.bossList[log.boss].curLevel == log.level) {
        boss.changeDamage(log.damage, newDamage);
      }
      user.changeDamage(log.boss, log.level, log.damage, log.type, newDamage);
      return user.name + " 님의 " + log.boss + " " + log.level + "단계 딜량이 " + log.damage + "만으로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /딜오타(딜수정, ㄷㅇㅌ) 이름 딜량(1~n)";
    }
  }

  addHoldingUser(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (!Bosses.isNameExist(commands[2])) {
        return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[2]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";;
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      if (boss.holdingUsers.includes(user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계의 '/홀딩' 명령어를 입력하셨습니다.";
      }
      if (boss.curUsers.includes(user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계에 '/참여' 명령어를 입력하셨습니다.";
      }
      if (boss.loggedUsers.includes(user)) {
        return user.name + " 님은 이미 " + boss.type + " " + boss.curLevel + "단계에 딜량 기록이 있습니다.";
      }
      user.log.push(new DLog(boss.type, boss.curLevel, 0, LOG_TYPE.NONE, user.name));
      boss.holdingUsers.push(user);
      return user.name + " 님을 " + boss.type + " " + boss.curLevel + "단계의 홀딩에 추가하였습니다.";
    } else {
      return "명령어 오입력\n- /홀딩 이름 보스명";
    }
  }

  deleteHoldingUser(commands: Array<string>): string {
    if((commands.length == 2 || commands.length == 3) && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (commands.length == 3) {
        if (!Bosses.isNameExist(commands[2])) {
          return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[2]);
      } else { // If boss name is not specified
        // Find bosses which the user participated with boss.relayUser
        var participatedBosses: Boss[] = Object.keys(Bosses.bossList).filter(x => Bosses.bossList[x].holdingUsers.includes(user)).map(x => Bosses.bossList[x]);
        if (participatedBosses.length > 1) {
          return commands[1] + " 님은 현재 여러 보스의 홀딩입니다. (홀딩: " + participatedBosses.map(x => x.type).join(" ") + ")\n- /홀딩취소 이름 보스명";
        } else if (participatedBosses.length < 1) {
          return commands[1] + " 님은 현재 홀딩인 보스가 없습니다.";
        }
        var boss = participatedBosses[0];
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }

      if (!boss.holdingUsers.includes(user)) {
        return user.name + " 님은 "+ boss.type + " " + boss.curLevel + "단계의 홀딩이 아닙니다.";
      }

      removeItemOnceIfExist(boss.holdingUsers,user);
      if (user.numFoundLogs(boss.type, boss.curLevel, 0, LOG_TYPE.NONE) > 0) {
        user.log = removeItemOnceIfExist(user.log, user.findLogsIfUnique(boss.type, boss.curLevel, 0, LOG_TYPE.NONE));
      }

      return user.name + " 님을 " + boss.type + " " + boss.curLevel + "단계의 홀딩에서 삭제하였습니다.";
    } else {
      return "명령어 오입력\n- /홀딩취소 이름\n- /홀딩취소 이름 보스명";
    }
  }

  moveBossLevel(commands: Array<string>): string {
    if ((commands.length == 2 || commands.length == 3) && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      var isMultiCutAllowed = false;
      if (commands.length == 3) {
        if (!isNumber(commands[2]) && commands[2] == "동타") {
          isMultiCutAllowed = true;
        } else {
          return "명령어 오입력\n- /컷(ㅋ) 보스명\n - /컷 보스명 동타";
        }
      }

      var addStr = "";
      var lastUsers = unionArray(boss.holdingUsers,boss.curUsers);
      if (lastUsers.length < 1) {
        if (boss.relayUsers[boss.curLevel].length < 1) {
          return "현재 단계에 참여한 인원이 없습니다.";
        } else if (boss.loggedUsers.length < 1 && boss.isRelayLogged == false) { //이어하기 컷
        } else {
          return "현재 단계에 참여한 인원이 없습니다.";
        }
      } else if (lastUsers.length > 1) {
        if (isMultiCutAllowed) {
          addStr = "컷 참여자: " + lastUsers.map(x => x.name).join(", ") + "\n";
        } else {
          return "현재 단계에 딜량을 입력하지 않은 인원이 여러 명 있습니다. (" + lastUsers.map(x => x.name).join(", ") + ")\n - /컷 보스명 동타";
        }
      }

      if (lastUsers.length > 0) {
        var damage = Math.round(boss.getRemained()/lastUsers.length);
        boss.curUsers.map(u => u.findLogsIfUnique(boss.type, boss.curLevel, 0, LOG_TYPE.NONE)).forEach(function(l){l.type = LOG_TYPE.LAST; l.damage = damage;});
        boss.holdingUsers.map(u => u.findLogsIfUnique(boss.type, boss.curLevel, 0, LOG_TYPE.NONE)).forEach(function(l){l.type = LOG_TYPE.HOLDLAST; l.damage = damage;});
      }

      // If the relay user clears the current level by oneself
      if (boss.curUsers.length < 1 && boss.holdingUsers.length < 1 && boss.loggedUsers.length < 1 && boss.relayUsers[boss.curLevel].length > 0 && boss.isRelayLogged == false) {
        if (boss.relayUsers[boss.curLevel].length > 1) {
          return "이어하기~마무리를 2명 이상이 할 수 없습니다. 이어하기 주자: " + boss.relayUsers[boss.curLevel].map(u => u.name).join(", ");
        }
        var damage = Math.round(boss.getRemained()/boss.relayUsers[boss.curLevel].length);
        boss.relayUsers[boss.curLevel].forEach(u => u.log.push(new DLog(boss.type, boss.curLevel, damage, LOG_TYPE.SOLO, u.name)));
        boss.relayUsers[boss.curLevel + 1] = boss.relayUsers[boss.curLevel];
      } else {
        boss.relayUsers[boss.curLevel + 1] = lastUsers;
      }

      boss.curLevel += 1;
      boss.curDamage = 0;
      boss.curUsers = [];
      boss.holdingUsers = [];
      boss.loggedUsers = [];
      boss.isRelayLogged = false;

      var text = "";

      // add estimated boss hp
      if(boss.curLevel > 1 && !boss.isLevelExist(boss.curLevel)) {
        boss.hps = boss.hps.concat(Math.round(boss.hps[boss.curLevel-1]*HP_RATE));
        text += "예상 ";
      }
      text += boss.printRemainedAndTactics();

      return boss.type + " " + boss.curLevel + "단계로 넘어갑니다. (" + boss.counts + "/" + MAX_BOSS_COUNTS + ")\n" + addStr + text;
    } else {
      return "명령어 오입력\n- /컷(ㅋ) 보스명\n - /컷 보스명 동타";
    }
  }

  revertMoveBossLevel(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 1) {
        return "1단계 이하는 '/컷취소'가 불가능합니다.";
      }
      if (boss.isPaused) {
        return boss.type + " 보스는 현재 토벌이 중지된 보스입니다.";
      }
      if (boss.curUsers.length > 0 || boss.loggedUsers.length > 0) {
        return "현재 참여 중이거나 딜량 입력을 한 유저가 있어 '/컷취소'가 불가능합니다.";
      }

      var prevLoggedUsers = Users.userList.filter(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type != LOG_TYPE.LAST)  && (l.type != LOG_TYPE.HOLDLAST) && (l.type != LOG_TYPE.SOLO)).length > 0);
      var prevCurUsers = Users.userList.filter(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.LAST)).length > 0);
      var prevHoldingUsers = Users.userList.filter(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.HOLDLAST)).length > 0);
      var prevSoloUsers = Users.userList.filter(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.SOLO)).length > 0);

      prevCurUsers.forEach(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.LAST)).forEach(function(l){l.type = LOG_TYPE.NONE; l.damage = 0;})); //revert curUsers logs
      prevHoldingUsers.forEach(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.HOLDLAST)).forEach(function(l){l.type = LOG_TYPE.NONE; l.damage = 0;})); //revert holdingUsers logs
      prevSoloUsers.forEach(u => u.log = removeItemOnceIfExist(u.log, u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.SOLO))[0])); //revert soloUsers logs

      //re-calculate damages
      var prevDamageLogs = prevLoggedUsers.map(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type != LOG_TYPE.LAST)  && (l.type != LOG_TYPE.HOLDLAST) &&  (l.type != LOG_TYPE.SOLO) && (l.type != LOG_TYPE.NONE)).map(l => l.damage));
      var prevDamage = (prevDamageLogs.length > 0) ? prevDamageLogs.map(x => (x.length > 0) ? x.reduce(function (a, b) { return (a + b); }, 0) : 0).reduce(function (a, b) { return (a + b); }, 0) : 0;
      var prevIsRelayLogged = prevLoggedUsers.filter(u => u.log.filter(l => (l.boss == boss.type) && (l.level == (boss.curLevel - 1)) && (l.type == LOG_TYPE.RELAY))).length == 1;

      boss.relayUsers[boss.curLevel] = [];
      boss.curLevel -= 1;
      boss.curDamage = prevDamage;
      boss.curUsers = prevCurUsers;
      boss.holdingUsers = prevHoldingUsers;
      boss.loggedUsers = prevLoggedUsers;
      boss.isRelayLogged = prevIsRelayLogged;

      return boss.type + " " + boss.curLevel + "단계 기록으로 복원합니다.";

    } else {
      return "명령어 오입력\n- /컷취소 보스명";
    }
  }

  printRemained(commands: Array<string>): string {
    if (commands.length == 1) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      var arr = Object.keys(Bosses.bossList).map(function (k, i) {
        var boss = Bosses.bossList[k];
        return boss.type + " " + boss.curLevel + "단계 " + boss.printRemainedAndTactics();
      });
      return arr.join("\n");
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      return boss.type + " " + boss.curLevel + "단계\n" + boss.printRemainedAndTactics();
    } else {
      return "명령어 오입력\n- /잔여(ㅈㅇ)\n- /잔여 보스명";
    }
  }

  printHoldingDamage(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      return boss.type + " " + boss.curLevel + "단계\n홀딩딜: " + (boss.hps[boss.curLevel] - boss.getRemained()) + "만 (잔여: " + boss.getRemained() + "만)";
    } else {
      return "명령어 오입력\n- /홀딩딜(ㅎㄷㄷ) 보스명";
    }
  }

  calculateRemained(commands: Array<string>): string {
    if (commands.length == 1 || commands.length == 2 || (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2]))) {
      if (commands.length == 1 || (commands.length == 2 && isNatural(commands[1]))) {
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isPaused);
        if(possibleBosses.length != 1) {
          return "보스를 특정할 수 없습니다.\n- /계산(ㄳ,ㄱㅅ) 보스명";
        }
        var boss:Boss = Bosses.bossList[possibleBosses[0]];
      } else {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss:Boss = Bosses.find(commands[1]);
      }
      if (boss.minDamage <= 0 || boss.maxDamage <= 0 || boss.minDamage >= boss.maxDamage) {
        return boss.type + "의 최소 또는 최대 딜이 입력되어 있지 않습니다."
      }

      var str = "";
      var remained = 1;

      if ((commands.length == 2 && isNatural(commands[1])) || (commands.length == 3 && isNatural(commands[2]))) {
        if (commands.length == 2 && isNatural(commands[1])) {
          remained = Number(commands[1]);
        } else {
          remained = Number(commands[2]);  
        }
          if (remained < boss.minDamage) { // Assume remained as boss level
            if (!boss.isLevelExist(remained)) {
              var level = remained;
              var estimatedHps = boss.estimateHps(level);
              remained = estimatedHps[estimatedHps.length - 1];
              str = boss.type + " " + level + "단계: 예상 " + remained + "만\n";
            } else {
              var level = remained;
              remained = boss.hps[level];
              str = boss.type + " " + level + "단계: " + remained + "만\n";
            }
          } else {
            str = boss.type + " " + remained + "만\n";
          }
      } else {
        if (boss.curLevel <= 0) {
          return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
        }
        remained = boss.getRemained();
        str = boss.type + " " + boss.curLevel + "단계 잔여: " + boss.getRemained() + "만\n";
      }

      var start = Math.round(remained / boss.maxDamage);
      var end = Math.round(remained / boss.minDamage);
      if (start < 1 || end < 1 || end < start) {
        return "잔여 체력이 계산하기에 충분하지 않습니다.";
      }
      var len = (end == start) ? 2 : end - start + 1;
      var numArr = Array.from(Array(len).keys()).map(x => x + start);
      str += numArr.map(n => n + "명, " + Math.round(remained / n) + "만").join("\n");
      return str;

    } else if ((commands.length == 3 && isNatural(commands[1]) && isNatural(commands[2])) || (commands.length == 4 && !isNumber(commands[1]) && isNatural(commands[2]) && isNatural(commands[3]))) {
      if (commands.length == 3 && isNatural(commands[1]) && isNatural(commands[2])) {
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isPaused);
        if(possibleBosses.length != 1) {
          return "보스를 특정할 수 없습니다.\n- /계산(ㄳ,ㄱㅅ) 보스명 시작단계 끝단게";
        }
        var boss:Boss = Bosses.bossList[possibleBosses[0]];
        var start = Number(commands[1]);
        var end = Number(commands[2]);
      } else {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss:Boss = Bosses.find(commands[1]);
        var start = Number(commands[2]);
        var end = Number(commands[3]);
      }
      if (boss.minDamage <= 0 || boss.maxDamage <= 0 || boss.minDamage >= boss.maxDamage) {
        return boss.type + "의 최소 또는 최대 딜이 입력되어 있지 않습니다."
      }

      if (start > end) {
        return "시작 단계(" + start + ")가 끝 단계(" + end + ")보다 작습니다.";
      }
      var hps = boss.hpRange(start,end);
      if (start == boss.curLevel) { hps[0] = boss.getRemained() };

      var requiredCounts = hps.map(x => ((Math.ceil(x / boss.maxDamage) < 1) ? 1 : Math.ceil(x / boss.maxDamage)));
      var sum = requiredCounts.reduce((a,b) => a+b,0);

      return requiredCounts.map((n, i) => (start + i) + "단계: " + n + "명, " + Math.round(hps[i] / n) + "만").join("\n") + "\n예상 총 인원: " + sum + "명";

    } else {
      return "명령어 오입력\n- /계산(ㄱㅅ) 보스명\n- /계산 보스명 [잔여체력/단계]\n- /계산 보스명 시작단계 끝단계";
    }
  }

  printCurAndLoggedUsers(commands: Array<string>): string {
    if (commands.length == 1 || (commands.length == 2 && !isNumber(commands[1]))) {
      if (commands.length == 1) {
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isPaused);
        if(possibleBosses.length != 1) {
          return "보스를 특정할 수 없습니다.\n- /단계(참여자,ㄷㄱ) 보스명";
        }
        var boss = Bosses.bossList[possibleBosses[0]];
      } else {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[1]);
      }
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (boss.holdingUsers.length < 1 && boss.curUsers.length < 1 && boss.loggedUsers.length < 1) {
        return boss.type + " " + boss.curLevel + "단계 참여자가 없습니다.";
      } else {
        var res = boss.type + " " + boss.curLevel + "단계 참여자입니다. (택틱: " + Users.getLoggedTactics(boss.type, boss.curLevel) + "명)";
        var res = boss.loggedUsers.length > 0 ? (res + "\n기록: " + boss.loggedUsers.map(u=>u.name).join(", ")) : res;
        var res = boss.curUsers.length > 0 ? (res + "\n참여 대기: " + boss.curUsers.map(u=>u.name).join(", ")) : res;
        var res = boss.holdingUsers.length > 0 ? (res + "\n홀딩 대기: " + boss.holdingUsers.map(u=>u.name).join(", ")) : res;
        return res;
      }
    } else {
      return "명령어 오입력\n- /단계(참여자,ㄷㄱ) 보스명";
    }
  }

  printCalledUsers(commands: Array<string>): string {
    if (commands.length == 2 && isUnsigned(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      var n = Number(commands[1]);
      if (n < 0 || n > MAX_TICKETS) {
        return "명령어 오입력\n- /소환(ㅅㅎ) 잔여티켓수";
      }
      var list = Users.userList.filter(u => u.tickets >= n);
      if (list.length < 1) {
        return "잔여 티켓이 " + n + "개 이상 남으신 분이 없습니다.";
      } else {
        list.sort(function (a, b) { return b.tickets - a.tickets; });
        var names = list.map(u => u.name + "(" + u.tickets + ")");
        return "잔여 티켓이 " + n + "개 이상 남으신 분들입니다.\n" + names.join(", ");
      }
    } else if (commands.length == 3 && !isNumber(commands[1]) && isUnsigned(commands[2])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      var n = Number(commands[2]);
      if (n < 0 || n > MAX_COUNTS) {
        return "명령어 오입력\n- /소환 보스명 잔여횟수";
      }
      var date = new Date();
      var day = date.getDay();
      var plusTickets = (day <= 2) ? (TICKETS_PER_DAY*(2-day)) : (TICKETS_PER_DAY*(9-day));
      const realCounts = (u:User) => Math.min((MAX_COUNTS - u.counts[boss.type]), (u.tickets + plusTickets));
      var list = Users.userList.filter(u => (realCounts(u) >= n));
      if (list.length < 1) {
        return boss.type + " 잔여 횟수가 " + n + "회 이상 남으신 분이 없습니다.";
      } else {
        list.sort(function (a, b) { return realCounts(b) - realCounts(a); });
        var names = list.map(u => u.name + "(" + realCounts(u) + "/" + u.tickets + ")");
        return boss.type + " 잔여 횟수가 " + n + "회 이상 남으신 분들입니다.\n" + names.join(", ");
      }
    } else {
      return "명령어 오입력\n- /소환(ㅅㅎ) 잔여티켓수\n- /소환 보스명 잔여횟수";
    }
  }

  printTicketsAndCounts(commands: Array<string>): string {
    if (commands.length == 1) {
      if (Users.userList.length < 1) {
        return "유저가 없습니다.";
      }
      var list = Users.userList;
      list.sort(function (a, b) { return b.tickets - a.tickets; });
      var str = list.map(u => u.name + ": 티켓 " + u.tickets + ", " + bossTypeMap(x => x + " " + u.counts[x]).join(", ")).join("\n");
      return "잔여 티켓 및 보스 참여 횟수 현황\n" + str;
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (Users.userList.length < 1) {
        return "유저가 없습니다.";
      }
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      var list = Users.userList;
      list.sort(function (a, b) { return a.counts[boss.type] - b.counts[boss.type] });
      var str = list.map(u => u.name + ": " + u.counts[boss.type]).join("\n");
      return boss.type + " 참여 횟수 현황\n" + str;
    } else {
      return "명령어 오입력\n- /현황(ㅎㅎ)\n- /현황 보스명"
    }
  }

  printDamageLogs(commands: Array<string>): string {
    if (commands.length == 1 || commands.length == 2 || commands.length == 3 || commands.length == 4) {
      if (Users.userList.length < 1) {
        return "유저가 없습니다.";
      }
      var userLogsArray: Array<DLog> = [];

      if (commands.length == 1) {
        Users.userList.forEach(function (user) { if (user.log.length > 0) { userLogsArray = userLogsArray.concat(user.log); } });
      } else if ((commands.length == 2 || commands.length == 3 || commands.length == 4) && !isNumber(commands[1])) {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss = Bosses.find(commands[1]);
        if (boss.curLevel <= 0) {
          return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
        }
        if (commands.length == 2) {
          Users.userList.forEach(function (user) {
            var filtered = user.log.filter(l => l.boss == boss.type);
            if (filtered.length > 0) { userLogsArray = userLogsArray.concat(filtered); }
          });
        } else if (commands.length == 3 && isNatural(commands[2])) {
          var level = Number(commands[2]);
          if (!boss.isLevelExist(level)) {
            return boss.type + " " + level + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
          }
          Users.userList.forEach(function (user) {
            var filtered = user.log.filter(l => l.boss == boss.type && l.level == level);
            if (filtered.length > 0) { userLogsArray = userLogsArray.concat(filtered); }
          });
        } else if (commands.length == 4 && isNatural(commands[2]) && isNatural(commands[3])) {
          var startLevel = Number(commands[2]);
          var endLevel = Number(commands[3]);
          if(startLevel > endLevel){
            return "시작단계(" + startLevel + ")가 끝단계(" + endLevel + ")보다 큽니다.";
          }
          if (!boss.isLevelExist(startLevel)) {
            return boss.type + " " + startLevel + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
          }
          if (!boss.isLevelExist(endLevel)) {
            return boss.type + " " + endLevel + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
          }
          Users.userList.forEach(function (user) {
            var filtered = user.log.filter(l => l.boss == boss.type && l.level >= startLevel && l.level <= endLevel);
            if (filtered.length > 0) { userLogsArray = userLogsArray.concat(filtered); }
          });
        } else {
          return "명령어 오입력\n- /딜로그\n- /딜로그 보스명\n- /딜로그 보스명 단계\n- /딜로그 보스명 시작단계 끝단계";
        }
      } else {
        return "명령어 오입력\n- /딜로그\n- /딜로그 보스명\n- /딜로그 보스명 단계\n- /딜로그 보스명 시작단계 끝단계";
      }

      if (userLogsArray.length < 1) {
        return "출력할 딜로그가 없습니다.";
      }
      userLogsArray.sort((a,b) => (a.date - b.date));
      var str = userLogsArray.map(l => l.user + "," + l.boss + "," + l.level + "," + l.damage + "," + l.type).join("\n");
      return "유저,보스,단계,딜량,타입\n" + str;
    } else {
      return "명령어 오입력\n- /딜로그\n- /딜로그 보스명\n- /딜로그 보스명 단계\n- /딜로그 보스명 시작단계 끝단계";
    }
  }

  printDamageSheet(commands: Array<string>): string {
    if ((commands.length == 2 || commands.length == 3) && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (Users.userList.length < 1) {
        return "유저가 없습니다.";
      }
      if (commands.length == 2) {
        var counts = MAX_COUNTS;
        var resultStr = Users.userList.map(function (user) {
          if (user.log.length > 0) {
            var matchedLogs = user.log.filter(l => (l.boss == boss.type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.DUPLICATE || l.type == LOG_TYPE.NORMAL));
            if (matchedLogs.length > 0) {
              counts = matchedLogs.length > counts ? matchedLogs.length : counts;
              return user.name + "," + matchedLogs.map(l => l.damage).join(",");
            } else {
              return user.name;
            }
          } else {
            return user.name;
          }
        }).join("\n");
        var countsArray = Array.from(Array(counts).keys()).map(x => x + 1);
        return boss.type + "," + countsArray.join(",") + "\n" + resultStr;
      } else if (commands[2] == "자세히") {
        var counts = MAX_COUNTS;
        var resultStr = Users.userList.map(function (user) {
          if (user.log.length > 0) {
            var matchedLogs = user.log.filter(l => (l.boss == boss.type));
            if (matchedLogs.length > 0) {
              counts = matchedLogs.length > counts ? matchedLogs.length : counts;
              return user.name + "," + matchedLogs.map(function(l){
                if (l.type == LOG_TYPE.DUPLICATE || l.type == LOG_TYPE.NORMAL) {
                  return l.damage + "";
                } else {
                  return l.damage + "(" + l.type + ")";
                }
              }).join(",");
            } else {
              return user.name;
            }
          } else {
            return user.name;
          }
        }).join("\n");
        var countsArray = Array.from(Array(counts).keys()).map(x => x + 1);
        return boss.type + "," + countsArray.join(",") + "\n" + resultStr;
      } else if (commands[2] == "단계별") {
        var levels = Array.from(Array(boss.curLevel).keys()).map(x => x + 1);
        var resultStr = Users.userList.map(function (user) {
          if (user.log.length > 0) {
            var damageLogs = levels.map(function (level) {
              var matchedLog = user.log.filter(l => ((l.boss == boss.type) && (l.level == level)));
              if (matchedLog.length > 0) {
                if (matchedLog.some(l => l.type == LOG_TYPE.DUPLICATE || l.type == LOG_TYPE.NORMAL)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.DUPLICATE || l.type == LOG_TYPE.NORMAL).map(l => l.damage);
                  return Math.max.apply(null, damages) + "";
                } else if (matchedLog.some(l => l.type == LOG_TYPE.LAST)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.LAST).map(l => l.damage);
                  return damages + "(" + LOG_TYPE.LAST + ")";
                } else if (matchedLog.some(l => l.type == LOG_TYPE.RELAY)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.RELAY).map(l => l.damage);
                  return damages + "(" + LOG_TYPE.RELAY + ")";
                } else if (matchedLog.some(l => l.type == LOG_TYPE.SOLO)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.SOLO).map(l => l.damage);
                  return damages + "(" + LOG_TYPE.SOLO + ")";
                } else if (matchedLog.some(l => l.type == LOG_TYPE.HOLD)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.HOLD).map(l => l.damage);
                  return damages + "(" + LOG_TYPE.HOLD + ")";
                } else if (matchedLog.some(l => l.type == LOG_TYPE.HOLDLAST)) {
                  var damages = matchedLog.filter(l => l.type == LOG_TYPE.HOLDLAST).map(l => l.damage);
                  return damages + "(" + LOG_TYPE.HOLDLAST + ")";
                } else {
                  return "";
                }
              } else {
                return "";
              }
            })
            return user.name + "," + damageLogs.join(",");
          } else {
            return user.name + "," + Array(boss.curLevel).fill("").join(",");
          }
        }).join("\n");
        return boss.type + "," + levels.join(",") + "\n" + resultStr;
      } else {
        return "명령어 오입력\n- /딜시트 보스명 [자세히, 단계별]";
      }

    } else {
      return "명령어 오입력\n- /딜시트 보스명 [자세히, 단계별]";
    }
  }


  printUserDamage(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      var str = Object.keys(Bosses.bossList).map(x => Bosses.bossList[x].type + ": " + (
        user.log.filter(l => (l.boss == Bosses.bossList[x].type)).map(l => l.level + "/" + l.damage + "/" + l.type).join(", "))).join("\n");
      return user.name + " 님의 딜량 기록입니다.\n" + str;
    } else if (commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      if (!Bosses.isNameExist(commands[2])) {
        return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[2]);
      var str = user.log.filter(l => (l.boss == boss.type)).map(l => l.level + "/" + l.damage + "/" + l.type).join(", ");
      return user.name + " 님의 " + boss.type + " 딜량 기록입니다.\n" + str;
    } else {
      return "명령어 오입력\n- /딜확인(ㄷㅎㅇ) 유저\n- /딜확인 유저 보스명"
    }
  }

  printUserAvgDamage(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (Object.keys(Bosses.bossList).some(x => Bosses.bossList[x].curLevel <= 0)) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      if (Object.keys(Bosses.bossList).every(x => user.log.filter(l => (l.boss == Bosses.bossList[x].type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).length < 1)) {
        return user.name + " 님은 평균을 내기 위한 충분한 딜량 기록을 가지고 있지 않습니다. " + AVG_LEVEL + "단계부터 계산됩니다.";
      }
      var str = Object.keys(Bosses.bossList).map(x => Bosses.bossList[x].type + ": " + (
        average(user.log.filter(l => (l.boss == Bosses.bossList[x].type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).map(l => l.damage)))).join("\n");
      return user.name + " 님의 딜량 평균입니다.\n" + str;
    } else if (commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      if (user.log.length < 1) {
        return user.name + " 님의 딜량 기록이 없습니다.";
      }
      if (!Bosses.isNameExist(commands[2])) {
        return commands[2] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[2]);
      if (user.log.filter(l => (l.boss == boss.type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).length < 1) {
        return user.name + " 님은 평균을 내기 위한 충분한 " + boss.type + " 딜량 기록을 가지고 있지 않습니다. " + AVG_LEVEL + "단계부터 계산됩니다.";
      }
      var avg = average(user.log.filter(l => (l.boss == boss.type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).map(l => l.damage));
      return user.name + " 님의 " + boss.type + " 딜량 평균: " + avg;
    } else {
      return "명령어 오입력\n- /딜평균(ㄷㅍㄱ) 유저\n- /딜평균 유저 보스명"
    }
  }

  printAvgDamage(commands: Array<string>): string {
    if (commands.length == 1) {
      return Users.userList.map(user => user.name + ": " + (Object.keys(Bosses.bossList).map(x => Bosses.bossList[x].type + " " + (
        average(user.log.filter(l => (l.boss == Bosses.bossList[x].type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).map(l => l.damage)))).join(", "))).join("\n");
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      return Users.userList.map(user => user.name + ": " + average(user.log.filter(l => (l.boss == boss.type) && (l.level >= AVG_LEVEL) && (l.type == LOG_TYPE.NORMAL || l.type == LOG_TYPE.DUPLICATE)).map(l => l.damage))).join("\n");
    } else {
      return "명령어 오입력\n- /평균(ㅍㄱ)\n- /평균 보스명"
    }
  }

  
  printTactics(commands: Array<string>): string {
    if ((commands.length == 2 || commands.length == 3 || commands.length == 4) && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      if (commands.length == 4 && isNumber(commands[2])  && isNumber(commands[3])) {
        var start = Number(commands[2]);
        var end = Number(commands[3]);
        if (start > end) {
          return "시작 단계(" + start + ")가 끝 단계(" + end + ")보다 큽니다.";
        }
        if (end > boss.curLevel) {
          return boss.type + " 보스의 현재 단계(" + boss.curLevel + ")가 끝 단계(" + end + ")보다 작습니다."; 
        }
        var res = "단계, 인원\n";
        var levels = Array.from(Array(end - start + 1).keys()).map(x => x + start);
        return res + levels.map(x => (x + ", " + Users.getLoggedTactics(boss.type,x))).join("\n");
      } else if (commands.length == 3 && isNumber(commands[2])) {
        var level = Number(commands[2]);
        if (level > boss.curLevel) {
          return boss.type + " 보스의 현재 단계(" + boss.curLevel + ")가 입력한 단계(" + level + ")보다 작습니다."; 
        }
        return boss.type + " " + level + "단계 인원: " + Users.getLoggedTactics(boss.type,level) + "명";
      } else if (commands.length == 2) {
        var res = "단계, 인원\n";
        var levels = Array.from(Array(boss.curLevel).keys()).map(x => x + 1);
        return res + levels.map(x => (x + ", " + Users.getLoggedTactics(boss.type,x))).join("\n");
      } else {
        return "명령어 오입력\n- /택틱(ㅌㅌ) 보스명\n- /택틱 보스명 단계"
      }
    } else {
      return "명령어 오입력\n- /택틱(ㅌㅌ) 보스명\n- /택틱 보스명 단계"
    }
  }

  printBossHp(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      return boss.printHps();
    } else if ((commands.length == 2 && isNumber(commands[1])) || (commands.length == 3 && !isNumber(commands[1]) && isNumber(commands[2]))) {
      if (commands.length == 2 && isNumber(commands[1])) {
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isPaused);
        if(possibleBosses.length != 1) {
          return "보스를 특정할 수 없습니다.\n- /보스체력(체력, ㅊㄹ) 보스명 단계";
        }
        var boss:Boss = Bosses.bossList[possibleBosses[0]];
        var level = Number(commands[1]);
      } else {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss:Boss = Bosses.find(commands[1]);
        var level = Number(commands[2]);
      }
      if (!boss.isLevelExist(level)) {
        var estimatedHps = boss.estimateHps(level);
        return boss.type + " " + level + "단계 예상 체력: " + estimatedHps[estimatedHps.length - 1];
      } else {
        return boss.type + " " + level + "단계 체력: " + boss.hps[level];
      }
    } else if ((commands.length == 3 && isNumber(commands[1]) && isNumber(commands[2])) || (commands.length == 4 && !isNumber(commands[1]) && isNumber(commands[2]) && isNumber(commands[3]))) {
      if (commands.length == 3 && isNumber(commands[1]) && isNumber(commands[2])) {
        var possibleBosses = Object.keys(Bosses.bossList).filter(x => !Bosses.bossList[x].isPaused);
        if(possibleBosses.length != 1) {
          return "보스를 특정할 수 없습니다.\n- /보스체력(체력,ㅊㄹ) 보스명 시작단계 끝단게";
        }
        var boss:Boss = Bosses.bossList[possibleBosses[0]];
        var start = Number(commands[1]);
        var end = Number(commands[2]);
      } else {
        if (!Bosses.isNameExist(commands[1])) {
          return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
        }
        var boss:Boss = Bosses.find(commands[1]);
        var start = Number(commands[2]);
        var end = Number(commands[3]);
      }
      if (start > end) {
        return "시작 단계(" + start + ")가 끝 단계(" + end + ")보다 큽니다.";
      }
      var hps = boss.hpRange(start,end);
      return hps.map((x, i) => (start+i) + "단계: " + x + "만").join("\n");
    } else {
      return "명령어 오입력\n- /보스체력(체력,ㅊㄹ) 보스명\n- /보스체력 보스명 단계\n- /보스체력 보스명 시작단계 끝단계";
    }
  }

  addBossHp(commands: Array<string>): string {
    if (commands.length >= 3 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var newHps = commands.slice(2);
      if (!newHps.every(isNumber)) {
        return "체력이 숫자가 아닙니다.";
      }
      var boss = Bosses.find(commands[1]);
      var newHpsNumber = newHps.map(x => Number(x));
      var lastIndex = boss.hps.length - 1;
      var lastHp = boss.hps[lastIndex];
      if (newHpsNumber.some(x => lastHp >= x)) {
        return "새로 입력한 체력이 마지막 단계의 체력보다 작습니다.";
      }
      boss.hps = boss.hps.concat(newHpsNumber);
      return boss.printHps(lastIndex + 1, boss.hps.length - 1);
    } else {
      return "명령어 오입력\n- /체력추가 보스명 체력1 체력2";
    }
  }

  replaceBossHp(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var newHp = Number(commands[2]);
      boss.hps[boss.curLevel] = newHp;
      return boss.type + " " + boss.curLevel + "단계 체력이 " + boss.hps[boss.curLevel] + "만으로 수정되었습니다.";
    } else if (commands.length == 4 && !isNumber(commands[1]) && isNatural(commands[2]) && isNatural(commands[3])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var level = Number(commands[2]);
      var newHp = Number(commands[3]);
      if (!boss.isLevelExist(level)) {
        return boss.type + " " + level + "단계는 현재 체력이 입력되지 않은 단계입니다.\n- /체력추가 보스명 체력1 체력2";
      }
      boss.hps[level] = newHp;
      return boss.type + " " + level + "단계 체력이 " + boss.hps[level] + "만으로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /체력수정 보스명 단계 체력";
    }
  }

  replaceMaxDamage(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var newMaxDamage = Number(commands[2]);
      if (newMaxDamage <= boss.minDamage) {
        return "입력한 딜량(" + newMaxDamage + ")이 현재 최소 딜량(" + boss.minDamage + ")보다 작습니다.";
      }
      boss.maxDamage = newMaxDamage;
      return boss.type + " 최대 딜량이 " + boss.maxDamage + "만으로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /최대딜수정 보스명 딜량";
    }
  }

  replaceMinDamage(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      var newMinDamage = Number(commands[2]);
      if (newMinDamage >= boss.maxDamage) {
        return "입력한 딜량(" + newMinDamage + ")이 현재 최대 딜량(" + boss.maxDamage + ")보다 큽니다.";
      }
      boss.minDamage = newMinDamage;
      return boss.type + " 최소 딜량이 " + boss.minDamage + "만으로 수정되었습니다.";
    } else {
      return "명령어 오입력\n- /최소딜수정 보스명 딜량";
    }
  }

  printBossMinMaxDamage(commands: Array<string>): string {
    if(commands.length == 1) {
      return Object.keys(Bosses.bossList).map(x => Bosses.bossList[x].type + ": 최소 " + Bosses.bossList[x].minDamage + "만, 최대 " + Bosses.bossList[x].maxDamage + "만").join("\n");
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      return boss.type + ": 최소 " + boss.minDamage + "만, 최대 " + boss.maxDamage + "만";
    } else {
      return "명령어 오입력\n- /딜범위\n- /딜범위 보스명";
    }
  }

  pauseBoss(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      boss.isPaused = true;
      return boss.type + " 토벌을 마무리합니다.";
    } else {
      return "명령어 오입력\n- /중지(마무리) 보스명";
    }
  }

  resumeBoss(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) {
      if (!Bosses.isNameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 보스명입니다.\n" + Bosses.printNames();
      }
      var boss = Bosses.find(commands[1]);
      if (boss.curLevel <= 0) {
        return "시즌 시작이 되어 있지 않습니다.\n- /시즌시작";
      }
      boss.isPaused = false;
      return boss.type + " 토벌을 재개합니다.";
    } else {
      return "명령어 오입력\n- /재시작(재개) 보스명";
    }
  }

  checkOrAddRelics(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);

      if (commands[2].startsWith('+')) {
        var newString = commands[2].substring(1);
        if (isUnsigned(newString)) {
          var newRelics = Number(newString) + user.prevRelics;
        } else {
          return "명령어 오입력\n- /유물(ㅇㅁ) 이름 개수";
        }
      } else if (isUnsigned(commands[2])) {
        var newRelics = Number(commands[2]);
        if (newRelics < user.prevRelics) {
          return "입력하신 유물 개수(" + newRelics + ")가 이전 시즌의 유물 개수(" + user.prevRelics + ") 보다 작습니다.";
        }
      } else {
        return "명령어 오입력\n- /유물(ㅇㅁ) 이름 개수";
      }
      user.relics = newRelics;
      return user.name + " 님의 유물 수가 " + user.relics + "개로 업데이트 되었습니다. (+" + (user.relics - user.prevRelics) + "개)";
    } else if (commands.length == 2 && !isNumber(commands[1])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      return user.name + " 님의 유물 수: " + user.relics + "개 (+" + (user.relics - user.prevRelics) + "개)";
    } else {
      return "명령어 오입력\n- /유물(ㅇㅁ) 이름 개수";
    }
  }

  printRelics(commands: Array<string>): string {
    if (commands.length == 1) {
      if (Users.userList.length < 1) {
        return "유저가 없습니다.";
      }
      return "유물 현황\n" + Users.userList.map(u => u.name + ": " + u.relics + " (+" + (u.relics - u.prevRelics) + ")").join("\n");
    } else {
      return "명령어 오입력\n- /유물현황(ㅇㅁㅎㅎ)";
    }
  }

  calculateCoolTime(commands: Array<string>): string {
    if (commands.length == 2) {
      if (isNatural(commands[1])) {
        return "쿨타임 " + commands[1] + "초\n" + CoolTime.calculate(Number(commands[1]));
      } else if (isNumber(commands[1])) {
        return "명령어 오입력\n- /쿨타임(쿨) 쿠키이름\n- /쿨타임 숫자(1~n)";
      } else {
        return CoolTime.calculateCookie(commands[1]);
      }
    } else {
      return "명령어 오입력\n- /쿨타임(쿨) 쿠키이름\n- /쿨타임 숫자(1~n)";
    }
  }

  addOrModifyCoolTime(commands: Array<string>): string {
    if (commands.length == 3 && !isNumber(commands[1]) && isNatural(commands[2])) {
      return CoolTime.addOrModifyCoolTime(commands[1], Number(commands[2]));
    } else {
      return "명령어 오입력\n- /쿨타임추가(쿨타임수정) 쿠키이름 숫자";
    }
  }

  deleteCoolTime(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      return CoolTime.deleteCoolTime(commands[1]);
    } else {
      return "명령어 오입력\n- /쿨타임삭제 쿠키이름";
    }
  }

  doBackup(commands: Array<string>): string {
    if (commands.length == 2 && !isNumber(commands[1])) {
      if (commands[1] == "저장") {
        var valid = Backup.save();
        if (valid) {
          return "백업을 저장하였습니다.";
        } else {
          return "백업 저장에 실패하였습니다.";
        }
      } else if (commands[1] == "불러오기" || commands[1] == "로드") {
        var valid = Backup.load();
        if (valid) {
          return "백업을 로드하였습니다.";
        } else {
          return "백업 로드에 실패하였습니다.";
        }
      } else {
        return "명령어 오입력\n- /백업 [저장/로드(불러오기)]\n- /백업 자동저장 [켜기/끄기]";
      }
    } else if (commands.length == 3 && commands[1] == "자동저장" && !isNumber(commands[2])) {
      if (commands[2] == "켜기") {
        Routine.isAsOn = true;
        return "자동 저장을 켰습니다."
      } else if (commands[2] == "끄기") {
        Routine.isAsOn = false;
        return "자동 저장을 껐습니다."
      } else {
        return "명령어 오입력\n- /백업 [저장/로드(불러오기)]\n- /백업 자동저장 [켜기/끄기]";
      }
    } else {
      return "명령어 오입력\n- /백업 [저장/로드(불러오기)]\n- /백업 자동저장 [켜기/끄기]";
    }
  }

  loadConfig(commands: Array<string>): string {
    if (commands.length == 1) {
      var [valid, str] = Config.load();
      if (valid) {
        Bosses.updateConfig();
        Routine.updateConfig();
        CoolTime.updateConfig();
        return "환경설정 완료";
      } else {
        return "환경설정에 실패하였습니다.\n" + str;
      }
    } else {
      return "명령어 오입력\n- /환경설정";
    }
  }

  addNickname(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      if (!Users.isNewNameValid(commands[2])) {
        return "유효하지 않는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      Users.addNickname(user.name,commands[2]);
      return user.name + " 님의 닉네임에 " + commands[2] + " 이(가) 추가되었습니다.";
    } else {
      return "명령어 오입력\n- /닉네임추가 유저이름 닉네임";
    }
  }

  changeNickname(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      if (!Users.isNicknameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 닉네임입니다.";
      }
      if (!Users.isNewNameValid(commands[2]) || commands[1] == commands[2]) {
        return "유효하지 않는 닉네임입니다.";
      }
      Users.changeNickname(commands[1],commands[2]);
      return commands[1] + " 닉네임이 " + commands[2] + " (으)로 변경되었습니다.";
    } else {
      return "명령어 오입력\n- /닉네임변경 닉네임 새닉네임";
    }
  }

  deleteNickname(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) {
      if (!Users.isNicknameExist(commands[1])) {
        return commands[1] + " 은(는) 없는 닉네임입니다.";
      }
      Users.deleteNickname(commands[1]);
      return commands[1] + " 닉네임이 삭제되었습니다.";
    } else {
      return "명령어 오입력\n- /닉네임삭제 닉네임";
    }
  }

  checkNickname(commands: Array<string>): string {
    if(commands.length == 1) {
      var rNicknameMap = reverseObject(Users.nicknameMap);
      return Users.userList.map(function(user){
        var nicknames = rNicknameMap[user.name];
        if (nicknames == undefined || nicknames == null || nicknames.length <= 0) {
          return user.name;
        } else {
          return user.name + "(" + nicknames.join(", ") + ")";
        }
      }).join(" ");
    } else if(commands.length == 2 && !isNumber(commands[1])) {
      if (!Users.isNameExist(commands[1])) {
        return commands[1] + " 님은 없는 닉네임입니다.";
      }
      var user = Users.find(commands[1]);
      var rNicknameMap = reverseObject(Users.nicknameMap);
      var nicknames = rNicknameMap[user.name];
      if (nicknames == undefined || nicknames == null || nicknames.length <= 0) {
        return user.name + " 님에게 등록된 닉네임이 없습니다.";
      } else {
        return user.name + ": " + nicknames.join(", ");
      }
    } else {
      return "명령어 오입력\n- /닉네임(닉네임확인) 닉네임";
    }
  }

  allowDuplicate(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) {
      if (commands[1] == "허용") {
        Bosses.duplicateAllowed = true;
        return "앞으로 중복 참여를 허용합니다. 사용한 뒤에는 꼭 꺼주세요."
      } else if (commands[1] == "거부") {
        Bosses.duplicateAllowed = false;
        return "앞으로 중복 참여를 허용하지 않습니다."
      } else {
        return "명령어 오입력\n- /중복참여 [허용/거부]";
      }
    } else {
      return "명령어 오입력\n- /중복참여 [허용/거부]";
    }
  }

  addCoupon(commands: Array<string>): string {
    if(commands.length == 2) {
      return Coupon.addCoupon(commands[1]);
    } else {
      return "명령어 오입력\n- /쿠폰 쿠폰번호";
    }
  }

  addEmail(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      return Coupon.addEmail(commands[1], commands[2]);
    } else {
      return "명령어 오입력\n- /이메일추가 닉네임 이메일"
    }
  }

  replaceEmail(commands: Array<string>): string {
    if(commands.length == 3 && !isNumber(commands[1]) && !isNumber(commands[2])) {
      return Coupon.replaceEmail(commands[1], commands[2]);
    } else {
      return "명령어 오입력\n- /이메일변경 닉네임 이메일"
    }
  }
  
  deleteEmail(commands: Array<string>): string {
    if(commands.length == 2 && !isNumber(commands[1])) {
      return Coupon.deleteEmail(commands[1]);
    } else {
      return "명령어 오입력\n- /이메일삭제 닉네임"
    }
  }

  printEmailList(commands: Array<string>): string {
    if(commands.length == 1) {
      return Coupon.printEmailList();
    } else {
      return "명령어 오입력\n- /이메일리스트"
    }
  }

  hotFix(commands: Array<string>): string {
    //Object.keys(Bosses.bossList).forEach(x => Bosses.bossList[x].holdingUsers = [])
    return "핫픽스 완료";
  }
}
const Commands = new _Commands();

/**
 * processCommand: Process command with parsing msg
 * trim multi-whitespace cases and map to specific commands
 */
function processCommand(msg: string): string {
  var commands = msg.trim().split(/\s+/);
  switch (commands[0]) {
    default: return "알 수 없는 명령어입니다.\n- /명령어"; break;
    case '/유저추가': return Commands.addUser(commands); break;
    case '/유저수정': return Commands.changeUser(commands); break;
    case '/이름수정':
    case '/이름변경': return Commands.changeUserName(commands); break;
    case '/유저삭제': return Commands.removeUser(commands); break;
    case '/유저리스트': return Commands.printUserList(commands); break;
    case '/닉네임추가': return Commands.addNickname(commands); break;
    case '/닉네임수정':
    case '/닉네임변경': return Commands.changeNickname(commands); break;
    case '/닉네임삭제': return Commands.deleteNickname(commands); break;
    case '/닉네임확인':
    case '/닉네임': return Commands.checkNickname(commands); break;
    case '/티켓충전': return Commands.checkTickets(commands); break;
    case '/시즌시작': return Commands.resetSeason(commands); break;
    case '/ㅎㅇ':
    case '/확인':
    case '/유저': return Commands.printUser(commands); break;
    case '/디버그': return Commands.printLogs(commands); break;
    case '/ㅎㅅ':
    case '/횟수': return Commands.printTotalCounts(commands); break;
    case '/횟수수정': return Commands.changeTotalCounts(commands); break;
    case '/ㅊㅇ':
    case '/참여': return Commands.addParticipate(commands); break;
    case '/ㅇㅌ':
    case '/오타': return Commands.revertParticipate(commands); break;
    case '/딜':
    case '/딜량':
    case '/ㄷ':
    case '/ㄷㄹ': return Commands.addDamage(commands); break;
    case '/딜오타':
    case '/딜수정':
    case '/ㄷㅇㅌ': return Commands.changeDamage(commands); break;
    case '/ㄷㅊㅅ':
    case '/딜취소': return Commands.revertDamage(commands); break;
    case '/ㄷㄹㄱ':
    case '/딜로그': return Commands.printDamageLogs(commands); break;
    case '/딜시트': return Commands.printDamageSheet(commands); break;
    case '/ㄷㅎㅇ':
    case '/딜확인': return Commands.printUserDamage(commands); break;
    case '/ㄷㅍㄱ':
    case '/딜평균': return Commands.printUserAvgDamage(commands); break;
    case '/딜범위': return Commands.printBossMinMaxDamage(commands); break;
    case '/마무리':
    case '/중지': return Commands.pauseBoss(commands); break;
    case '/재개':
    case '/재시작': return Commands.resumeBoss(commands); break;
    case '/ㅍㄱ':
    case '/평균': return Commands.printAvgDamage(commands); break;
    case '/잔여':
    case '/ㅈㅇ': return Commands.printRemained(commands); break;
    case '/ㄳ':
    case '/ㄱㅅ':
    case '/계산': return Commands.calculateRemained(commands); break;
    case '/ㄷㄱ':
    case '/단계':
    case '/참여자': return Commands.printCurAndLoggedUsers(commands); break;
    case '/ㅅㅎ':
    case '/소환': return Commands.printCalledUsers(commands); break;
    case '/ㅋ':
    case '/컷': return Commands.moveBossLevel(commands); break;
    case '/컷취소': return Commands.revertMoveBossLevel(commands); break;
    case '/ㅎㄷ':
    case '/홀드':
    case '/홀딩': return Commands.addHoldingUser(commands); break;
    case '/홀딩취소': return Commands.deleteHoldingUser(commands); break;
    case '/ㅎㄷㄷ':
    case '/홀딩딜': return Commands.printHoldingDamage(commands); break;
    case '/현황':
    case '/ㅎㅎ': return Commands.printTicketsAndCounts(commands); break;
    case '/ㅌㅌ':
    case '/택틱': return Commands.printTactics(commands); break;
    case '/ㅇㅁ':
    case '/유물': return Commands.checkOrAddRelics(commands); break;
    case '/ㅇㅁㅎㅎ':
    case '/유물현황': return Commands.printRelics(commands); break;
    case '/쿨':
    case '/쿨타임': return Commands.calculateCoolTime(commands); break;
    case '/쿨수정':
    case '/쿨타임수정':
    case '/쿨추가':
    case '/쿨타임추가': return Commands.addOrModifyCoolTime(commands); break;
    case '/쿨삭제':
    case '/쿨타임삭제': return Commands.deleteCoolTime(commands); break;
    case '/체력':
    case '/ㅊㄹ':
    case '/보스체력': return Commands.printBossHp(commands); break;
    case '/체력추가': return Commands.addBossHp(commands); break;
    case '/체력수정': return Commands.replaceBossHp(commands); break;
    case '/최대딜수정': return Commands.replaceMaxDamage(commands); break;
    case '/최소딜수정': return Commands.replaceMinDamage(commands); break;
    case '/몰아치기':
    case '/중복참여': return Commands.allowDuplicate(commands); break;
    case '/쿠폰':
    case '/쿠폰입력':
    case '/쿠폰추가':
    case '/쿠폰등록': return Commands.addCoupon(commands); break;
    case '/이메일추가':
    case '/이메일등록': return Commands.addEmail(commands); break;
    case '/이메일수정':
    case '/이메일변경': return Commands.replaceEmail(commands); break;
    case '/이메일삭제': return Commands.deleteEmail(commands); break;
    case '/이메일리스트': return Commands.printEmailList(commands); break;
    case '/백업': return Commands.doBackup(commands); break;
    case '/환경설정': return Commands.loadConfig(commands); break;
    case '/명령어': return Commands.printCommands(commands); break;
    case '/핫픽스': return Commands.hotFix(commands); break;
  }
}

function processPublicCommand(msg: string): string {
  var commands = msg.trim().split(/\s+/);
  switch (commands[0]) {
    default: return "알 수 없는 명령어입니다.\n- /명령어"; break;
    case '/이메일추가':
    case '/이메일등록': return Commands.addEmail(commands); break;
    case '/이메일수정':
    case '/이메일변경': return Commands.replaceEmail(commands); break;
    case '/이메일삭제': return Commands.deleteEmail(commands); break;
    case '/이메일리스트': return Commands.printEmailList(commands); break;
    case '/명령어': return "가능한 명령어입니다.\n- /이메일추가 닉네임 이메일\n- /이메일수정 닉네임 이메일\n- /이메일삭제 닉네임"; break;
  }
}

/* init: load and initialize config */
function init() {
  Config.init();
  Bosses.updateConfig();
  Routine.updateConfig();
  CoolTime.updateConfig();
}

/* checkSkipMsgs: check if message is to be skipped */
function checkSkipMsgs(msg: string): boolean {
  return Config.skipMsgs.some(x => msg.startsWith(x));
}

/* checkRoomName: check roomName */
function checkRoomName(room: string): boolean {
  return Config.roomName.some(x => room.startsWith(x));
}

/* checkPublicRoomName: check publicRoomName */
function checkPublicRoomName(room: string): boolean {
  return Config.publicRoomName.some(x => room.startsWith(x));
}

function checkNotification(sbn) {
  Routine.checkNotification(sbn);
}

function autoSave() {
  Routine.autoSave();
}


exports.processCommand = processCommand;
exports.processPublicCommand = processPublicCommand;
exports.init = init;
exports.checkSkipMsgs = checkSkipMsgs;
exports.checkRoomName = checkRoomName;
exports.checkPublicRoomName = checkPublicRoomName;
exports.checkNotification = checkNotification;
exports.autoSave = autoSave;