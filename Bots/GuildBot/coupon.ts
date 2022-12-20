class _Coupon {
  emailInfo: {[key in string] : string};

  constructor(){ this.emailInfo = {}; };

  validateEmail(email:string) : boolean {
    var  mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(email.match(mailformat)) {
      return true;
    } else {
      return false;
    }
  }

  addEmail(name:string, email:string) : string {
    if(!this.validateEmail(email)) {
      return "이메일 형식이 맞지 않습니다.";
    } else if (Object.keys(this.emailInfo).length == 0) {
      this.emailInfo[name] = email;
      return name + " 님의 이메일 주소가 등록되었습니다.";
    } else if (Object.keys(this.emailInfo).includes(name)) {
      return name + " 님은 이미 등록되어 있습니다.";
    } else if (Object.keys(this.emailInfo).map(k => this.emailInfo[k]).includes(email)) {
      return "이미 등록된 이메일 주소입니다.";
    } else {
      this.emailInfo[name] = email;
      return name + " 님의 이메일 주소가 등록되었습니다.";
    }
  }

  replaceEmail(name:string, email:string) : string {
    if(!this.validateEmail(email)) {
      return "이메일 형식이 맞지 않습니다.";
    } else if (Object.keys(this.emailInfo).length == 0) {
      return "등록된 이메일이 없습니다.";
    } else if (!Object.keys(this.emailInfo).includes(name)) {
      return name + " 님을 찾을 수 없습니다.";
    } else if (Object.keys(this.emailInfo).map(k => this.emailInfo[k]).includes(email)) {
      return "이미 등록된 이메일 주소입니다.";
    } else {
      this.emailInfo[name] = email;
      return name + " 님의 이메일 주소가 변경되었습니다.";
    }
  }

  deleteEmail(name:string) : string {
    if (Object.keys(this.emailInfo).length == 0) {
      return "등록된 이메일이 없습니다.";
    } else if (!Object.keys(this.emailInfo).includes(name)) {
      return name + " 님을 찾을 수 없습니다.";
    } else {
      delete this.emailInfo[name];
      return name + " 님의 이메일 주소가 삭제되었습니다.";
    }
  }

  decode(code:number) : string {
    switch(code) {
      case 20000:
        return "상품이 정상적으로 지급되었습니다. 게임에 접속해서 확인해주세요.";
      case 40006:
        return "DevPlay 계정을 다시 한번 확인해주세요.";
      case 42501:
        return "사용 기간이 만료된 쿠폰입니다.";
      case 42502:
        return "쿠폰번호를 다시 한번 확인해주세요.";
      case 42201:
      case 42503:
        return "해당 계정으로 이미 같은 종류의 쿠폰을 등록하셨습니다.";
      case 42203:
      case 42504:
        return "이미 사용된 쿠폰입니다.";
      default:
        return "서버에서 알 수 없는 응답이 발생하였습니다. 잠시후 다시 시도해주세요.";
    }
  }

  sendHttpRequest(email:string, coupon:string) : number {
    try {
    //@ts-ignore
    var res = org.jsoup.Jsoup.connect("https://account.devplay.com/v2/coupon/ck")
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .ignoreContentType(true)
    .ignoreHttpErrors(true)
    .requestBody(JSON.stringify({"email": email, "coupon_code": coupon}))
    .post().body().text();
    var code = JSON.parse(res).code;
    return Number(code);
    } catch (e) {
      Logs.d(e);
      return 99999;
    }
  }

  addCoupon(coupon:string) : string {
    var couponformat = /^[A-Za-z0-9]*$/;
    if(coupon.length != 16 || !coupon.match(couponformat)) {
      return "쿠폰 형식이 맞지 않습니다.";
    } else if (!this.emailInfo || Object.keys(this.emailInfo).length == 0) {
      return "등록된 유저가 없습니다.";
    } else {
      var res: {[key in string] : number} = {};
      Object.keys(this.emailInfo).forEach(name => res[name] = this.sendHttpRequest(this.emailInfo[name], coupon));

      var normal = Object.keys(res).filter(name => res[name] == 20000); //정상
      var wrongEmail = Object.keys(res).filter(name => res[name] == 40006); //이메일오류
      var expired = Object.keys(res).filter(name => res[name] == 42501); //만료
      var wrongCoupon = Object.keys(res).filter(name => res[name] == 42502); //쿠폰오류
      var sameKind = Object.keys(res).filter(name => res[name] == 42201 || res[name] == 42503); //같은종류
      var usedCoupon = Object.keys(res).filter(name => res[name] == 42203 || res[name] == 42504); //이미사용
      var none = Object.keys(res).filter(function(n){ var t = res[n]; return (t != 20000 && t != 40006 && !(t <= 42504 && t >= 42501) && t != 42201 && t != 42203)}); //에러

      if (expired.length > 0){
        return "만료된 쿠폰입니다.";
      } else if (wrongCoupon.length > 0){
        return "쿠폰번호를 다시 한번 확인해주세요.";
      } else {
        var resString = "쿠폰 등록 결과입니다.";
        resString += (normal.length > 0) ? ("\n정상 등록: " + normal.join(", ")) : "";
        resString += (wrongEmail.length > 0) ? ("\n이메일 오타: " + wrongEmail.join(", ")) : "";
        resString += (sameKind.length > 0) ? ("\n같은 종류 쿠폰 사용: " + sameKind.join(", ")) : "";
        resString += (usedCoupon.length > 0) ? ("\n이미 사용: " + usedCoupon.join(", ")) : "";
        resString += (none.length > 0) ? ("\n에러: " + none.join(", ")) : "";
        return resString;
      }
    }
  }
}

const Coupon = new _Coupon();

