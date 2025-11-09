# 🎯 사용자 작업 가이드 - 출시 준비 완료

## 📋 개요
이 문서는 Shifty 앱을 출시하기 위해 **사용자가 직접 수행해야 하는 모든 작업**과 **제공해야 하는 모든 값**을 정리한 완전한 가이드입니다.

---

## ✅ Phase 1: Supabase 데이터베이스 테이블 생성

### 작업 내용
Supabase Dashboard에서 SQL 파일을 실행하여 필요한 테이블을 생성합니다.

### 실행할 파일
1. **`src/SETUP_NOTIFICATION_TABLES.sql`**
   - 알림 관련 테이블 생성
   - `notifications`, `notification_settings`, `fcm_tokens` 테이블

2. **`src/SETUP_ANALYTICS_TABLES.sql`**
   - 통계 및 팝업 관리 테이블 생성
   - `user_visits`, `admin_popups`, `popup_interactions` 테이블

### 실행 방법
1. Supabase Dashboard 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. `src/SETUP_NOTIFICATION_TABLES.sql` 파일 내용 전체 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭 (또는 `Ctrl + Enter`)
8. 성공 메시지 확인
9. 동일한 방법으로 `src/SETUP_ANALYTICS_TABLES.sql` 실행

### 확인 방법
SQL Editor에서 다음 쿼리 실행:
```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'notifications',
    'notification_settings',
    'fcm_tokens',
    'user_visits',
    'admin_popups',
    'popup_interactions'
  );
```

**6개 테이블이 모두 보이면 성공! ✅**

---

## ✅ Phase 2: Firebase Cloud Messaging 설정

### 작업 내용
Firebase 프로젝트를 생성하고 FCM을 설정하여 푸시 알림을 활성화합니다.

