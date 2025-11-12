# ✅ Shifty - 내가 해야 할 작업 체크리스트

## 🎯 우선순위별 작업 목록

---

## 🔴 필수 작업 (앱 사용을 위해 반드시 필요)

### 1단계: 데이터베이스 테이블 생성 ⚠️ **가장 먼저!**

**위치**: Supabase Dashboard → SQL Editor

**실행할 파일들** (순서대로):

1. **`src/SETUP_TABLES.sql`** ⭐ 필수
   - 기본 테이블 생성 (users, teams, team_members, tasks, privacy_consents)
   - 실행 방법:
     - Supabase Dashboard 접속
     - SQL Editor → New Query
     - 파일 내용 전체 복사 & 붙여넣기
     - Run 버튼 클릭

2. **`src/ENABLE_RLS.sql`** ⭐ 필수
   - 보안 정책 설정 (RLS 활성화)
   - 위와 동일한 방법으로 실행

3. **`src/SETUP_NOTIFICATION_TABLES.sql`** (알림 기능용)
   - notifications, notification_settings, fcm_tokens 테이블

4. **`src/SETUP_ANALYTICS_TABLES.sql`** (통계 기능용)
   - user_visits, admin_popups, popup_interactions 테이블

5. **`src/SETUP_HOSPITALS_TABLE.sql`** (병원 검색용)
   - hospitals 테이블

**확인 방법**:
```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

### 2단계: Firebase 설정 (푸시 알림용)

**위치**: Firebase Console (https://console.firebase.google.com)

**해야 할 일**:

1. ✅ Firebase 프로젝트 생성
   - 프로젝트 이름: "Shifty"
   - Google Analytics 활성화 (선택사항)

2. ✅ 웹 앱 등록
   - 프로젝트 설정 → 일반 탭 → 웹 앱 추가
   - 앱 닉네임: "Shifty Web"

3. ✅ Cloud Messaging API 활성화
   - 프로젝트 설정 → Cloud Messaging 탭
   - "Cloud Messaging API (V1)" 활성화
   - **서버 키 복사** (중요!)

4. ✅ 설정 값 수집
   - API Key
   - Auth Domain
   - Project ID
   - Messaging Sender ID
   - App ID
   - Server Key (FCM)

**수집한 값은 아래 템플릿에 입력하세요**

---

### 3단계: Supabase 환경 변수 설정

**위치**: Supabase Dashboard → Edge Functions → Environment Variables

**해야 할 일**:
1. "Add new variable" 클릭
2. Key: `FCM_SERVER_KEY`
3. Value: Firebase에서 복사한 서버 키
4. Save 클릭

---

### 4단계: 소셜 로그인 설정 (선택사항, 하지만 추천)

#### 4-1. Kakao 로그인

**위치**: Kakao Developers (https://developers.kakao.com)

**해야 할 일**:
1. 애플리케이션 등록
   - 앱 이름: "Shifty"
2. REST API 키 복사
3. Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (로컬) 또는 실제 도메인
4. 카카오 로그인 활성화
   - Redirect URI 등록: `http://localhost:3000/auth/callback/kakao`

#### 4-2. Google 로그인

**위치**: Google Cloud Console (https://console.cloud.google.com)

**해야 할 일**:
1. 프로젝트 생성 (또는 기존 프로젝트 선택)
2. OAuth 동의 화면 설정
3. OAuth 클라이언트 ID 생성
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `http://localhost:3000/auth/callback/google`
4. 클라이언트 ID와 클라이언트 보안 비밀 복사

---

## 🟡 선택 작업 (나중에 해도 됨)

### 5단계: 공공데이터 API 설정 (병원 검색 강화용)

**위치**: 공공데이터포털 (https://www.data.go.kr)

**해야 할 일**:
1. 회원가입 및 로그인
2. "보건복지부_전국 병의원 및 약국 현황" API 신청
3. 승인 대기 (1-2일)
4. 인증키 복사

---

## 📝 설정 값 제공 템플릿

아래 템플릿을 복사해서 값을 입력한 후 제공해주세요:

```markdown
# Shifty 설정 값

## Firebase
- API Key: 
- Auth Domain: 
- Project ID: 
- Messaging Sender ID: 
- App ID: 
- Server Key (FCM): 

## 소셜 로그인
### Kakao
- Client ID: 
- Redirect URI: 

### Google
- Client ID: 
- Client Secret: 
- Redirect URI: 

## 공공데이터 API (선택사항)
- API Key: 

## 배포
- 도메인: (예: shifty.vercel.app 또는 커스텀 도메인)
```

---

## ✅ 체크리스트

### 필수 작업
- [ ] 1단계: `SETUP_TABLES.sql` 실행
- [ ] 1단계: `ENABLE_RLS.sql` 실행
- [ ] 1단계: `SETUP_NOTIFICATION_TABLES.sql` 실행
- [ ] 1단계: `SETUP_ANALYTICS_TABLES.sql` 실행
- [ ] 1단계: `SETUP_HOSPITALS_TABLE.sql` 실행
- [ ] 2단계: Firebase 프로젝트 생성 및 설정
- [ ] 3단계: Supabase 환경 변수 설정 (FCM_SERVER_KEY)
- [ ] 4단계: 소셜 로그인 설정 (Kakao, Google)
- [ ] 설정 값 템플릿 작성 및 제공

### 선택 작업
- [ ] 5단계: 공공데이터 API 설정

---

## 🚀 다음 단계

1. **1단계부터 순서대로 진행**하세요
2. **설정 값 템플릿**을 작성해서 제공해주시면
3. **자동으로 처리**해드립니다:
   - Firebase 설정 파일 생성
   - 소셜 로그인 설정 파일 생성
   - 환경 변수 설정 가이드 제공

---

## 📚 참고 문서

- `src/USER_ACTION_GUIDE.md` - 상세한 작업 가이드
- `src/SETUP_VALUES_TEMPLATE.md` - 설정 값 템플릿
- `src/START_HERE.md` - 빠른 시작 가이드

---

**마지막 업데이트**: 2024년 12월

