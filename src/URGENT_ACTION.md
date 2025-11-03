# ⚠️ 긴급 조치 필요!

## 🔴 현재 상태

Supabase Table Editor에서 **"Unprotected"** 표시:
- ❌ **보안 취약점 발견!**
- ❌ RLS(Row Level Security) 비활성화
- ❌ 누구나 데이터에 접근 가능

---

## ✅ 지금 바로 해야 할 것

### 1️⃣ RLS 활성화 (5분 소요)

**Supabase Dashboard 접속**:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

**SQL Editor에서 실행**:

```sql
-- 1. ENABLE_RLS.sql 파일 내용 복사
-- 2. SQL Editor → New Query → 붙여넣기
-- 3. Run 버튼 클릭 ▶️
```

**완료 확인**:
- Table Editor 새로고침
- "Unprotected" → **"Protected"** 변경 확인 ✅

---

### 2️⃣ 임시 DB 삭제 (1분 소요)

**SQL Editor에서 실행**:

```sql
-- DELETE_OLD_DB.sql 파일 내용 복사 & 실행
DROP TABLE IF EXISTS kv_store_3afd3c70 CASCADE;
```

**완료 확인**:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**예상 결과**:
```
✅ users
✅ teams
✅ team_members
✅ tasks
✅ privacy_consents
❌ kv_store_3afd3c70 (삭제됨)
```

---

## 📋 빠른 체크리스트

복사해서 Supabase SQL Editor에 붙여넣으세요:

### ✅ Step 1: RLS 활성화
```sql
-- users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- teams 테이블
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- team_members 테이블
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- tasks 테이블
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- privacy_consents 테이블
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents');
```

### ✅ Step 2: 정책 설정
```sql
-- ENABLE_RLS.sql 전체 내용 실행 (정책 포함)
```

### ✅ Step 3: 임시 DB 삭제
```sql
DROP TABLE IF EXISTS kv_store_3afd3c70 CASCADE;
```

---

## 🔍 완료 후 확인

### Table Editor에서 확인
```
✅ users - Protected
✅ teams - Protected
✅ team_members - Protected
✅ tasks - Protected
✅ privacy_consents - Protected
```

### 앱 동작 테스트
1. 회원가입 ✅
2. 로그인 ✅
3. 팀 생성 ✅
4. 일정 추가 ✅

**모두 정상 작동하면 완료!** 🎉

---

## ❓ FAQ

### Q: 앱이 작동 안 하면?
**A**: 서버는 `service_role` 키를 사용하므로 정상 작동합니다.
- 환경 변수 `SUPABASE_SERVICE_ROLE_KEY` 확인

### Q: RLS 활성화 전/후 차이는?
**Before**:
```
❌ 누구나 모든 데이터 접근 가능 (보안 위험!)
```

**After**:
```
✅ 팀 멤버만 팀 데이터 조회
✅ 본인만 프로필 수정
✅ 팀 소유자만 팀 관리
```

### Q: kv_store는 왜 삭제?
**A**: 더 이상 사용하지 않는 임시 테이블입니다.
- 정규화된 DB(users, teams 등)로 완전히 전환했습니다.

---

## 📞 도움이 필요하신가요?

### 상세 가이드
- [FIX_RLS_GUIDE.md](./FIX_RLS_GUIDE.md) - RLS 설정 완벽 가이드
- [ENABLE_RLS.sql](./ENABLE_RLS.sql) - 전체 SQL 스크립트
- [DELETE_OLD_DB.sql](./DELETE_OLD_DB.sql) - 임시 DB 삭제

### 문의
- 📧 shifty@98point7.com
- 💬 GitHub Issues

---

<div align="center">

**🚨 보안은 최우선입니다! 지금 바로 조치하세요! 🚨**

Made with 💙 by **주식회사 98점7도**

</div>
