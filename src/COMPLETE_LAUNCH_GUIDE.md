# 🚀 Shifty 출시 준비 완전 가이드

## 📋 개요
이 문서는 Shifty 앱을 **바로 출시할 수 있도록** 사용자가 해야 할 모든 작업과 제공해야 할 모든 값을 정리한 완전한 가이드입니다.

---

## 🎯 빠른 시작

### 1단계: 작업 수행
**`USER_ACTION_GUIDE.md`** 파일을 열어서 Phase 1부터 순서대로 진행하세요.

### 2단계: 값 입력
**`SETUP_VALUES_TEMPLATE.md`** 파일에 모든 설정 값을 입력하세요.

### 3단계: 값 제공
입력한 템플릿을 제공해주시면 자동으로 처리되어 바로 출시할 수 있습니다!

---

## 📚 필수 문서

### ⭐ 가장 먼저 읽어야 할 문서

#### 1. `USER_ACTION_GUIDE.md` ⭐⭐⭐
**사용자가 해야 할 모든 작업을 단계별로 설명**

**포함 내용:**
- Phase 1: Supabase 데이터베이스 테이블 생성
- Phase 2: Firebase Cloud Messaging 설정
- Phase 3: Supabase Edge Function 환경 변수 설정
- Phase 4: 소셜 로그인 설정 (Kakao, Google, Naver)
- Phase 5: 공공데이터 API 설정 (선택사항)
- Phase 6: 배포 도메인 결정
- Phase 7: 설정 값 제공

**사용 시점**: 처음 시작할 때, 각 단계별 작업을 수행할 때

---

#### 2. `SETUP_VALUES_TEMPLATE.md` ⭐⭐⭐
**설정 값을 입력할 템플릿**

**포함 내용:**
- Firebase 설정 값 입력 필드
- 소셜 로그인 설정 값 입력 필드
- 공공데이터 API 설정 값 입력 필드 (선택사항)
- 배포 도메인 입력 필드
- 각 값의 위치 및 찾는 방법

**사용 시점**: 모든 설정 작업 완료 후, 값을 제공할 때

---

#### 3. `LAUNCH_READY_CHECKLIST.md` ⭐⭐
**출시 전 완료해야 할 모든 작업 체크리스트**

**포함 내용:**
- Phase별 체크리스트
- 확인 방법
- 최종 테스트 항목

**사용 시점**: 출시 직전, 모든 작업이 완료되었는지 확인할 때

---

## ✅ 사용자가 해야 할 작업

### Phase 1: Supabase 데이터베이스 테이블 생성 ⚠️ **필수**

**작업 내용:**
1. Supabase Dashboard 접속
2. SQL Editor → New Query
3. `src/SETUP_NOTIFICATION_TABLES.sql` 파일 내용 복사 & 붙여넣기
4. Run 버튼 클릭
5. `src/SETUP_ANALYTICS_TABLES.sql` 파일 내용 복사 & 붙여넣기
6. Run 버튼 클릭
7. 6개 테이블 생성 확인

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 1 참고

---

### Phase 2: Firebase Cloud Messaging 설정 ⚠️ **필수**

**작업 내용:**
1. Firebase Console에서 프로젝트 생성
2. 웹 앱 등록
3. Cloud Messaging API 활성화
4. 설정 값 수집 (6개):
   - API Key
   - Auth Domain
   - Project ID
   - Messaging Sender ID
   - App ID
   - Server Key (FCM)

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 2 참고

---

### Phase 3: Supabase Edge Function 환경 변수 설정 ⚠️ **필수**

**작업 내용:**
1. Supabase Dashboard → Edge Functions
2. Environment Variables 탭
3. `FCM_SERVER_KEY` 추가 (Phase 2에서 수집한 Server Key)

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 3 참고

---

### Phase 4: 소셜 로그인 설정 ⚠️ **필수**

**작업 내용:**

#### 4.1 Kakao
1. Kakao Developers에 애플리케이션 등록
2. REST API 키 수집
3. Web 플랫폼 등록
4. 카카오 로그인 활성화
5. Redirect URI 등록

#### 4.2 Google
1. Google Cloud Console에 프로젝트 생성
2. OAuth 동의 화면 설정
3. OAuth 클라이언트 ID 생성
4. 클라이언트 ID 및 보안 비밀 수집
5. Redirect URI 등록

