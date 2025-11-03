# 🚨 로그인 문제 해결 가이드

## 문제: "로그인이 안 됩니다"

test@shifty.com으로 로그인을 시도했지만 화면이 넘어가지 않는 문제

---

## ✅ 해결 방법 (3가지 중 선택)

### 🎯 방법 1: 앱에서 직접 회원가입 (가장 쉬움! ⭐ 추천)

1. **회원가입 탭 클릭**

2. **정보 입력**:
   ```
   이름: 김테스트
   근무 병원: 테스트병원
   부서/병동: 내과병동 (선택사항)
   직책: 수간호사 (선택사항)
   연락처: 010-1234-5678 (선택사항)
   이메일: test@shifty.com
   비밀번호: test1234
   비밀번호 확인: test1234
   ```

3. **개인정보 처리방침 동의** ✅

4. **회원가입 버튼 클릭**

5. ✅ 자동으로 로그인되고 대시보드로 이동!

---

### 🎯 방법 2: Supabase SQL로 계정 생성

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **SQL Editor 열기** (좌측 메뉴)

3. **New query 클릭**

4. **`CREATE_TEST_ACCOUNT.sql` 파일 내용 복사 & 붙여넣기**

5. **Run 버튼 클릭** ▶️

6. **결과 확인**:
   ```
   ✅ Auth 사용자: 1 row
   ✅ 프로필: 1 row
   ✅ 개인정보 동의: 1 row
   ```

7. **앱에서 로그인**:
   ```
   이메일: test@shifty.com
   비밀번호: test1234
   ```

---

### 🎯 방법 3: 브라우저 콘솔 확인 (디버깅)

1. **개발자 도구 열기**
   - Windows/Linux: `F12` 또는 `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

2. **Console 탭 선택**

3. **로그인 시도**

4. **콘솔 메시지 확인**:

   **✅ 정상적인 경우**:
   ```
   🔐 로그인 시도: { email: "test@shifty.com", passwordLength: 8 }
   📊 로그인 응답: { hasData: true, hasSession: true, hasUser: true, error: null }
   ✅ 로그인 성공! { userId: "..." }
   ```

   **❌ 계정이 없는 경우**:
   ```
   🔐 로그인 시도: { email: "test@shifty.com", passwordLength: 8 }
   ❌ 로그인 에러: { message: "Invalid login credentials" }
   ```
   → **해결**: 방법 1 또는 2로 계정 생성

   **❌ 비밀번호가 틀린 경우**:
   ```
   ❌ 로그인 에러: { message: "Invalid login credentials" }
   ```
   → **해결**: 비밀번호 `test1234` 확인

   **❌ 이메일이 확인되지 않은 경우**:
   ```
   ❌ 로그인 에러: { message: "Email not confirmed" }
   ```
   → **해결**: Supabase에서 이메일 확인:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'test@shifty.com';
   ```

---

## 🔍 추가 확인 사항

### 1. 데이터베이스 테이블 확인

**Supabase SQL Editor에서 실행**:

```sql
-- 1. Auth 사용자 확인
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'test@shifty.com';
```

**결과**:
- ✅ **1 row**: 계정 존재 → 로그인 가능
- ❌ **0 rows**: 계정 없음 → 방법 1 또는 2로 생성

```sql
-- 2. Users 프로필 확인
SELECT * FROM users WHERE email = 'test@shifty.com';
```

**결과**:
- ✅ **1 row**: 프로필 존재
- ❌ **0 rows**: 프로필 없음 → 로그인 시 자동 생성됨

---

### 2. 데이터베이스 테이블 생성 확인

```sql
-- 테이블 존재 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents');
```

**결과**:
- ✅ **5 rows**: 모든 테이블 존재
- ❌ **< 5 rows**: 테이블 생성 필요 → `SETUP_TABLES.sql` 실행

---

### 3. RLS 정책 확인

```sql
-- RLS 활성화 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents');
```

**결과**:
- ✅ 모두 `rowsecurity = true`: RLS 활성화됨
- ❌ `rowsecurity = false`: → `ENABLE_RLS.sql` 실행

---

## 🎬 단계별 체크리스트

복사해서 사용하세요:

```
[ ] 1. 개발 서버 실행 (npm run dev)
[ ] 2. 브라우저에서 앱 열기 (http://localhost:5173)
[ ] 3. 회원가입 탭 클릭
[ ] 4. 테스트 정보 입력
      - 이름: 김테스트
      - 병원: 테스트병원
      - 이메일: test@shifty.com
      - 비밀번호: test1234
      - 비밀번호 확인: test1234
[ ] 5. 개인정보 동의 체크 ✅
[ ] 6. 회원가입 버튼 클릭
[ ] 7. "회원가입이 완료되었습니다!" 토스트 확인
[ ] 8. 자동으로 대시보드 이동 확인
[ ] 9. "김테스트님, 환영합니다!" 메시지 확인
```

---

## 🚀 빠른 테스트 (이미 계정이 있다면)

### 로그인 테스트
```
📧 이메일: test@shifty.com
🔑 비밀번호: test1234
```

### 예상 동작
1. 이메일/비밀번호 입력
2. "로그인" 버튼 클릭
3. ✅ "로그인 성공!" 토스트 표시
4. ✅ 대시보드로 자동 이동
5. ✅ 헤더에 "김테스트" 이름 표시

---

## 💊 자주 발생하는 문제와 해결

### 문제 1: "이메일 또는 비밀번호가 올바르지 않습니다"
**원인**: 계정이 없거나 비밀번호가 틀림  
**해결**: 
1. 방법 1로 회원가입 (가장 쉬움)
2. 비밀번호 `test1234` 확인

### 문제 2: "User not found"
**원인**: Auth에는 있지만 users 테이블에 프로필 없음  
**해결**: 로그인 시도 (자동으로 프로필 생성됨)

### 문제 3: 로그인 버튼 클릭 후 아무 반응 없음
**원인**: JavaScript 에러 또는 네트워크 문제  
**해결**: 
1. 브라우저 콘솔 확인 (F12)
2. Network 탭에서 요청 확인
3. `npm run dev` 재시작

### 문제 4: "Table not found"
**원인**: 데이터베이스 테이블 생성 안 됨  
**해결**: `SETUP_TABLES.sql` 실행

### 문제 5: "RLS policy violation"
**원인**: Row Level Security 정책 없음  
**해결**: `ENABLE_RLS.sql` 실행

---

## 📞 여전히 안 되나요?

### 콘솔 로그 확인하기

**브라우저 콘솔 (F12)에서 확인**:
```
🔐 로그인 시도: ...
📊 로그인 응답: ...
```

**로그를 복사해서 공유해주세요!**

---

## ✅ 성공 확인

로그인이 성공하면 다음을 확인할 수 있습니다:

1. ✅ "로그인 성공!" 초록 토스트
2. ✅ URL이 `/` (대시보드)로 변경
3. ✅ 헤더에 "김테스트" 이름 표시
4. ✅ 캘린더 화면 표시
5. ✅ 우측 하단에 + 버튼 (일정 추가)

---

<div align="center">

**문제가 해결되었나요?** 🎉

이제 Shifty의 모든 기능을 사용할 수 있습니다!

Made with 💙 by **주식회사 98점7도**

</div>
