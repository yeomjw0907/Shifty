# 📋 설정 값 제공 가이드

## 📋 개요
사용자가 설정 값을 제공하면 자동으로 처리할 작업들을 정리했습니다.

---

## 🔄 자동 처리 프로세스

### 1. Firebase 설정 값 제공 시

**제공 형식:**
```markdown
## Firebase
- API Key: AIzaSy...
- Auth Domain: shifty-app.firebaseapp.com
- Project ID: shifty-app
- Messaging Sender ID: 123456789
- App ID: 1:123456789:web:abc123
- Server Key (FCM): AAAA...
```

**자동 처리 작업:**
1. ✅ `src/utils/firebase/config.ts` 파일 생성
2. ✅ Firebase 설정 값 입력
3. ✅ `firebase-messaging-sw.js` 파일 생성 (Service Worker)
4. ✅ `src/utils/firebase/messaging.ts` 파일 생성 (FCM 토큰 관리)
5. ✅ `src/components/MyPage.tsx`에 FCM 토큰 등록 로직 추가
6. ✅ Supabase Edge Function 환경 변수 설정 가이드 제공

**생성될 파일:**
- `src/utils/firebase/config.ts`
- `public/firebase-messaging-sw.js`
- `src/utils/firebase/messaging.ts`

---

### 2. 소셜 로그인 설정 값 제공 시

**제공 형식:**
```markdown
## 소셜 로그인
### Kakao
- Client ID: abc123...
- Redirect URI: https://shifty.ai/auth/callback/kakao

### Google
- Client ID: 123456.apps.googleusercontent.com
- Client Secret: GOCSPX-...
- Redirect URI: https://shifty.ai/auth/callback/google
```

**자동 처리 작업:**
1. ✅ `src/utils/auth/kakao.ts` 파일 생성/수정
2. ✅ `src/utils/auth/google.ts` 파일 생성/수정
3. ✅ `src/components/AuthScreen.tsx`에 소셜 로그인 버튼 추가
4. ✅ Supabase Auth 설정 가이드 제공
5. ✅ 리디렉션 URI 설정 확인

**수정될 파일:**
- `src/components/AuthScreen.tsx`
- `src/utils/auth/kakao.ts` (신규)
- `src/utils/auth/google.ts` (신규)

---

### 3. Supabase 환경 변수 제공 시

**제공 형식:**
```markdown
## Supabase Environment Variables
- FCM_SERVER_KEY: AAAA...
```

**자동 처리 작업:**
1. ✅ Supabase Edge Function 환경 변수 설정 가이드 제공
2. ✅ 서버 코드에서 환경 변수 사용 확인
3. ✅ 테스트 스크립트 제공

**확인할 파일:**
- `src/supabase/functions/server/index.tsx` (FCM 서버 키 사용 부분)

---

### 4. 도메인 정보 제공 시

**제공 형식:**
```markdown
## 배포
- 도메인: shifty.ai
- Admin 도메인: admin.shifty.ai (선택사항)
```

**자동 처리 작업:**
1. ✅ `vite.config.ts`에서 빌드 설정 확인
2. ✅ `manifest.json`에서 PWA 설정 업데이트
3. ✅ 소셜 로그인 Redirect URI 업데이트
4. ✅ Vercel 배포 설정 가이드 제공
5. ✅ DNS 설정 가이드 제공

**수정될 파일:**
- `src/public/manifest.json`
- `vite.config.ts` (필요시)

---

## 📝 설정 값 제공 템플릿

다음 템플릿을 사용하여 설정 값을 제공해주세요:

```markdown
# Shifty 설정 값

## Firebase
- API Key: 
- Auth Domain: 
- Project ID: 
- Messaging Sender ID: 
- App ID: 
- Server Key (FCM): 

## Supabase
- Project ID: (이미 설정됨)
- Public Anon Key: (이미 설정됨)

## 소셜 로그인
### Kakao
- Client ID: 
- Redirect URI: 

### Google
- Client ID: 
- Client Secret: 
- Redirect URI: 

### Naver (선택사항)
- Client ID: 
- Client Secret: 
- Redirect URI: 

## 공공데이터 API (선택사항)
- API Key: 

## 배포
- 도메인: 
- Admin 도메인 (선택사항): 
```

---

## 🔄 처리 우선순위

### 1단계: 필수 설정 (앱 동작)
1. Firebase 설정 → FCM 토큰 관리 구현
2. 소셜 로그인 설정 → 로그인 기능 활성화

### 2단계: 선택 설정 (기능 확장)
3. 공공데이터 API → 병원 검색 기능 강화
4. 도메인 설정 → 프로덕션 배포

---

## ✅ 확인 사항

설정 값을 제공하신 후 다음을 확인해주세요:

- [ ] 제공한 값이 올바른 형식인지 확인
- [ ] Firebase 프로젝트가 생성되었는지 확인
- [ ] 소셜 로그인 앱이 등록되었는지 확인
- [ ] Redirect URI가 올바르게 설정되었는지 확인

---

**마지막 업데이트**: 2024년 12월

