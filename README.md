## License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0)

<br>

# 시작
* node.js가 필요합니다.
* 터미널에서 아래 명령어를 순서대로 입력해주세요.
1. npm ci
2. npm start

<br>

# 주의사항
* .env파일을 작성해야 합니다.
* 방송이 켜져 있어야만 작동됩니다.
* 이전 텍스트의 보이스가 끝나기전까지, 다음 보이스가 입력되지 않습니다.

<br>

# .env 파일 정보
* 폴더의 root의 .env파일에 환경변수가 필요합니다.
* .env파일을 생성하여, 아래 정보를 입력해주세요  
NAVER_ID = "chatsoundID" // 당신의 네이버 아이디
NAVER_PASSWORD = "chatsoundPassword123" // 당신의 네이버 비밀번호
CHZZK_LIVE_LINK = "https://chzzk.naver.com/live/{당신의 방송국 주소}"  

<br>

> 이후 개발 일정
* 채팅을 읽어주는 TTS가 현재 "유나"뿐만 되는 점을 해결
* 백그라운드에서 실행되도록 변경