#### 4.3 Naver (선택사항)
1. Naver Developers에 애플리케이션 등록
2. 클라이언트 ID 및 시크릿 수집
3. Callback URL 등록

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 4 참고

---

### Phase 5: 공공데이터 API 설정 (선택사항)

**작업 내용:**
1. 공공데이터포털 접속
2. API 신청
3. 인증키 (Decoding) 수집

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 5 참고

---

### Phase 6: 배포 도메인 결정

**작업 내용:**
1. Vercel 기본 도메인 사용 또는 커스텀 도메인 구매
2. 도메인 결정

**상세 가이드**: `USER_ACTION_GUIDE.md`의 Phase 6 참고

---

### Phase 7: 설정 값 제공

**작업 내용:**
1. `SETUP_VALUES_TEMPLATE.md` 파일 열기
2. 모든 설정 값 입력
3. 템플릿 제공

**상세 가이드**: `SETUP_VALUES_TEMPLATE.md` 참고

---

## 📝 제공해야 할 값

### Firebase 설정 값 (6개)
- API Key
- Auth Domain
- Project ID
- Messaging Sender ID
- App ID
- Server Key (FCM)

### 소셜 로그인 설정 값

#### Kakao (2개)
- Client ID (REST API 키)
- Redirect URI

#### Google (3개)
- Client ID
- Client Secret
- Redirect URI

#### Naver (3개, 선택사항)
- Client ID
- Client Secret
- Redirect URI

### 공공데이터 API 설정 값 (1개, 선택사항)
- API Key

### 배포 도메인 (1-2개)
- 도메인
- Admin 도메인 (선택사항)

---

## 📝 설정 값 제공 템플릿

**`src/SETUP_VALUES_TEMPLATE.md`** 파일을 열어서 다음 형식으로 값을 입력해주세요:

```markdown
# Shifty 설정 값

## Firebase
- API Key: [여기에 입력]
- Auth Domain: [여기에 입력]
- Project ID: [여기에 입력]
- Messaging Sender ID: [여기에 입력]
- App ID: [여기에 입력]
- Server Key (FCM): [여기에 입력]

## Supabase
- Project ID: rbjyragopwwuyfbnjoqk (이미 설정됨)
- Public Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (이미 설정됨)

## 소셜 로그인
### Kakao
- Client ID: [여기에 입력]
- Redirect URI: [여기에 입력]

### Google
- Client ID: [여기에 입력]
- Client Secret: [여기에 입력]
- Redirect URI: [여기에 입력]

### Naver (선택사항)
- Client ID: [여기에 입력]
- Client Secret: [여기에 입력]
- Redirect URI: [여기에 입력]

## 공공데이터 API (선택사항)
- API Key: [여기에 입력]

## 배포
- 도메인: [여기에 입력]
- Admin 도메인 (선택사항): [여기에 입력]
```

---

## 🔄 설정 값 제공 시 자동 처리 작업

### 1. Firebase 설정 값 제공 시

**자동 생성될 파일:**
- ✅ `src/utils/firebase/config.ts` - Firebase 설정
- ✅ `public/firebase-messaging-sw.js` - Service Worker
- ✅ `src/utils/firebase/messaging.ts` - FCM 토큰 관리

**자동 수정될 파일:**
- ✅ `src/components/MyPage.tsx` - FCM 토큰 등록 로직 추가

**제공될 가이드:**
- ✅ Supabase Edge Function 환경 변수 설정 확인

**상세 가이드**: `AUTO_PROCESSING_GUIDE.md`의 1번 참고

---

### 2. 소셜 로그인 설정 값 제공 시

**자동 생성될 파일:**
- ✅ `src/utils/auth/kakao.ts` - Kakao 로그인 유틸리티
- ✅ `src/utils/auth/google.ts` - Google 로그인 유틸리티
- ✅ `src/utils/auth/naver.ts` - Naver 로그인 유틸리티 (제공된 경우)

**자동 수정될 파일:**
- ✅ `src/components/AuthScreen.tsx` - 소셜 로그인 버튼 추가
- ✅ `src/utils/api.ts` - 소셜 로그인 API 함수 추가

**제공될 가이드:**
- ✅ Supabase Auth 설정 가이드
- ✅ 리디렉션 URI 설정 확인

