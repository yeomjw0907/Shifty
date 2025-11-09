# 🔧 사용자 설정 체크리스트

## 📋 개요
Shifty 앱을 출시하기 위해 **사용자가 직접 설정해야 하는 항목**들을 정리했습니다.

---

## 🔑 필수 설정 항목

### 1. Firebase Cloud Messaging (FCM) 설정 ⚠️ **필수**

#### 1.1 Firebase 프로젝트 생성
- [ ] Firebase Console (https://console.firebase.google.com) 접속
- [ ] 새 프로젝트 생성 또는 기존 프로젝트 선택
- [ ] 프로젝트 이름: "Shifty" (또는 원하는 이름)
- [ ] Google Analytics 활성화 (선택사항)

#### 1.2 웹 앱 등록
- [ ] Firebase 프로젝트 → 프로젝트 설정 → 일반 탭
- [ ] "앱 추가" → "웹" 선택
- [ ] 앱 닉네임: "Shifty Web"
- [ ] Firebase Hosting 설정 (선택사항)
- [ ] **Firebase SDK 설정 코드 복사** (아래 사용)

#### 1.3 Firebase 설정 값
다음 값들을 `src/utils/firebase/config.ts` 파일에 입력해야 합니다:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",           // ← 여기에 입력
  authDomain: "YOUR_PROJECT.firebaseapp.com",  // ← 여기에 입력
  projectId: "YOUR_PROJECT_ID",     // ← 여기에 입력
  messagingSenderId: "YOUR_SENDER_ID",  // ← 여기에 입력
  appId: "YOUR_APP_ID",              // ← 여기에 입력
};
```

**위치**: Firebase Console → 프로젝트 설정 → 일반 탭 → "앱" 섹션

#### 1.4 Cloud Messaging 서버 키
- [ ] Firebase Console → 프로젝트 설정 → Cloud Messaging 탭
- [ ] "Cloud Messaging API (V1)" 활성화
- [ ] "서버 키" 복사 (서버에서 푸시 알림 발송 시 사용)

**이 값은 서버 환경 변수에 저장해야 합니다:**
- Supabase Edge Function 환경 변수: `FCM_SERVER_KEY`

---

### 2. Supabase 설정 ⚠️ **필수**

#### 2.1 데이터베이스 테이블 생성
다음 SQL 파일들을 Supabase Dashboard에서 실행해야 합니다:

- [ ] `src/SETUP_NOTIFICATION_TABLES.sql` 실행
- [ ] `src/SETUP_ANALYTICS_TABLES.sql` 실행 (통계 기능용)

**실행 방법:**
1. Supabase Dashboard 접속
2. SQL Editor → New Query
3. 파일 내용 복사 & 붙여넣기
4. Run 버튼 클릭

#### 2.2 Edge Function 환경 변수 설정
Supabase Dashboard → Edge Functions → Environment Variables에서 다음 값 설정:

- [ ] `FCM_SERVER_KEY`: Firebase Cloud Messaging 서버 키 (1.4에서 복사한 값)

**설정 방법:**
1. Supabase Dashboard → Edge Functions
2. "Environment Variables" 탭
3. "Add new variable" 클릭
4. Key: `FCM_SERVER_KEY`, Value: (Firebase 서버 키)

---

### 3. 소셜 로그인 설정 ⚠️ **필수**

#### 3.1 Kakao Developers 설정
- [ ] Kakao Developers (https://developers.kakao.com) 접속
- [ ] 내 애플리케이션 → 애플리케이션 추가하기
- [ ] 앱 이름: "Shifty"
- [ ] **REST API 키** 복사
- [ ] 플랫폼 설정 → Web 플랫폼 등록
  - 사이트 도메인: `https://your-domain.com` (배포 후)
  - Redirect URI: `https://your-domain.com/auth/callback/kakao`
- [ ] 카카오 로그인 → 활성화
- [ ] Redirect URI 등록: `https://your-domain.com/auth/callback/kakao`

**설정 값:**
- `KAKAO_CLIENT_ID`: REST API 키
- `KAKAO_REDIRECT_URI`: `https://your-domain.com/auth/callback/kakao`

