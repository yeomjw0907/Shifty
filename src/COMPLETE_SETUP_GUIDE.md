# 🚀 Shifty 완전 설정 가이드

## 📋 개요
이 문서는 Shifty 앱의 **모든 설정 작업**을 완료하기 위한 종합 가이드입니다.

---

## ✅ 자동 완료된 작업

다음 작업들은 이미 완료되었습니다:

### 1. 데이터베이스 설계
- ✅ `notifications` 테이블 (알림 기록)
- ✅ `notification_settings` 테이블 (알림 설정)
- ✅ `fcm_tokens` 테이블 (FCM 토큰 저장)
- ✅ `user_visits` 테이블 (방문 기록)
- ✅ `admin_popups` 테이블 (팝업 관리)
- ✅ `popup_interactions` 테이블 (팝업 상호작용)
- ✅ `user_sessions` 테이블 (사용자 세션)

### 2. 서버 API 구현
- ✅ 알림 목록 조회 (`GET /notifications`)
- ✅ 알림 읽음 처리 (`PATCH /notifications/:id/read`)
- ✅ 알림 설정 조회/업데이트 (`GET/PATCH /notification-settings`)
- ✅ FCM 토큰 등록 (`POST /fcm-tokens`)
- ✅ 관리자 알림 발송 (`POST /admin/notifications/send`)
- ✅ 통계 API (전체, 병원별, 커뮤니티)
- ✅ 팝업 관리 API (CRUD)

### 3. 프론트엔드 구현
- ✅ 마이페이지 알람 설정 UI
- ✅ 알림 트리거 로직 (팀 공지, 커뮤니티 공지)
- ✅ 관리자 알림 발송 기능

---

## 🔧 사용자가 해야 할 작업

### Step 1: Supabase 데이터베이스 테이블 생성 ⚠️ **필수**

다음 SQL 파일들을 Supabase Dashboard에서 실행해야 합니다:

1. **`src/SETUP_NOTIFICATION_TABLES.sql`**
   - 알림 관련 테이블 생성
   - 실행 위치: Supabase Dashboard → SQL Editor

2. **`src/SETUP_ANALYTICS_TABLES.sql`**
   - 통계 및 팝업 관리 테이블 생성
   - 실행 위치: Supabase Dashboard → SQL Editor

**실행 방법:**
1. Supabase Dashboard 접속
2. SQL Editor → New Query
3. 파일 내용 복사 & 붙여넣기
4. Run 버튼 클릭
5. 4개 테이블이 생성되었는지 확인

---

### Step 2: Firebase Cloud Messaging 설정 ⚠️ **필수**

