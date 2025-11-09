# 필요한 데이터 및 설정 체크리스트

## 📋 개요
Shifty 프로젝트를 배포하고 운영하기 위해 필요한 모든 외부 데이터, API 키, 설정값을 정리한 문서입니다.

**아래 항목들을 채워서 전달해주시면 설정을 완료하겠습니다.**

---

## 1. 🔐 Supabase 설정

### 1.1 클라이언트 설정 (이미 설정됨 ✅)
- [x] **Supabase Project ID**: `rbjyragopwwuyfbnjoqk` ✅
- [x] **Supabase Public Anon Key**: 설정됨 ✅
- 위치: `src/utils/supabase/info.tsx`

### 1.2 Edge Functions 환경변수 (필요)
다음 값들을 Supabase Dashboard → Edge Functions → Settings → Secrets에 추가해야 합니다:

- [ ] **SUPABASE_URL**
  ```
  값: https://rbjyragopwwuyfbnjoqk.supabase.co
  ```

- [ ] **SUPABASE_SERVICE_ROLE_KEY**
  ```
  값: [Supabase Dashboard → Settings → API → service_role secret 키]
  ```
  ⚠️ **주의**: 절대 클라이언트에 노출되면 안 됨!

---

## 2. 🔑 소셜 로그인 설정

### 2.1 카카오톡 로그인
- [ ] **카카오 개발자 센터**: https://developers.kakao.com
  - [ ] 계정 가입 완료
  - [ ] 애플리케이션 등록 완료

- [ ] **카카오 앱 정보**
  ```
  REST API 키 (Client ID): [여기에 입력]
  Client Secret: [여기에 입력]
  ```

- [ ] **Redirect URI 설정**
  ```
  https://rbjyragopwwuyfbnjoqk.supabase.co/auth/v1/callback
  ```
  - 카카오 개발자 센터 → 내 애플리케이션 → 제품 설정 → 카카오 로그인 → Redirect URI 등록

- [ ] **Supabase 설정**
  - Supabase Dashboard → Authentication → Providers → Kakao
  - Client ID: [위의 REST API 키]
  - Client Secret: [위의 Client Secret]
  - Enable 토글: ON

---

### 2.2 구글 로그인
- [ ] **Google Cloud Console**: https://console.cloud.google.com
  - [ ] 프로젝트 생성 완료
  - [ ] OAuth 동의 화면 설정 완료

- [ ] **구글 OAuth 2.0 클라이언트**
  ```
  Client ID: [여기에 입력]
  Client Secret: [여기에 입력]
  ```

- [ ] **Authorized Redirect URIs**
  ```
  https://rbjyragopwwuyfbnjoqk.supabase.co/auth/v1/callback
  ```
  - Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs에 추가

- [ ] **Supabase 설정**
  - Supabase Dashboard → Authentication → Providers → Google
  - Client ID: [위의 Client ID]
  - Client Secret: [위의 Client Secret]
  - Enable 토글: ON

---

### 2.3 네이버 로그인
- [ ] **네이버 개발자 센터**: https://developers.naver.com
  - [ ] 계정 가입 완료
  - [ ] 애플리케이션 등록 완료

- [ ] **네이버 앱 정보**
  ```
  Client ID: [여기에 입력]
  Client Secret: [여기에 입력]
  ```

- [ ] **서비스 URL 및 Callback URL**
  ```
  서비스 URL: [프로덕션 도메인, 예: https://shifty.app]
  Callback URL: https://rbjyragopwwuyfbnjoqk.supabase.co/auth/v1/callback
  ```

- [ ] **Supabase 설정**
  - Supabase Dashboard → Authentication → Providers → Naver
  - Client ID: [위의 Client ID]
  - Client Secret: [위의 Client Secret]
  - Enable 토글: ON

---

## 3. 🏥 병원 데이터 API

### 3.1 공공데이터포털 API
- [ ] **공공데이터포털**: https://www.data.go.kr
  - [ ] 계정 가입 완료
  - [ ] 로그인 완료

- [ ] **병원정보서비스 API 인증키**
  ```
  SERVICE_KEY: [여기에 입력]
  ```
  - 공공데이터포털 → "병원정보서비스" 검색 → 인증키 발급
  - **주의**: URL Decoding된 키 사용 (일반 인증키)