#### 3.2 Google OAuth 설정
- [ ] Google Cloud Console (https://console.cloud.google.com) 접속
- [ ] 프로젝트 생성 또는 선택
- [ ] API 및 서비스 → 사용자 인증 정보
- [ ] "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
- [ ] 애플리케이션 유형: "웹 애플리케이션"
- [ ] 승인된 리디렉션 URI: `https://your-domain.com/auth/callback/google`
- [ ] **클라이언트 ID** 및 **클라이언트 보안 비밀** 복사

**설정 값:**
- `GOOGLE_CLIENT_ID`: 클라이언트 ID
- `GOOGLE_CLIENT_SECRET`: 클라이언트 보안 비밀
- `GOOGLE_REDIRECT_URI`: `https://your-domain.com/auth/callback/google`

#### 3.3 Naver OAuth 설정 (선택사항)
- [ ] Naver Developers (https://developers.naver.com) 접속
- [ ] 애플리케이션 등록
- [ ] 서비스 URL: `https://your-domain.com`
- [ ] Callback URL: `https://your-domain.com/auth/callback/naver`
- [ ] **클라이언트 ID** 및 **클라이언트 시크릿** 복사

**설정 값:**
- `NAVER_CLIENT_ID`: 클라이언트 ID
- `NAVER_CLIENT_SECRET`: 클라이언트 시크릿
- `NAVER_REDIRECT_URI`: `https://your-domain.com/auth/callback/naver`

---

### 4. 병원 데이터 API 설정 (선택사항)

#### 4.1 공공데이터포털 API 키
- [ ] 공공데이터포털 (https://www.data.go.kr) 접속
- [ ] 회원가입 및 로그인
- [ ] "보건복지부_전국 병의원 및 약국 현황" API 신청
- [ ] **인증키 (Decoding)** 복사

**설정 값:**
- `PUBLIC_DATA_API_KEY`: 인증키

**참고**: 이미 `scripts/fetch-hospitals.js` 스크립트가 있으면 해당 스크립트에 직접 입력 가능

---

### 5. 배포 설정 ⚠️ **필수**

#### 5.1 Vercel 배포
- [ ] Vercel (https://vercel.com) 계정 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정:
  - `VITE_SUPABASE_URL`: `https://${projectId}.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: Supabase Public Anon Key
  - `VITE_FIREBASE_API_KEY`: Firebase API Key
  - `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID
  - `VITE_FIREBASE_APP_ID`: Firebase App ID

#### 5.2 도메인 연결 (선택사항)
- [ ] Vercel → 프로젝트 → Settings → Domains
- [ ] 커스텀 도메인 추가: `shifty.ai` (또는 원하는 도메인)
- [ ] DNS 설정 (도메인 제공업체에서)

---

### 6. 앱 스토어 등록 정보 준비 (출시 시)

#### 6.1 iOS App Store
- [ ] Apple Developer 계정 등록 ($99/년)
- [ ] 앱 이름, 설명, 키워드 작성
- [ ] 스크린샷 준비 (다양한 iPhone/iPad 크기)
- [ ] 앱 아이콘 (1024x1024px)
- [ ] 개인정보 처리방침 URL
- [ ] 이용약관 URL

#### 6.2 Google Play Store
- [ ] Google Play Console 계정 등록 ($25 일회성)
- [ ] 앱 이름, 설명 작성
- [ ] 스크린샷 준비 (휴대전화, 태블릿)
- [ ] 앱 아이콘 (512x512px)
- [ ] 개인정보 처리방침 URL
- [ ] 이용약관 URL

---

## 📝 설정 값 정리 템플릿

다음 템플릿을 복사하여 값을 입력한 후 제공해주세요:

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

## ✅ 체크리스트 요약

### 출시 전 필수
1. ✅ Firebase 프로젝트 생성 및 FCM 설정
2. ✅ Supabase 테이블 생성
3. ✅ 소셜 로그인 설정 (Kakao, Google)
4. ✅ Vercel 배포 및 환경 변수 설정

### 출시 시 필수
5. ✅ 앱 스토어 등록 정보 준비
6. ✅ 개인정보 처리방침 및 이용약관 작성

### 선택사항
7. ⬜ Naver 로그인 설정
8. ⬜ 공공데이터 API 설정
9. ⬜ 커스텀 도메인 연결

---

**마지막 업데이트**: 2024년 12월

