# AI WorkHub

사내 AI 워크스페이스 보드 — 공지 / 일정 / 메모 / AI 도메인 등록·승인 / 요청사항 / AI 추천 / 관리자.

현재 버전(v0.4)은 **데이터를 브라우저 메모리에만** 저장합니다. 새로고침하면 초기화됩니다.
여러 사람이 함께 쓰고 데이터가 영구 저장되게 하려면 다음 단계에서 **Firebase**를 연결합니다.

---

## 0. 준비물

- Node.js 18 이상 ( https://nodejs.org 에서 LTS 설치 )
- GitHub 계정
- Vercel 계정 (GitHub로 가입 가능)
- Google 계정 (Firebase용 — 다음 단계)

설치 확인:

```bash
node -v
npm -v
```

---

## 1. 로컬에서 실행해보기

압축을 푼 폴더에서:

```bash
npm install
npm run dev
```

터미널에 뜬 주소(보통 http://localhost:5173 )를 브라우저에서 엽니다.

데모 계정
- 사용자 로그인: 이름 `이서연` / 비밀번호 `1234`
- 관리자 모드: 비밀번호 `admin`

---

## 2. GitHub에 올리기

GitHub에서 새 저장소(repository)를 하나 만듭니다. 이름 예: `ai-workhub` (Public/Private 무관, 빈 저장소로).

폴더에서:

```bash
git init
git add .
git commit -m "AI WorkHub 초기 버전"
git branch -M main
git remote add origin https://github.com/본인계정/ai-workhub.git
git push -u origin main
```

`본인계정` 부분을 실제 GitHub 아이디로 바꾸세요.
(처음이면 push 할 때 GitHub 로그인/토큰을 물어볼 수 있습니다.)

---

## 3. Vercel로 배포하기

1. https://vercel.com 접속 → GitHub 계정으로 로그인
2. **Add New… → Project** 클릭
3. 방금 올린 `ai-workhub` 저장소를 **Import**
4. 설정은 자동 인식됩니다 (Framework: Vite). 그대로 **Deploy** 클릭
5. 1~2분 뒤 `https://ai-workhub-xxxx.vercel.app` 같은 주소가 생성됩니다.

이후 GitHub에 `git push` 할 때마다 Vercel이 자동으로 다시 배포합니다.

---

## 4. (다음 단계) Firebase 저장공간 준비

아래는 다음 단계에서 코드와 함께 연결할 부분입니다. 지금 미리 프로젝트만 만들어 두면 됩니다.

1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력 (예: ai-workhub) → 생성
3. 좌측 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치는 `asia-northeast3 (서울)` 권장
   - 일단 **테스트 모드**로 시작 (보안 규칙은 다음 단계에서 적용)
4. 좌측 **빌드 → Authentication → 시작하기 → 로그인 방법 → 이메일/비밀번호 사용 설정**
5. 프로젝트 설정(⚙️) → **내 앱 → 웹 앱 추가(</>)** → 앱 등록
6. 화면에 나오는 `firebaseConfig` 값(apiKey, authDomain 등)을 복사해서 보관

이 `firebaseConfig` 값만 알려주시면(또는 `.env`에 넣는 법을 안내해 드립니다), 다음 단계에서
데이터·로그인·승인·보안등급을 모두 Firebase에 저장되도록 연결하겠습니다.

---

## 프로젝트 구조

```
ai-workhub/
├─ index.html
├─ package.json
├─ vite.config.js
├─ .gitignore
└─ src/
   ├─ main.jsx      # 진입점
   ├─ App.jsx       # 화면 전체 (보드/워크스페이스/공지/요청/AI추천/관리자/로그인)
   └─ index.css     # 기본 스타일
```
