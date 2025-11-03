# 🔐 RLS 설정 및 임시 DB 삭제 가이드

## ⚠️ 현재 문제

Supabase Table Editor에서 "**Unprotected**" 표시가 보이는 것은:
- **RLS(Row Level Security)가 비활성화**되어 있다는 의미
- 보안 취약점! 누구나 테이블 데이터에 접근 가능

## ✅ 해결 방법

### 1️⃣ RLS 활성화 (필수)

**Supabase Dashboard 접속**:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

**SQL Editor로 이동**:
1. 좌측 메뉴 → **SQL Editor**
2. **New Query** 클릭
3. `ENABLE_RLS.sql` 파일 내용 복사 & 붙여넣기
4. **Run** 버튼 클릭 ▶️

---

### 2️⃣ 임시 DB 삭제 (권장)

기존 `kv_store_3afd3c70` 테이블은 더 이상 사용하지 않습니다.

**삭제 방법**:
1. SQL Editor에서 **New Query**
2. `DELETE_OLD_DB.sql` 파일 내용 복사 & 붙여넣기
3. **Run** 버튼 클릭 ▶️

---

## 📋 실행 순서

### Step 1: RLS 활성화
```sql
-- ENABLE_RLS.sql 실행
-- 5개 테이블에 RLS 및 정책 적용
```

### Step 2: 확인
```sql
-- Table Editor에서 확인
-- "Unprotected" → "Protected" 로 변경됨
```

### Step 3: 임시 DB 삭제
```sql
-- DELETE_OLD_DB.sql 실행
-- kv_store_3afd3c70 삭제
```

---

## 🔍 RLS 정책 설명

### Users 테이블
- ✅ 자신의 프로필 조회/수정 가능
- ✅ 같은 팀 멤버는 서로 볼 수 있음

### Teams 테이블
- ✅ 팀 멤버는 자신의 팀 조회 가능
- ✅ 팀 소유자만 수정/삭제 가능

### Team_Members 테이블
- ✅ 팀 멤버는 같은 팀의 멤버 목록 조회
- ✅ 팀 소유자만 멤버 추가/삭제 가능

### Tasks 테이블
- ✅ 팀 멤버는 팀 일정 조회/생성 가능
- ✅ 일정 생성자 또는 팀 소유자만 수정/삭제

### Privacy_Consents 테이블
- ✅ 자신의 동의 기록만 조회 가능

---

## 🚨 주의사항

### RLS 활성화 후
- **서버는 `service_role` 키를 사용** → RLS 무시하고 접근 가능 ✅
- **프론트엔드는 `anon` 키를 사용** → RLS 정책에 따라 접근 제한 ✅

### 서버 코드는 수정 불필요!
서버가 `SUPABASE_SERVICE_ROLE_KEY`를 사용하므로:
- ✅ 회원가입 시 users 테이블에 insert 가능
- ✅ 팀 생성 시 teams 테이블에 insert 가능
- ✅ 모든 API 정상 작동

---

## 📊 적용 전/후 비교

### Before (현재)
```
❌ users - Unprotected
❌ teams - Unprotected
❌ team_members - Unprotected
❌ tasks - Unprotected
❌ privacy_consents - Unprotected
```

### After (적용 후)
```
✅ users - Protected (RLS enabled)
✅ teams - Protected (RLS enabled)
✅ team_members - Protected (RLS enabled)
✅ tasks - Protected (RLS enabled)
✅ privacy_consents - Protected (RLS enabled)
```

---

## 🧪 테스트 방법

### 1. RLS 상태 확인
```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents');
```

**예상 결과**:
```
tablename        | rls_enabled
-----------------+------------
users            | t
teams            | t
team_members     | t
tasks            | t
privacy_consents | t
```

### 2. 정책 확인
```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3. 앱 테스트
1. **회원가입** → ✅ 정상 작동
2. **로그인** → ✅ 정상 작동
3. **팀 생성** → ✅ 정상 작동
4. **일정 추가** → ✅ 정상 작동

---

## 🔧 문제 해결

### RLS 활성화 후 에러 발생 시

**"new row violates row-level security policy"**
- 서버가 `service_role` 키를 사용하는지 확인
- 환경 변수 확인: `SUPABASE_SERVICE_ROLE_KEY`

**"permission denied for table"**
- PostgreSQL 권한 확인
- 테이블 소유자 확인

---

## 📞 도움이 필요하신가요?

1. **Supabase Logs 확인**:
   - Dashboard → Logs → Postgres Logs
   
2. **Edge Functions Logs 확인**:
   - Dashboard → Edge Functions → Logs

3. **문의**:
   - 📧 shifty@98point7.com
   - 💬 GitHub Issues

---

## ✅ 체크리스트

완료 후 확인:

- [ ] `ENABLE_RLS.sql` 실행 완료
- [ ] Table Editor에서 "Protected" 확인
- [ ] `DELETE_OLD_DB.sql` 실행 완료 (선택)
- [ ] `kv_store_3afd3c70` 테이블 삭제 확인
- [ ] 회원가입 테스트 ✅
- [ ] 팀 생성 테스트 ✅
- [ ] 일정 추가 테스트 ✅

---

<div align="center">

**보안이 강화된 Shifty를 안전하게 사용하세요!** 🔐

Made with 💙 by **주식회사 98점7도**

</div>