#### 2.1 Firebase 프로젝트 생성
1. Firebase Console (https://console.firebase.google.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: "Shifty"
4. Google Analytics 활성화 (선택사항)

#### 2.2 웹 앱 등록
1. Firebase 프로젝트 → 프로젝트 설정 → 일반 탭
2. "앱 추가" → "웹" 선택
3. 앱 닉네임: "Shifty Web"
4. **Firebase SDK 설정 코드 복사**

#### 2.3 Firebase 설정 값 수집
다음 값들을 수집해야 합니다:

- **API Key**: Firebase Console → 프로젝트 설정 → 일반 탭
- **Auth Domain**: `{project-id}.firebaseapp.com`
- **Project ID**: Firebase Console → 프로젝트 설정 → 일반 탭
- **Messaging Sender ID**: Firebase Console → 프로젝트 설정 → 일반 탭
- **App ID**: Firebase Console → 프로젝트 설정 → 일반 탭
- **Server Key (FCM)**: Firebase Console → 프로젝트 설정 → Cloud Messaging 탭

#### 2.4 Cloud Messaging API 활성화
1. Firebase Console → 프로젝트 설정 → Cloud Messaging 탭
2. "Cloud Messaging API (V1)" 활성화
3. "서버 키" 복사

---

### Step 3: Supabase Edge Function 환경 변수 설정 ⚠️ **필수**

1. Supabase Dashboard → Edge Functions
2. "Environment Variables" 탭
3. "Add new variable" 클릭
4. 다음 변수 추가:

```
Key: FCM_SERVER_KEY
Value: (Firebase에서 복사한 서버 키)
```

---

### Step 4: 소셜 로그인 설정 ⚠️ **필수**

#### 4.1 Kakao Developers
1. Kakao Developers (https://developers.kakao.com) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름: "Shifty"
4. **REST API 키** 복사
5. 플랫폼 설정 → Web 플랫폼 등록
   - 사이트 도메인: `https://your-domain.com` (배포 후)
   - Redirect URI: `https://your-domain.com/auth/callback/kakao`
6. 카카오 로그인 → 활성화
7. Redirect URI 등록

**필요한 값:**
- `KAKAO_CLIENT_ID`: REST API 키
- `KAKAO_REDIRECT_URI`: `https://your-domain.com/auth/callback/kakao`

#### 4.2 Google OAuth
1. Google Cloud Console (https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 → 사용자 인증 정보
4. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
5. 애플리케이션 유형: "웹 애플리케이션"
6. 승인된 리디렉션 URI: `https://your-domain.com/auth/callback/google`
7. **클라이언트 ID** 및 **클라이언트 보안 비밀** 복사

**필요한 값:**
- `GOOGLE_CLIENT_ID`: 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: 클라이언트 보안 비밀
- `GOOGLE_REDIRECT_URI`: `https://your-domain.com/auth/callback/google`

#### 4.3 Naver OAuth (선택사항)
1. Naver Developers (https://developers.naver.com) 접속
2. 애플리케이션 등록
3. 서비스 URL: `https://your-domain.com`
4. Callback URL: `https://your-domain.com/auth/callback/naver`
5. **클라이언트 ID** 및 **클라이언트 시크릿** 복사

**필요한 값:**
- `NAVER_CLIENT_ID`: 클라이언트 ID
- `NAVER_CLIENT_SECRET`: 클라이언트 시크릿
- `NAVER_REDIRECT_URI`: `https://your-domain.com/auth/callback/naver`

---

### Step 5: 설정 값 제공

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
```

---

## 🔄 설정 값 제공 시 자동 처리 작업

### 1. Firebase 설정 값 제공 시

**자동 처리:**
1. ✅ `src/utils/firebase/config.ts` 파일 생성
2. ✅ `public/firebase-messaging-sw.js` 파일 생성 (Service Worker)
3. ✅ `src/utils/firebase/messaging.ts` 파일 생성 (FCM 토큰 관리)
4. ✅ `src/components/MyPage.tsx`에 FCM 토큰 등록 로직 추가
5. ✅ Supabase Edge Function 환경 변수 설정 가이드 제공

**생성될 파일:**
- `src/utils/firebase/config.ts`
- `public/firebase-messaging-sw.js`
- `src/utils/firebase/messaging.ts`

---

### 2. 소셜 로그인 설정 값 제공 시

**자동 처리:**
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

### 3. 도메인 정보 제공 시

**자동 처리:**
1. ✅ `src/public/manifest.json`에서 PWA 설정 업데이트
2. ✅ 소셜 로그인 Redirect URI 업데이트
3. ✅ Vercel 배포 설정 가이드 제공
4. ✅ DNS 설정 가이드 제공

**수정될 파일:**
- `src/public/manifest.json`
- `vite.config.ts` (필요시)

---

## 📝 체크리스트

### 출시 전 필수
- [ ] Supabase 데이터베이스 테이블 생성 (`SETUP_NOTIFICATION_TABLES.sql`, `SETUP_ANALYTICS_TABLES.sql`)
- [ ] Firebase 프로젝트 생성 및 FCM 설정
- [ ] Supabase Edge Function 환경 변수 설정 (`FCM_SERVER_KEY`)
- [ ] 소셜 로그인 설정 (Kakao, Google)
- [ ] 설정 값 제공 (위 템플릿 사용)

### 출시 시 필수
- [ ] 앱 스토어 등록 정보 준비
- [ ] 개인정보 처리방침 및 이용약관 작성
- [ ] 스크린샷 준비
- [ ] 앱 아이콘 준비

### 선택사항
- [ ] Naver 로그인 설정
- [ ] 공공데이터 API 설정
- [ ] 커스텀 도메인 연결

---

## 🎯 다음 단계

1. **Supabase 테이블 생성** (Step 1)
2. **Firebase 설정** (Step 2)
3. **Supabase 환경 변수 설정** (Step 3)
4. **소셜 로그인 설정** (Step 4)
5. **설정 값 제공** (Step 5) → 자동 처리 시작

---

**마지막 업데이트**: 2024년 12월

