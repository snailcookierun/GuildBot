# GuildBot 길드봇

© 2023 snailcookierun

## 명령어

- 명령어 [노션 링크](https://www.notion.so/snailcookierun/826e99d07410464ab64394ea7ac8cf4b)

## 개발 환경 셋팅

1. node v18.16.0 및 npm 설치
2. `npm install -g typescript @types/node yarn pm2`
3. `npm install @remote-kakao/core@1.0.7 axios crypto googleapis @google-cloud/local-auth express`

## 핸드폰 셋팅

1. 안드로이드 핸드폰(번호가 있어야 함)에 카톡 최신 버전 설치
2. 카톡 계정 만들고 프로필 사진 업로드
3. 메신저봇R 설치
4. 테스트 봇 (GuildBot) 만들고 카톡 응답이 오는지 확인
5. 오픈 프로필 만들고 카톡 응답이 오는지 확인

## node 버전 길드봇

최신 버전은 node.js를 사용하는 봇입니다. 이 셋팅을 하기 위해서는 안드로이드 핸드폰에 추가적으로 node.js를 돌릴 (항상 켜져 있는) 컴퓨터가 필요합니다. [관련 링크](https://github.com/remote-kakao/core)

1. 컴퓨터: 개발 환경 셋팅과 동일하게 설정
2. 핸드폰: 핸드폰 셋팅과 동일하게 설정
3. [remote-kakao-client](https://github.com/remote-kakao/core-client/tree/1.0.0) 1.0 버전 받기
4. src/index.ts 에 있는 `address` 및 `port`를 컴퓨터의 IP 주소 및 사용할 포트로 바꾸기 (보통 포트번호는 3000번으로 설정)
5. `yarn & yarn build` 후 dist/index.js 를 핸드폰의 봇에 붙여넣고 컴파일
6. [remote-kakao-core](https://github.com/remote-kakao/core/tree/v1.0.0) 1.0 버전에 있는 example 을 컴퓨터에 복사하고 포트 변경 (example.js)
7. 컴퓨터에서 `node example.js`
8. 핸드폰에서 봇에게 `>ping` 명령어를 치고 답장이 오는지 확인

위의 테스트를 성공하였다면 이제 아래를 수행합니다.

1. common/config-example.json 의 `skipMsgs`, `roomName`, `publicRoomName`, `adminRoomName`을 고친 후 config.json 으로 저장
    - `skipMsgs`: 무시할 명령어, 방장봇과 명령어가 겹칠 경우 사용
    - `roomName`: 톡방 이름이나 메시지를 보낸 사람 이름
    - `publicRoomName`: 쿠폰 이메일 입력용 톡방 이름
    - `adminRoomName`: 관리자 톡방이나 관리자 이름
2. node/modules/config-plugin-example.json 설정 후 config-plugin.json 으로 저장 
    - 카페 구인글 자동 작성에 필요한 설정이므로 사용하지 않을 거라면 패스해도 됨
    - 네이버 카페 API [관련 링크](https://developers.naver.com/docs/login/cafe-api/cafe-api.md)
    - 구글 API [관련 링크](https://developers.google.com/workspace/guides/create-credentials)
3. `cd node & yarn build`
4. node/dist 에 config.json 옮기기
5. node/dist 에 config-cooltime.json 복사
6. node/dist/modules 에 config-plugin.json 및 google-credentials.json 옮기기
7. node/dist 에 data 폴더 만들기
8. `cd dist & node GuildBot.js`

봇이 계속 켜져있게 하려면 [pm2](https://pm2.keymetrics.io/)를 기본 fork 모드로 사용하는 것을 권장합니다. [관련 링크](https://engineering.linecorp.com/ko/blog/pm2-nodejs)


## msgbot 버전 길드봇

node로 버전을 업그레이드 하기 전에는 핸드폰의 메신저봇R로만 돌아가는 봇을 사용하였습니다. 하지만 핸드폰에서 돌아가면 메모리 초기화 등으로 매번 데이터가 날라갈 수 있습니다. 내부적으로 10분에 한번씩 알림이 오는 앱을 두고 백업 루틴이 돌아가게 해야 합니다.

1. common/config-example.json 의 `skipMsgs`, `roomName`, `publicRoomName`, `adminRoomName`, `routines`을 고친 후 config.json 으로 저장
    - `skipMsgs`: 무시할 명령어, 방장봇과 명령어가 겹칠 경우 사용
    - `roomName`: 톡방 이름이나 메시지를 보낸 사람 이름
    - `publicRoomName`: 쿠폰 이메일 입력용 톡방 이름
    - `adminRoomName`: 관리자 톡방이나 관리자 이름
    - `routines.appName`: 백업 루틴의 알림을 주는 앱 이름
    - `routines.title`: 알림의 제목
2. `cd msgbot & tsc`
3. GuildBot.js 를 복사하여 핸드폰 봇의 기존 파일에 덮어쓰기
4. modules/main.js 를 복사하여 핸드폰 봇의 폴더에 modules 폴더를 만들고 붙여넣기
5. 핸드폰 봇의 폴더에 data 폴더 만들기
6. 핸드폰 봇의 폴더에 config.json 및 config-cooltime.json 붙여넣기
7. 컴파일 후 돌려보기

## FAQ

- 메신저봇R 관련 정보는 [카카오톡 봇 커뮤니티](https://cafe.naver.com/nameyee) 카페에서 얻을 수 있음
- 윈도우에서 node.js를 돌릴 경우 방화벽 설정을 통해 사용하는 포트를 열어줘야 함. [관련 링크](https://ansan-survivor.tistory.com/408)
- 봇 이름이 `GuildBot`이 아닌 경우, 파일에 있는 `scriptName`을 변경해주어야 함
- 안드로이드 11 이상 및 카카오톡 9.7.0 이상일 경우 `responseFix` 를 사용해야 할 수도 있음. [관련 링크](https://cafe.naver.com/msgbot/2067)
- `tsc` authorization error in Windows: type `Set-ExecutionPolicy RemoteSigned` in powershell
- 갤럭시 설정 중 "배터리 사용량 최적화"가 있는데, 메봇과 봇구동과 관련된 모든 앱은 모두 최적화 제외를 하는 것이 좋음
- GOS도 끌 수 있다면 끄는 게 좋을 수 있음
- 핸드폰의 수명이 괜찮다면 그냥 메봇의 화면 항상 켜기를 이용하는 방법도 있음

## License

- Apache 2.0 License를 따릅니다.