- [ ] **스크립트 설정**
  - 파일: `scripts/fetch-hospitals.js`
  - `const SERVICE_KEY = '[위의 인증키]';` 로 변경

- [ ] **Supabase 설정** (스크립트 실행용)
  ```
  SUPABASE_URL: https://rbjyragopwwuyfbnjoqk.supabase.co
  SUPABASE_ANON_KEY: [Supabase Public Anon Key]
  ```
  - 또는 `scripts/fetch-hospitals.js` 파일에 직접 입력

---

## 4. 🔒 관리자 계정 설정

### 4.1 관리자 이메일
- [ ] **관리자 이메일 목록**
  ```
  관리자 이메일 1: [여기에 입력]
  관리자 이메일 2: [여기에 입력]
  관리자 이메일 3: [여기에 입력]
  ```
  - 위치: `src/supabase/functions/server/index.tsx`의 `ADMIN_EMAILS` 배열
  - 현재: `["admin@shifty.app", "yeomjw0907@onecation.co.kr", "yeomjw0907@naver.com"]`
  - **필요 작업**: 실제 관리자 이메일로 변경

---

## 5. 🌐 배포 설정

### 5.1 Vercel 배포 (프론트엔드)
- [ ] **Vercel 계정**: https://vercel.com
  - [ ] 계정 가입 완료

- [ ] **환경 변수 설정**
  - Vercel Dashboard → Project → Settings → Environment Variables
  ```
  VITE_SUPABASE_URL: https://rbjyragopwwuyfbnjoqk.supabase.co
  VITE_SUPABASE_ANON_KEY: [Supabase Public Anon Key]
  ```

- [ ] **도메인 설정** (선택사항)
  ```
  커스텀 도메인: [예: shifty.app]
  ```

---

### 5.2 Supabase Edge Functions 배포
- [ ] **Supabase CLI 설치**
  ```bash
  npm install -g supabase
  ```

- [ ] **Supabase 로그인**
  ```bash
  supabase login
  ```

- [ ] **프로젝트 링크**
  ```bash
  supabase link --project-ref rbjyragopwwuyfbnjoqk
  ```

- [ ] **환경 변수 설정**
  - Supabase Dashboard → Edge Functions → Settings → Secrets
  ```
  SUPABASE_URL: https://rbjyragopwwuyfbnjoqk.supabase.co
  SUPABASE_SERVICE_ROLE_KEY: [Supabase Service Role Key]
  ```

- [ ] **Edge Functions 배포**
  ```bash
  supabase functions deploy server
  ```

---

## 6. 📊 데이터베이스 설정

### 6.1 테이블 생성 (Supabase Dashboard → SQL Editor)
다음 SQL 파일들을 순서대로 실행:

- [ ] **기본 테이블**
  - `src/SETUP_TABLES.sql` 실행
  - 테이블: `users`, `teams`, `team_members`, `tasks`, `privacy_consents`

- [ ] **병원 테이블**
  - `src/SETUP_HOSPITALS_TABLE.sql` 실행
  - 테이블: `hospitals`

- [ ] **커뮤니티 테이블**
  - `src/SETUP_COMMUNITY_TABLES.sql` 실행
  - 테이블: `hospital_communities`, `community_posts`, `community_comments`, `meal_menus`, `hospital_official_info`

- [ ] **관리자 테이블**
  - `src/SETUP_ADMIN_TABLES.sql` 실행
  - 테이블: `hospital_admins`, `community_reports`, `hospital_settings`

- [ ] **RLS 정책 설정**
  - `src/ENABLE_RLS.sql` 실행
  - Row Level Security 활성화

---

### 6.2 Storage Bucket 생성
- [ ] **프로필 이미지 버킷**
  - Supabase Dashboard → Storage → Create Bucket
  ```
  버킷 이름: shifty-avatars
  Public bucket: Yes
  ```

---

## 7. 📝 값 입력 템플릿

아래 템플릿을 복사해서 값들을 채워서 전달해주세요:

