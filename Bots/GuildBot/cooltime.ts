class _CoolTime {
  cookieCoolTime: {[key in string] : number};

  updateConfig(){this.cookieCoolTime = Config.cookieCoolTime}

  calculate(n: number) : string {
    var max = Math.ceil(n*0.3-0.5);
    var min = Math.ceil(n*0.7*0.3-0.5);
    if (min < 1 || max < 1) {
      return "시작 쿨타임을 계산하기에 쿨타임이 너무 짧습니다.";
    }
    var len = max - min + 1;
    var numArr = Array.from(Array(len).keys()).map(x => max - x);
    var str = numArr.map(function(x){
      var c = (Math.ceil((1-(1/0.3/n)*(x+0.5))*1000)/10);
      var d = c > 0 ? c : 0;
      return x + "초: " + d + "%";
    }).join("\n");

    return str;
  }

  calculateCookie(name: string) : string {
    if(!this.cookieCoolTime || this.cookieCoolTime[name] == undefined) {
      return name + "은(는) 현재 입력되지 않은 쿠키입니다. 전체 이름을 입력해주세요.";
    } else if(name == "오이스터") {
      var str = name + ": 쿨타임 " + this.cookieCoolTime[name] + "초";
      str += "\n시작 쿨타임: 2초 (고정)";
      str += "\n1 소환수: 0%";
      str += "\n2 소환수: 0%(시계O), 18.1%(시계X)";
      str += "\n3 소환수: 11.2%(시계O)";
      str += "\n4 소환수: 29.3%(시계O)";
      return str;
    } else if(name == "펌킨파이") {
      var str = name + ": 쿨타임 " + this.cookieCoolTime[name] + "초";
      str += "\n시작 쿨타임: 1초 (고정)";
      return str;
    } else if(name == "찰스") {
      var str = name + ": 쿨타임 " + this.cookieCoolTime[name] + "초";
      str += "\n시작 쿨타임: 2초 (고정)";
      return str;
    } else {
      var str = name + ": 쿨타임 " + this.cookieCoolTime[name] + "초";
      str += "\n" + this.calculate(this.cookieCoolTime[name]);
      return str;
    }
  }
}

const CoolTime = new _CoolTime();