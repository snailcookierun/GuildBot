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

  printEmailList() : string {
    return "이메일이 등록된 닉네임입니다.\n" + Object.keys(this.emailInfo).join(", ");
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

  sendHttpRequest(email:string, coupon:string) : string {
    try {
      var res = Apis.sendHttpRequestPost("https://coupon.devplay.com/v1/coupon/ck",JSON.stringify({"email": email, "game_code": "ck", "coupon_code": coupon}));
      var code = JSON.parse(res).responseCode;
      return code;
    } catch (e) {
      Logs.d(e,false);
      return "ERROR";
    }
  }

  addCoupon(coupon:string) : string {
    var couponformat = /^[A-Za-z0-9]*$/;
    if(coupon.length != 16 || !coupon.match(couponformat)) {
      return "쿠폰 형식이 맞지 않습니다.";
    } else if (!this.emailInfo || Object.keys(this.emailInfo).length == 0) {
      return "등록된 유저가 없습니다.";
    } else {
      var res: {[key in string] : string} = {};
      Object.keys(this.emailInfo).forEach(name => res[name] = this.sendHttpRequest(this.emailInfo[name], coupon));

      var normal = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_SUCCESS"); //정상
      var wrongEmail = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_ACCOUNT_NOT_FOUND"); //이메일오류
      var expired = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_NOT_EVENT_TIME"); //만료
      var wrongCoupon = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_COUPON_CODE_NOT_FOUND" || res[name] == "RESPONSE_CODE_NOT_TARGET_COUNTRY"); //쿠폰오류
      var usedCoupon = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_COUPON_CODE_ALREADY_USED"); //이미사용
      var fcfsCoupon = Object.keys(res).filter(name => res[name] == "RESPONSE_CODE_COUPON_USAGE_ALREADY_MAX"); //선착순만료
      var none = Object.keys(res).filter(function(n){ var t = res[n]; return (t == "ERROR") || (t != "RESPONSE_CODE_SUCCESS" 
                    && t != "RESPONSE_CODE_ACCOUNT_NOT_FOUND" && t != "RESPONSE_CODE_NOT_EVENT_TIME" && t != "RESPONSE_CODE_COUPON_CODE_NOT_FOUND" && t != "RESPONSE_CODE_NOT_TARGET_COUNTRY"
                    && t != "RESPONSE_CODE_NOT_EVENT_TIME" && t != "RESPONSE_CODE_COUPON_CODE_ALREADY_USED" && t != "RESPONSE_CODE_COUPON_USAGE_ALREADY_MAX")}); //에러

      if (expired.length > 0){
        return "쿠폰의 사용 기간을 다시 한번 확인해주세요.";
      } else if (wrongCoupon.length > 0){
        return "쿠폰번호를 다시 한번 확인해주세요.";
      } else {
        var resString = "쿠폰 등록 결과입니다.";
        resString += (normal.length > 0) ? ("\n정상 등록: " + normal.join(", ")) : "";
        resString += (wrongEmail.length > 0) ? ("\n이메일 오타: " + wrongEmail.join(", ")) : "";
        resString += (fcfsCoupon.length > 0) ? ("\n선착순 끝: " + fcfsCoupon.join(", ")) : "";
        resString += (usedCoupon.length > 0) ? ("\n이미 사용: " + usedCoupon.join(", ")) : "";
        resString += (none.length > 0) ? ("\n에러: " + none.join(", ")) : "";
        return resString;
      }
    }
  }
}

const Coupon = new _Coupon();