**상세 가이드**: `AUTO_PROCESSING_GUIDE.md`의 2번 참고

---

### 3. 도메인 정보 제공 시

**자동 수정될 파일:**
- ✅ `src/public/manifest.json` - PWA 설정 업데이트
- ✅ `src/utils/auth/kakao.ts` - Redirect URI 업데이트
- ✅ `src/utils/auth/google.ts` - Redirect URI 업데이트
- ✅ `src/utils/auth/naver.ts` - Redirect URI 업데이트 (제공된 경우)

**제공될 가이드:**
- ✅ Vercel 배포 설정 가이드
- ✅ DNS 설정 가이드 (커스텀 도메인인 경우)
- ✅ 소셜 로그인 Redirect URI 업데이트 가이드

**상세 가이드**: `AUTO_PROCESSING_GUIDE.md`의 3번 참고

---

### 4. 공공데이터 API 설정 값 제공 시 (선택사항)

**자동 수정될 파일:**
- ✅ `src/utils/api.ts` - 공공데이터 API 함수 추가

**제공될 가이드:**
- ✅ Vercel 환경 변수 설정 가이드

**상세 가이드**: `AUTO_PROCESSING_GUIDE.md`의 4번 참고

---

## ✅ 필수 작업 체크리스트

### Phase 1: 데이터베이스
- [ ] `src/SETUP_NOTIFICATION_TABLES.sql` 실행
- [ ] `src/SETUP_ANALYTICS_TABLES.sql` 실행
- [ ] 6개 테이블 생성 확인

### Phase 2: Firebase
- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록
- [ ] Cloud Messaging API 활성화
- [ ] 설정 값 수집 (6개)

### Phase 3: Supabase 환경 변수
- [ ] `FCM_SERVER_KEY` 설정

### Phase 4: 소셜 로그인
- [ ] Kakao 애플리케이션 등록
- [ ] Kakao REST API 키 수집
- [ ] Kakao Redirect URI 등록
- [ ] Google OAuth 클라이언트 생성
- [ ] Google 클라이언트 ID/Secret 수집
- [ ] Google Redirect URI 등록

### Phase 5: 설정 값 제공
- [ ] `SETUP_VALUES_TEMPLATE.md`에 모든 값 입력
- [ ] 설정 값 제공

---

## 🎯 최종 목표

설정 값을 제공해주시면:
1. ✅ 모든 설정 파일 자동 생성
2. ✅ 모든 코드 자동 통합
3. ✅ 바로 배포 가능한 상태 완성
4. ✅ 출시 준비 완료!

---

## 📚 관련 문서

### 필수 읽기
1. **`USER_ACTION_GUIDE.md`** ⭐⭐⭐ - 사용자 작업 가이드
2. **`SETUP_VALUES_TEMPLATE.md`** ⭐⭐⭐ - 설정 값 입력 템플릿
3. **`LAUNCH_READY_CHECKLIST.md`** ⭐⭐ - 출시 준비 체크리스트

### 참고 문서
4. `AUTO_PROCESSING_GUIDE.md` - 자동 처리 작업 설명
5. `APP_LAUNCH_CHECKLIST.md` - 앱 스토어 등록 가이드
6. `FINAL_USER_GUIDE.md` - 최종 사용자 가이드
7. `START_HERE_USER.md` - 여기서 시작하세요
8. `INDEX.md` - 문서 인덱스

---

## 🆘 문제 해결

### SQL 실행 오류
→ `FIX_RLS_GUIDE.md` 참고

### Firebase 설정 값 찾기 어려움
→ `USER_ACTION_GUIDE.md`의 Phase 2.3 참고

### 소셜 로그인 설정 오류
→ `USER_ACTION_GUIDE.md`의 Phase 4 참고

---

## ✅ 시작하기

1. **`USER_ACTION_GUIDE.md`** 파일을 열어주세요
2. Phase 1부터 순서대로 진행하세요
3. 각 Phase 완료 후 체크리스트에 체크하세요
4. 모든 작업 완료 후 **`SETUP_VALUES_TEMPLATE.md`**에 값 입력
5. 설정 값 제공 후 자동 처리 완료 대기
6. **`LAUNCH_READY_CHECKLIST.md`**로 최종 확인
7. 배포 및 출시!

---

**마지막 업데이트**: 2024년 12월

