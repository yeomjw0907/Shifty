# 🚀 Shifty 빠른 시작 가이드

## ⚡ Supabase 데이터베이스 설정 (필수!)

### 1단계: SQL 파일 준비

프로젝트 루트의 **SETUP_TABLES.sql** 파일을 엽니다.

```
📁 프로젝트
  └── SETUP_TABLES.sql  ← 이 파일!
```

전체 내용 복사 (Ctrl+A → Ctrl+C)

---

### 2단계: Supabase에서 실행

1. **Supabase Dashboard** 접속
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 선택**

3. **좌측 메뉴 → SQL Editor 클릭**

4. **New Query 버튼**

5. **복사한 SQL 붙여넣기** (Ctrl+V)

6. **Run 버튼 클릭** (또는 Ctrl+Enter)

7. **완료 확인**
   ```
   Success. No rows returned
   ```

---

### 3단계: RLS 활성화 (필수! 🔐)

**ENABLE_RLS.sql** 파일 열기:

1. 전체 내용 복사
2. Supabase SQL Editor → New Query
3. 붙여넣기 → Run

**왜 필요한가요?**
- Row Level Security 활성화
- 보안 정책 설정
- "Unprotected" → "Protected" 변경

---

### 4단계: 테이블 생성 확인

다음 SQL을 실행해서 테이블이 생성되었는지 확인:

```sql
SELECT 
  table_name,
  (SELECT rowsecurity FROM pg_tables WHERE tablename = table_name) as rls_enabled
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents')
ORDER BY table_name;
```

**결과**: 
- 5개 테이블 모두 보임 ✅
- `rls_enabled = t` (true) ✅

---

### 5단계: 임시 DB 삭제 (선택사항)

**DELETE_OLD_DB.sql** 파일 실행:
- 기존 `kv_store_3afd3c70` 테이블 제거
- 정규화된 DB만 사용

---

## 🔑 환경 변수 설정

### 로컬 개발용 (.env)

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

Supabase Dashboard → Settings → API에서 확인 가능

---

## 🌐 소셜 로그인 설정 (선택사항)

### 카카오 로그인
1. https://developers.kakao.com에서 앱 등록
2. Supabase Dashboard → Authentication → Providers → Kakao
3. Client ID, Secret 입력

### 구글 로그인
1. https://console.cloud.google.com에서 OAuth 앱 등록
2. Supabase Dashboard → Authentication → Providers → Google
3. Client ID, Secret 입력

### 네이버 로그인
1. https://developers.naver.com에서 앱 등록
2. Supabase Dashboard → Authentication → Providers (Custom)
3. Naver 설정 추가

자세한 내용은 **SETUP.md** 참고

---

## 🚀 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 🎉 완료!

이제 Shifty를 사용할 수 있습니다:

1. ✅ 회원가입/로그인
2. ✅ 팀 생성
3. ✅ 일정 추가
4. ✅ 팀원 초대

---

## ❓ 문제 해결

### 데이터베이스 오류
```
❌ Could not find the table 'public.users'
```
→ SETUP_TABLES.sql 재실행

### 테이블 초기화 (주의!)
```sql
DROP TABLE IF EXISTS privacy_consents CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

그 다음 SETUP_TABLES.sql 다시 실행

---

## 📚 추가 문서

- **README.md** - 프로젝트 전체 개요
- **SETUP.md** - 상세 설정 가이드
- **DEPLOY.md** - Vercel 배포 가이드

---

Made with 💙 by **주식회사 98점7도**
