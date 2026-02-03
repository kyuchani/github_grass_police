# 🌱 잔디 보안관 (Grass Protector)

> **"개발자의 성실함, 1일 1커밋을 강제로 지켜드립니다."**
> GitHub 잔디(Commit)를 심지 않으면 매일 설정된 시간에 디스코드 알림을 보내는 관리 서비스입니다.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Node Version](https://img.shields.io/badge/Node.js-v20-339933) ![License](https://img.shields.io/badge/License-MIT-blue)

## 📸 프로젝트 미리보기

> ![서비스 화면](<./public/서비스 화면.png>)


> ![디스코드 알림](<./public/디스코드.png>)

## 💡 프로젝트 소개
개발자에게 중요한 꾸준한 학습 습관(1일 1커밋)을 기르기 위해 개발했습니다.
기존의 알림 봇들은 단순히 정해진 시간에 알림을 주지만, 이 서비스는 **실제로 커밋을 했는지 확인(Crawling)** 하고 **안 했을 때만** 알림을 보내 불필요한 피로도를 줄였습니다.

### 주요 기능
- **🛡️ 24시간 무중단 감시:** PM2를 이용해 서버가 죽지 않고 24시간 돌아갑니다.
- **⏰ 사용자 맞춤 알림:** 사용자마다 원하는 검사 시간(예: 아침 9시, 밤 11시)을 설정할 수 있습니다.
- **🕵️‍♂️ 스마트 검거 시스템:** GitHub 잔디 데이터를 크롤링하여 커밋 여부를 판단합니다.
- **📱 디스코드 웹훅 연동:** 별도의 앱 설치 없이 디스코드로 즉시 경고 알림을 발송합니다.
- **🖥️ 관리자 페이지:** 사용자를 등록하고 관리할 수 있는 웹 인터페이스를 제공합니다.

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | 비동기 처리에 유리한 Node.js환경에서 서버 구축 |
| **Database** | ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) | 사용자 정보 및 알림 발송 기록 관리 |
| **Crawling** | **Axios + Cheerio** | 가벼운 정적 크롤링으로 서버 부하 최소화 |
| **Infra** | **Ubuntu, PM2** | 리눅스 서버 배포 및 무중단 프로세스 관리 |
| **Frontend** | **HTML/CSS, SweetAlert2** | 직관적인 사용자 등록 화면 구현 |

## 🚀 트러블 슈팅 (Trouble Shooting)
개발 과정에서 발생한 문제와 해결 과정을 정리했습니다.

### 1. GitHub 봇 차단 문제 (404/Empty Data)
- **문제:** `axios`로 GitHub 프로필 페이지에 접근 시, 봇으로 감지되어 잔디 데이터를 주지 않는 현상 발생.
- **해결:** 1. `User-Agent` 헤더를 추가하여 브라우저 접속인 것처럼 위장.
    2. 메인 프로필 페이지 대신 데이터가 가벼운 `users/{id}/contributions` 엔드포인트로 우회 접속하여 해결.

### 2. 서버 타임존(Timezone) 불일치
- **문제:** 클라우드 서버의 시간이 UTC(영국 기준)로 되어 있어, 한국 시간(KST) 기준 알림이 제때 발송되지 않음.
- **해결:** 서버 시간을 변경하는 대신 코드 레벨에서 `(UTC + 9시간) % 24` 로직을 적용하여 한국 시간을 정확히 계산하도록 구현.

### 3. 보안 이슈 (Secure Coding)
- **문제:** 깃허브 업로드 시 DB 비밀번호와 웹훅 URL이 노출될 위험.
- **해결:** `dotenv` 라이브러리를 도입하여 민감한 정보는 `.env` 파일로 분리하고, `.gitignore`에 등록하여 업로드되지 않도록 처리.

## 📂 폴더 구조
```bash
grass-police/
├── public/          # 프론트엔드 (HTML/CSS)
├── grass_bot.js     # [핵심] 잔디 감시 및 알림 로봇
├── server.js        # 사용자 등록 웹 서버
├── .env             # 환경변수 (비밀번호) - 비공개
└── README.md        # 프로젝트 설명서
