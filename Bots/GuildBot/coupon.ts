class _Coupon {
  emailInfo: {[key in string] : string};

  validateEmail(email:string) : boolean {
    var  mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(email.match(mailformat)) {
      return true;
    } else {
      return false;
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
}

const Coupon = new _Coupon();

