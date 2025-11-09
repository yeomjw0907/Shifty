# 🔄 설정 값 제공 시 자동 처리 가이드

## 📋 개요
이 문서는 사용자가 설정 값을 제공하면 **자동으로 처리되는 모든 작업**을 정리한 가이드입니다.

---

## 🔄 자동 처리 프로세스

### 1. Firebase 설정 값 제공 시

#### 제공 형식
```markdown
## Firebase
- API Key: AIzaSy...
- Auth Domain: shifty-app.firebaseapp.com
- Project ID: shifty-app
- Messaging Sender ID: 123456789
- App ID: 1:123456789:web:abc123
- Server Key (FCM): AAAA...
```

#### 자동 처리 작업

**1.1 Firebase 설정 파일 생성**
- ✅ `src/utils/firebase/config.ts` 파일 생성
- ✅ Firebase 설정 값 입력
- ✅ 타입 정의 포함

**1.2 Service Worker 생성**
- ✅ `public/firebase-messaging-sw.js` 파일 생성
- ✅ FCM 메시지 수신 처리 로직
- ✅ 백그라운드 알림 처리

**1.3 FCM 토큰 관리 유틸리티 생성**
- ✅ `src/utils/firebase/messaging.ts` 파일 생성
- ✅ FCM 토큰 등록 함수
- ✅ FCM 토큰 삭제 함수
- ✅ 알림 권한 요청 함수

**1.4 마이페이지 통합**
- ✅ `src/components/MyPage.tsx`에 FCM 토큰 등록 로직 추가
- ✅ 알림 권한 요청 시 자동 토큰 등록
- ✅ 토큰 갱신 로직 추가

**1.5 환경 변수 설정 가이드 제공**
- ✅ Supabase Edge Function 환경 변수 설정 확인
- ✅ `FCM_SERVER_KEY` 설정 확인 가이드

---

### 2. 소셜 로그인 설정 값 제공 시

#### 제공 형식
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

#### 자동 처리 작업

**2.1 Kakao 로그인 유틸리티 생성**
- ✅ `src/utils/auth/kakao.ts` 파일 생성
- ✅ Kakao 로그인 함수
- ✅ Kakao 로그아웃 함수
- ✅ Kakao 토큰 관리

**2.2 Google 로그인 유틸리티 생성**
- ✅ `src/utils/auth/google.ts` 파일 생성
- ✅ Google 로그인 함수
- ✅ Google 로그아웃 함수
- ✅ Google 토큰 관리

**2.3 AuthScreen 컴포넌트 수정**
- ✅ `src/components/AuthScreen.tsx`에 소셜 로그인 버튼 추가
- ✅ Kakao 로그인 버튼
- ✅ Google 로그인 버튼
- ✅ Naver 로그인 버튼 (제공된 경우)
- ✅ 소셜 로그인 스타일링

**2.4 Supabase Auth 설정 가이드 제공**
- ✅ Supabase Dashboard에서 OAuth 제공자 설정 가이드
- ✅ Kakao OAuth 설정 방법
- ✅ Google OAuth 설정 방법
- ✅ Naver OAuth 설정 방법 (제공된 경우)
- ✅ 리디렉션 URI 설정 확인

**2.5 API 클라이언트 수정**
- ✅ `src/utils/api.ts`에 소셜 로그인 함수 추가
- ✅ Kakao 로그인 API 호출
- ✅ Google 로그인 API 호출

---

### 3. 도메인 정보 제공 시

#### 제공 형식
```markdown
## 배포
- 도메인: shifty.ai
- Admin 도메인 (선택사항): admin.shifty.ai
```

#### 자동 처리 작업

**3.1 PWA 설정 업데이트**
- ✅ `src/public/manifest.json` 업데이트
- ✅ `start_url` 도메인 업데이트
- ✅ `scope` 도메인 업데이트