### Step 2.1: Firebase 프로젝트 생성
1. Firebase Console 접속 (https://console.firebase.google.com)
2. **프로젝트 추가** 클릭
3. 프로젝트 이름: **"Shifty"** (또는 원하는 이름)
4. Google Analytics 활성화 (선택사항, 추천)
5. 프로젝트 생성 완료

### Step 2.2: 웹 앱 등록
1. Firebase 프로젝트 → **프로젝트 설정** (톱니바퀴 아이콘)
2. **일반** 탭으로 이동
3. **내 앱** 섹션에서 **웹** 아이콘 (`</>`) 클릭
4. 앱 닉네임: **"Shifty Web"**
5. Firebase Hosting 설정: **체크하지 않음** (선택사항)
6. **앱 등록** 클릭

### Step 2.3: Firebase 설정 값 수집
Firebase Console → 프로젝트 설정 → 일반 탭에서 다음 값들을 복사:

1. **API Key**
   - 위치: "내 앱" 섹션 → "웹 앱" → "SDK 설정 및 구성"
   - 형식: `AIzaSy...` (긴 문자열)

2. **Auth Domain**
   - 위치: "내 앱" 섹션 → "웹 앱" → "SDK 설정 및 구성"
   - 형식: `{project-id}.firebaseapp.com`
   - 예시: `shifty-app.firebaseapp.com`

3. **Project ID**
   - 위치: 프로젝트 설정 → 일반 탭 상단
   - 형식: 영문 소문자, 하이픈 포함 가능
   - 예시: `shifty-app`

4. **Messaging Sender ID**
   - 위치: "내 앱" 섹션 → "웹 앱" → "SDK 설정 및 구성"
   - 형식: 숫자 (예: `123456789`)

5. **App ID**
   - 위치: "내 앱" 섹션 → "웹 앱" → "SDK 설정 및 구성"
   - 형식: `1:123456789:web:abc123def456`

### Step 2.4: Cloud Messaging API 활성화
1. Firebase Console → 프로젝트 설정 → **Cloud Messaging** 탭
2. **Cloud Messaging API (V1)** 섹션에서 **활성화** 클릭
3. **서버 키** 복사
   - 위치: "Cloud Messaging API (V1)" 섹션
   - 형식: `AAAA...` (긴 문자열)
   - ⚠️ **이 키는 서버에서만 사용하세요!**

### 제공할 값 (템플릿에 입력)
```markdown
## Firebase
- API Key: [여기에 입력]
- Auth Domain: [여기에 입력]
- Project ID: [여기에 입력]
- Messaging Sender ID: [여기에 입력]
- App ID: [여기에 입력]
- Server Key (FCM): [여기에 입력]
```

---

## ✅ Phase 3: Supabase Edge Function 환경 변수 설정

### 작업 내용
Firebase 서버 키를 Supabase Edge Function 환경 변수로 설정합니다.

### 실행 방법
1. Supabase Dashboard 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Edge Functions** 클릭
4. **Environment Variables** 탭 클릭
5. **Add new variable** 버튼 클릭
6. 다음 정보 입력:
   - **Key**: `FCM_SERVER_KEY`
   - **Value**: Phase 2.4에서 복사한 Firebase 서버 키
7. **Save** 클릭

### 확인 방법
Environment Variables 목록에 `FCM_SERVER_KEY`가 표시되면 성공! ✅

---

## ✅ Phase 4: 소셜 로그인 설정

### 4.1 Kakao Developers 설정

#### Step 4.1.1: 애플리케이션 등록
1. Kakao Developers 접속 (https://developers.kakao.com)
2. 로그인
3. **내 애플리케이션** → **애플리케이션 추가하기** 클릭
4. 앱 이름: **"Shifty"**
5. 사업자명: (선택사항)
6. **저장** 클릭

#### Step 4.1.2: REST API 키 확인
1. 내 애플리케이션 → **Shifty** 선택
2. **앱 키** 섹션에서 **REST API 키** 복사
   - 형식: `abc123def456...` (긴 문자열)
   - ⚠️ 이 키는 클라이언트에서 사용됩니다.

#### Step 4.1.3: 플랫폼 설정
1. **플랫폼** 메뉴 클릭
2. **Web 플랫폼 등록** 클릭
3. 사이트 도메인 입력:
   - 로컬 테스트: `http://localhost:3000`
   - 프로덕션: `https://your-domain.com` (배포 후 실제 도메인)
4. **저장** 클릭

#### Step 4.1.4: 카카오 로그인 활성화
1. **제품 설정** → **카카오 로그인** 클릭
2. **활성화 설정** → **ON**으로 변경
3. **Redirect URI 등록** 섹션에서 **URI 추가** 클릭
4. Redirect URI 입력:
   - 로컬: `http://localhost:3000/auth/callback/kakao`
   - 프로덕션: `https://your-domain.com/auth/callback/kakao`
5. **저장** 클릭

### 4.2 Google OAuth 설정

#### Step 4.2.1: 프로젝트 생성
1. Google Cloud Console 접속 (https://console.cloud.google.com)
2. 프로젝트 선택 또는 **새 프로젝트** 생성
3. 프로젝트 이름: **"Shifty"**

#### Step 4.2.2: OAuth 클라이언트 ID 생성
1. **API 및 서비스** → **사용자 인증 정보** 클릭
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 선택
3. 동의 화면 설정 (처음인 경우):
   - 사용자 유형: **외부** 선택
   - 앱 이름: **"Shifty"**
   - 사용자 지원 이메일: (본인 이메일)
   - 개발자 연락처 정보: (본인 이메일)
   - **저장 후 계속** 클릭
   - 범위: 기본값 유지, **저장 후 계속** 클릭
   - 테스트 사용자: (선택사항), **완료** 클릭

4. OAuth 클라이언트 ID 만들기:
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: **"Shifty Web Client"**
   - 승인된 자바스크립트 원본:
     - `http://localhost:3000` (로컬)
     - `https://your-domain.com` (프로덕션)
   - 승인된 리디렉션 URI:
     - `http://localhost:3000/auth/callback/google` (로컬)
     - `https://your-domain.com/auth/callback/google` (프로덕션)
   - **만들기** 클릭

5. **클라이언트 ID** 및 **클라이언트 보안 비밀** 복사
   - 팝업 창에 표시됨
   - ⚠️ 클라이언트 보안 비밀은 한 번만 표시되므로 반드시 복사!

### 4.3 Naver OAuth 설정 (선택사항)

#### Step 4.3.1: 애플리케이션 등록
1. Naver Developers 접속 (https://developers.naver.com)
2. 로그인
3. **애플리케이션** → **애플리케이션 등록** 클릭
4. 애플리케이션 이름: **"Shifty"**
5. 사용 API: **네이버 로그인** 선택
6. 로그인 오픈 API 서비스 환경:
   - 서비스 URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/auth/callback/naver`
7. **등록** 클릭

#### Step 4.3.2: 클라이언트 정보 확인
1. 애플리케이션 → **Shifty** 선택
2. **클라이언트 ID** 및 **클라이언트 시크릿** 복사

### 제공할 값 (템플릿에 입력)
```markdown
## 소셜 로그인
### Kakao
- Client ID: [REST API 키 입력]
- Redirect URI: [로컬: http://localhost:3000/auth/callback/kakao, 프로덕션: https://your-domain.com/auth/callback/kakao]

### Google
- Client ID: [클라이언트 ID 입력]
- Client Secret: [클라이언트 보안 비밀 입력]
- Redirect URI: [로컬: http://localhost:3000/auth/callback/google, 프로덕션: https://your-domain.com/auth/callback/google]

### Naver (선택사항)
- Client ID: [클라이언트 ID 입력]
- Client Secret: [클라이언트 시크릿 입력]
- Redirect URI: [https://your-domain.com/auth/callback/naver]
```

---

## ✅ Phase 5: 공공데이터 API 설정 (선택사항)

### 작업 내용
병원 검색 기능을 강화하기 위해 공공데이터포털 API를 설정합니다.

### 실행 방법
1. 공공데이터포털 접속 (https://www.data.go.kr)
2. 회원가입 및 로그인
3. 검색: **"보건복지부_전국 병의원 및 약국 현황"**
4. API 신청
5. 승인 대기 (보통 즉시 또는 1-2일)
6. 승인 후 **인증키 (Decoding)** 복사

### 제공할 값 (템플릿에 입력)
```markdown
## 공공데이터 API (선택사항)
- API Key: [인증키 (Decoding) 입력]
```

---

## ✅ Phase 6: 배포 도메인 결정

### 작업 내용
프로덕션 배포에 사용할 도메인을 결정합니다.

### 옵션
1. **Vercel 기본 도메인 사용**
   - 예: `shifty.vercel.app`
   - 무료, 즉시 사용 가능

2. **커스텀 도메인 사용**
   - 예: `shifty.ai`, `shifty.app`
   - 도메인 구매 필요
   - DNS 설정 필요

### 제공할 값 (템플릿에 입력)
```markdown
## 배포
- 도메인: [예: shifty.ai 또는 shifty.vercel.app]
- Admin 도메인 (선택사항): [예: admin.shifty.ai]
```

---

## 📝 Phase 7: 설정 값 제공

### 제공 형식
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
- Project ID: rbjyragopwwuyfbnjoqk (이미 설정됨)
- Public Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (이미 설정됨)

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

## 🔄 제공 후 자동 처리 작업

설정 값을 제공해주시면 다음 작업들이 자동으로 수행됩니다:

### 1. Firebase 설정 값 제공 시
- ✅ `src/utils/firebase/config.ts` 파일 생성
- ✅ `public/firebase-messaging-sw.js` 파일 생성 (Service Worker)
- ✅ `src/utils/firebase/messaging.ts` 파일 생성 (FCM 토큰 관리)
- ✅ `src/components/MyPage.tsx`에 FCM 토큰 등록 로직 추가
- ✅ Supabase Edge Function 환경 변수 설정 가이드 제공

### 2. 소셜 로그인 설정 값 제공 시
- ✅ `src/utils/auth/kakao.ts` 파일 생성
- ✅ `src/utils/auth/google.ts` 파일 생성
- ✅ `src/components/AuthScreen.tsx`에 소셜 로그인 버튼 추가
- ✅ Supabase Auth 설정 가이드 제공
- ✅ 리디렉션 URI 설정 확인

### 3. 도메인 정보 제공 시
- ✅ `src/public/manifest.json` 업데이트
- ✅ 소셜 로그인 Redirect URI 업데이트
- ✅ Vercel 배포 설정 가이드 제공
- ✅ DNS 설정 가이드 제공 (커스텀 도메인인 경우)

---

## ✅ 체크리스트

### 필수 작업 (출시 전)
- [ ] Phase 1: Supabase 데이터베이스 테이블 생성
- [ ] Phase 2: Firebase Cloud Messaging 설정
- [ ] Phase 3: Supabase Edge Function 환경 변수 설정
- [ ] Phase 4: 소셜 로그인 설정 (Kakao, Google)
- [ ] Phase 6: 배포 도메인 결정
- [ ] Phase 7: 설정 값 제공

### 선택 작업
- [ ] Phase 4.3: Naver 로그인 설정
- [ ] Phase 5: 공공데이터 API 설정

---

## 📚 관련 문서

- `USER_SETUP_CHECKLIST.md` - 상세한 사용자 작업 체크리스트
- `SETUP_VALUES_GUIDE.md` - 설정 값 제공 시 자동 처리 작업
- `COMPLETE_SETUP_GUIDE.md` - 완전한 설정 가이드
- `APP_LAUNCH_CHECKLIST.md` - 앱 출시 체크리스트

---

**마지막 업데이트**: 2024년 12월