```
=== Supabase 설정 ===
[이미 설정됨] Project ID: rbjyragopwwuyfbnjoqk
[이미 설정됨] Public Anon Key: (설정됨)
[필요] Service Role Key: [여기에 입력]

=== 카카오 로그인 ===
REST API 키 (Client ID): [여기에 입력]
Client Secret: [여기에 입력]

=== 구글 로그인 ===
Client ID: [여기에 입력]
Client Secret: [여기에 입력]

=== 네이버 로그인 ===
Client ID: [여기에 입력]
Client Secret: [여기에 입력]

=== 공공데이터포털 API ===
SERVICE_KEY: [여기에 입력]

=== 관리자 이메일 ===
관리자 이메일 1: [여기에 입력]
관리자 이메일 2: [여기에 입력]
관리자 이메일 3: [여기에 입력]

=== 배포 설정 ===
Vercel 도메인 (선택사항): [여기에 입력]
커스텀 도메인 (선택사항): [여기에 입력]
```

---

## 8. ✅ 설정 완료 체크리스트

### 필수 항목
- [x] Supabase Project ID ✅ (이미 설정됨)
- [x] Supabase Public Anon Key ✅ (이미 설정됨)
- [ ] Supabase Service Role Key ⚠️ (환경변수로 설정 필요)
- [ ] Supabase URL (Edge Functions용) ⚠️ (환경변수로 설정 필요)
- [ ] 데이터베이스 테이블 생성
- [ ] RLS 정책 설정
- [ ] Storage Bucket 생성
- [ ] 카카오 로그인 설정
- [ ] 구글 로그인 설정
- [ ] 네이버 로그인 설정
- [ ] 공공데이터포털 API 인증키
- [ ] 관리자 이메일 설정
- [ ] Vercel 배포 설정
- [ ] Edge Functions 배포

### 선택 항목
- [ ] 커스텀 도메인
- [ ] SMTP 설정
- [ ] PWA 아이콘 및 매니페스트
- [ ] Sentry 에러 추적
- [ ] Google Analytics

---

## 9. 📞 설정 방법 가이드

### Supabase Service Role Key 확인 방법
1. Supabase Dashboard 접속
2. Settings → API
3. `service_role` `secret` 키 복사
4. Edge Functions → Settings → Secrets에 추가

### 카카오 로그인 설정 방법
1. https://developers.kakao.com 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 설정 → 플랫폼 → Web 플랫폼 등록
4. 제품 설정 → 카카오 로그인 → Redirect URI 등록
5. REST API 키와 Client Secret 확인
6. Supabase Dashboard → Authentication → Providers → Kakao에 입력

### 구글 로그인 설정 방법
1. https://console.cloud.google.com 접속
2. 프로젝트 생성
3. APIs & Services → Credentials → Create OAuth Client ID
4. Authorized redirect URIs 추가
5. Client ID와 Client Secret 확인
6. Supabase Dashboard → Authentication → Providers → Google에 입력

### 네이버 로그인 설정 방법
1. https://developers.naver.com 접속
2. 애플리케이션 등록
3. 서비스 URL 및 Callback URL 설정
4. Client ID와 Client Secret 확인
5. Supabase Dashboard → Authentication → Providers → Naver에 입력

### 공공데이터포털 API 인증키 발급 방법
1. https://www.data.go.kr 접속
2. 회원가입 및 로그인
3. "병원정보서비스" 검색
4. 활용신청 → 인증키 발급
5. 일반 인증키 (Decoding) 사용

---

## 10. 🚀 빠른 설정 순서

1. **Supabase Edge Functions 환경변수 설정**
   - Service Role Key 추가

2. **소셜 로그인 설정** (선택사항)
   - 카카오/구글/네이버 중 원하는 것 설정

3. **데이터베이스 테이블 생성**
   - SQL 파일들 순서대로 실행

4. **병원 데이터 수집** (선택사항)
   - 공공데이터포털 API 인증키 발급
   - 스크립트 실행

5. **관리자 이메일 설정**
   - `src/supabase/functions/server/index.tsx` 수정

6. **배포**
   - Vercel 배포
   - Edge Functions 배포

---

**마지막 업데이트**: 2024년 12월
