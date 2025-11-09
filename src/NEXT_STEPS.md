# 🎯 다음 단계 가이드

## ✅ 완료된 작업

1. ✅ `SETUP_HOSPITALS_TABLE.sql` - hospitals 테이블 생성
2. ✅ `SETUP_ANALYTICS_TABLES.sql` - Analytics 관련 테이블 생성
3. ✅ `SETUP_NOTIFICATION_TABLES.sql` - Notification 관련 테이블 생성

---

## 📋 다음에 실행할 SQL 파일들

### 1. 기본 테이블 생성 (필수) ⚠️

**파일:** `src/SETUP_TABLES.sql`

**생성되는 테이블:**
- `users` - 사용자 정보
- `teams` - 팀 정보
- `team_members` - 팀 멤버 정보
- `tasks` - 근무 일정 (tasks)
- `privacy_consents` - 개인정보 동의 기록

**실행 방법:**
1. Supabase Dashboard → SQL Editor → New Query
2. `src/SETUP_TABLES.sql` 파일 내용 복사 & 붙여넣기
3. Run 버튼 클릭

**중요:** 이 테이블들은 앱의 핵심 기능을 위한 필수 테이블입니다!

---

### 2. 커뮤니티 테이블 생성 (필수) ⚠️

**파일:** `src/SETUP_COMMUNITY_TABLES.sql`

**생성되는 테이블:**
- `hospital_communities` - 병원별 커뮤니티
- `community_posts` - 커뮤니티 게시글
- `community_comments` - 커뮤니티 댓글
- `community_reports` - 신고 기록
- `meal_menus` - 식단표
- `hospital_official_info` - 병원 공식 정보
- `hospital_admins` - 병원 관리자

**실행 방법:**
1. Supabase Dashboard → SQL Editor → New Query
2. `src/SETUP_COMMUNITY_TABLES.sql` 파일 내용 복사 & 붙여넣기
3. Run 버튼 클릭

**참고:** 이 파일은 `hospitals` 테이블을 참조하므로, `SETUP_HOSPITALS_TABLE.sql`을 먼저 실행했어야 합니다 (이미 완료됨 ✅)

---

### 3. 관리자 테이블 생성 (선택사항)

**파일:** `src/SETUP_ADMIN_TABLES.sql`

**생성되는 테이블:**
- `hospital_settings` - 병원별 설정
- 기타 관리자 관련 테이블

**실행 방법:**
1. Supabase Dashboard → SQL Editor → New Query
2. `src/SETUP_ADMIN_TABLES.sql` 파일 내용 복사 & 붙여넣기
3. Run 버튼 클릭

**참고:** 관리자 기능을 사용하지 않는다면 나중에 실행해도 됩니다.

---

## 🔍 테이블 확인

모든 SQL 파일을 실행한 후, 다음 쿼리로 테이블이 정상적으로 생성되었는지 확인하세요:

```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**예상되는 테이블 목록:**
- `admin_popups`
- `community_comments`
- `community_posts`
- `community_reports`
- `fcm_tokens`
- `hospital_admins`
- `hospital_communities`
- `hospital_official_info`
- `hospital_settings`
- `hospitals`
- `meal_menus`
- `notifications`
- `notification_settings`
- `popup_interactions`
- `privacy_consents`
- `tasks`
- `team_members`
- `teams`
- `user_sessions`
- `user_visits`
- `users`

---

## 🚀 다음 단계 (SQL 실행 완료 후)

### 1. Supabase Edge Function 배포
- Supabase CLI를 사용하여 서버 코드 배포
- 또는 Supabase Dashboard에서 직접 배포

### 2. 환경 변수 설정
- Supabase Dashboard → Settings → Edge Functions → Environment Variables
- 필요한 API 키 및 설정 값 입력

### 3. RLS (Row Level Security) 정책 확인
- 모든 테이블의 RLS 정책이 올바르게 설정되었는지 확인
- 필요시 추가 정책 생성

### 4. 테스트
- 로컬 환경에서 앱 실행
- 회원가입, 로그인, 팀 생성 등 기본 기능 테스트
- 커뮤니티 기능 테스트
- 관리자 기능 테스트

### 5. 배포
- Vercel 또는 다른 호스팅 서비스에 배포
- 도메인 설정
- SSL 인증서 설정

---

## 📚 참고 문서

- `USER_ACTION_GUIDE.md` - 전체 설정 가이드
- `SETUP_VALUES_TEMPLATE.md` - 설정 값 입력 템플릿
- `START_HERE_USER.md` - 시작 가이드
- `VERIFY_TABLES.sql` - 테이블 확인 쿼리

---

## ⚠️ 주의사항

1. **실행 순서:** SQL 파일은 순서대로 실행해야 합니다 (외래 키 참조 때문)
2. **중복 실행:** `CREATE TABLE IF NOT EXISTS`를 사용하므로 여러 번 실행해도 안전합니다
3. **정책 오류:** 정책이 이미 존재하는 경우 `DROP POLICY IF EXISTS`가 포함되어 있어 안전합니다
4. **백업:** 중요한 데이터가 있다면 SQL 실행 전 백업을 권장합니다

---

## ✅ 체크리스트

- [ ] `SETUP_TABLES.sql` 실행
- [ ] `SETUP_COMMUNITY_TABLES.sql` 실행
- [ ] `SETUP_ADMIN_TABLES.sql` 실행 (선택사항)
- [ ] 모든 테이블 확인 (`VERIFY_TABLES.sql` 사용)
- [ ] Supabase Edge Function 배포
- [ ] 환경 변수 설정
- [ ] 로컬 테스트
- [ ] 배포 준비

---

**다음 단계:** `SETUP_TABLES.sql` 파일을 실행하세요! 🚀

