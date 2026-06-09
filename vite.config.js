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

## 4. Firebase 연결 (데이터 영구 저장 + 공유)

이 버전(v0.5)은 이미 코드가 Firebase Firestore와 연결되도록 작성돼 있습니다.
아래 설정만 하면 가입·승인·등록·공지 등 모든 데이터가 클라우드에 저장되고 여러 사람이 함께 보게 됩니다.

### 4-1. Firebase 프로젝트 만들기
1. https://console.firebase.google.com 접속 → **프로젝트 추가** → 이름 입력(예: ai-workhub) → 생성
2. 좌측 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)` 권장
   - 시작 모드: **프로덕션 모드**로 선택 (규칙은 아래 4-3에서 넣습니다)
3. 프로젝트 설정(⚙️) → 아래로 스크롤 → **내 앱 → 웹(</>) 추가** → 앱 등록
4. 화면에 나오는 `firebaseConfig` 6개 값(apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)을 복사

### 4-2. 설정값 붙여넣기
`src/firebase.js` 파일을 열어 `여기에-붙여넣기` 부분을 복사한 값으로 바꿉니다.
(GitHub 웹에서 그 파일 → 연필(Edit) 아이콘 → 값 교체 → Commit 해도 됩니다.)

> apiKey 등은 웹앱에서 공개돼도 되는 식별자라 저장소에 올라가도 괜찮습니다.
> 접근 제어는 아래 보안 규칙으로 합니다.

### 4-3. 보안 규칙 넣기
Firebase 콘솔 → Firestore Database → **규칙(Rules)** 탭에 아래를 붙여넣고 **게시(Publish)**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /board/{doc} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ 주의: 위 규칙은 프로토타입용으로 **누구나 읽고 쓸 수 있는 상태**입니다. 사내에서 주소를 아는 사람끼리 쓰는 정도엔 괜찮지만, 외부에 널리 공유하거나 민감한 정보를 담기 전에는 Firebase 로그인 기반의 잠긴 규칙으로 바꾸는 것이 좋습니다. (원하면 다음 단계에서 적용)

### 4-4. 반영
- 로컬: `npm install` 다시 한 번 → `npm run dev`
- 배포: 바뀐 파일(`package.json`, `src/App.jsx`, `src/firebase.js`)을 GitHub에 올리면 Vercel이 자동 재배포합니다.

첫 접속 시 데모 데이터(이서연 등)가 Firestore에 자동으로 한 번 채워집니다. 이후엔 모든 변경이 저장·공유됩니다.

---

## 변경 사항을 GitHub에 다시 올리는 법 (웹 방식)

1. 받은 새 zip을 압축 해제
2. GitHub 저장소 → **Add file → Upload files**
3. 압축 푼 폴더 **안의 항목 전체**(`index.html`, `package.json`, `vite.config.js`, `README.md`, `src` 폴더)를 드래그
   - 같은 이름은 자동으로 덮어쓰기되고, 새 파일(`src/firebase.js`)은 추가됩니다.
4. 아래 **Commit changes** 클릭 → Vercel 자동 재배포

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