**3.2 소셜 로그인 Redirect URI 업데이트**
- ✅ `src/utils/auth/kakao.ts`의 Redirect URI 업데이트
- ✅ `src/utils/auth/google.ts`의 Redirect URI 업데이트
- ✅ `src/utils/auth/naver.ts`의 Redirect URI 업데이트 (제공된 경우)

**3.3 Vercel 배포 설정 가이드 제공**
- ✅ Vercel 프로젝트 생성 가이드
- ✅ GitHub 저장소 연결 가이드
- ✅ 환경 변수 설정 가이드
- ✅ 배포 실행 가이드

**3.4 DNS 설정 가이드 제공** (커스텀 도메인인 경우)
- ✅ 도메인 구매 가이드
- ✅ Vercel에 도메인 추가 가이드
- ✅ DNS 레코드 설정 가이드
- ✅ SSL 인증서 자동 설정 확인

---

### 4. 공공데이터 API 설정 값 제공 시 (선택사항)

#### 제공 형식
```markdown
## 공공데이터 API (선택사항)
- API Key: abc123...
```

#### 자동 처리 작업

**4.1 API 클라이언트 수정**
- ✅ `src/utils/api.ts`에 공공데이터 API 함수 추가
- ✅ 병원 검색 API 호출 함수
- ✅ API 키 환경 변수 설정

**4.2 환경 변수 설정 가이드 제공**
- ✅ Vercel 환경 변수 설정 가이드
- ✅ `PUBLIC_DATA_API_KEY` 설정 방법

---

## 📝 생성될 파일 목록

### Firebase 설정 값 제공 시
1. `src/utils/firebase/config.ts` (신규)
2. `public/firebase-messaging-sw.js` (신규)
3. `src/utils/firebase/messaging.ts` (신규)
4. `src/components/MyPage.tsx` (수정)

### 소셜 로그인 설정 값 제공 시
1. `src/utils/auth/kakao.ts` (신규)
2. `src/utils/auth/google.ts` (신규)
3. `src/utils/auth/naver.ts` (신규, Naver 제공된 경우)
4. `src/components/AuthScreen.tsx` (수정)
5. `src/utils/api.ts` (수정)

### 도메인 정보 제공 시
1. `src/public/manifest.json` (수정)
2. `src/utils/auth/kakao.ts` (수정)
3. `src/utils/auth/google.ts` (수정)
4. `src/utils/auth/naver.ts` (수정, Naver 제공된 경우)

---

## ✅ 처리 완료 확인

### Firebase 설정 값 제공 후
- [ ] `src/utils/firebase/config.ts` 파일 생성 확인
- [ ] `public/firebase-messaging-sw.js` 파일 생성 확인
- [ ] `src/utils/firebase/messaging.ts` 파일 생성 확인
- [ ] `src/components/MyPage.tsx`에 FCM 토큰 등록 로직 추가 확인

### 소셜 로그인 설정 값 제공 후
- [ ] `src/utils/auth/kakao.ts` 파일 생성 확인
- [ ] `src/utils/auth/google.ts` 파일 생성 확인
- [ ] `src/components/AuthScreen.tsx`에 소셜 로그인 버튼 추가 확인

### 도메인 정보 제공 후
- [ ] `src/public/manifest.json` 업데이트 확인
- [ ] 소셜 로그인 Redirect URI 업데이트 확인

---

## 🎯 최종 목표

설정 값을 제공해주시면:
1. ✅ 모든 설정 파일 자동 생성
2. ✅ 모든 코드 자동 통합
3. ✅ 바로 배포 가능한 상태 완성
4. ✅ 출시 준비 완료!

---

## 📚 관련 문서

- `USER_ACTION_GUIDE.md` - 사용자 작업 가이드
- `SETUP_VALUES_TEMPLATE.md` - 설정 값 제공 템플릿
- `LAUNCH_READY_CHECKLIST.md` - 출시 준비 체크리스트

---

**마지막 업데이트**: 2024년 12월

