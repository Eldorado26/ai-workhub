# AI WorkHub

사내 AI 워크스페이스 보드. 데이터는 Firebase Firestore의 `board` 컬렉션에 저장됩니다.

## 폴더 구조 (모든 파일이 한 곳에 있습니다)

```
ai-workhub/
├─ index.html
├─ package.json
├─ vite.config.js
├─ main.jsx       # 진입점
├─ App.jsx        # 화면 전체
├─ firebase.js    # Firebase 연결 (config 포함)
├─ index.css      # 기본 스타일
└─ .gitignore
```

## GitHub에 덮어쓰기 (가장 쉬운 방법)

1. 이 zip을 압축 해제합니다.
2. GitHub 저장소(ai-workhub) → **Add file → Upload files**
3. 압축 푼 폴더 안의 **모든 파일을 한꺼번에 선택해서 드래그**합니다. (폴더 없이 전부 한 곳에 있으므로 그냥 다 끌어다 놓으면 됩니다.)
4. 같은 이름 파일은 자동으로 덮어쓰기됩니다.
5. 맨 아래 **Commit changes** 클릭 → Vercel이 자동으로 다시 배포합니다.

### 기존에 잘못 올라간 것 정리 (선택)
예전 업로드로 생긴 `src` 폴더와 `download` 파일은 더 이상 쓰지 않습니다. 남아 있어도 동작에는 지장이 없지만, 깔끔하게 하려면 GitHub에서 삭제해도 됩니다.

## 로컬에서 확인 (선택)

```bash
npm install
npm run dev
```

## Firebase

- 이미 `firebase.js`에 연결 정보가 들어 있습니다.
- Firestore 보안 규칙은 콘솔에서 전체 허용(`allow read, write: if true`) 상태면 바로 동작합니다.
- 첫 접속 시 데모 데이터가 자동으로 한 번 채워지고, 이후 모든 변경이 저장·공유됩니다.

데모 계정: 사용자 `이서연 / 1234`, 관리자 비밀번호 `admin` (운영 전 변경 권장)
