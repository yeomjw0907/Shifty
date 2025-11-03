# "User not found" 에러 해결 가이드

## 문제 설명

"Create team error: User not found" 에러는 **사용자 프로필이 데이터베이스에 없을 때** 발생합니다.

---

## 원인

1. **회원가입이 완료되지 않음**
   - 회원가입 시 `users` 테이블에 프로필이 저장되지 않았을 수 있습니다
   
2. **데이터베이스 테이블이 생성되지 않음**
   - Supabase에서 `users` 테이블이 없거나 잘못 설정됨

3. **인증 토큰 불일치**
   - 로그인한 계정의 `auth_id`가 `users` 테이블과 매칭되지 않음

---

## 해결 방법

### 1️⃣ 데이터베이스 테이블 확인

**Supabase Dashboard** 접속:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

**SQL Editor에서 테이블 확인**:
```sql
-- users 테이블 확인
SELECT * FROM users LIMIT 5;

-- 현재 로그인한 사용자 확인
SELECT auth.uid() as current_auth_id;
```

### 2️⃣ 테이블이 없는 경우

`SETUP_TABLES.sql` 파일을 SQL Editor에서 실행:

1. Supabase Dashboard → **SQL Editor**
2. **New Query** 클릭
3. `SETUP_TABLES.sql` 내용 복사 & 붙여넣기
4. **Run** 버튼 클릭

### 3️⃣ 사용자 프로필 확인

```sql
-- auth_id로 사용자 검색
SELECT * FROM users WHERE auth_id = 'YOUR_AUTH_ID';

-- 이메일로 사용자 검색
SELECT * FROM users WHERE email = 'your@email.com';
```

### 4️⃣ 재회원가입

가장 확실한 방법:

1. **로그아웃**
2. **새로 회원가입** (다른 이메일 사용 가능)
3. 회원가입 시 **모든 필수 정보 입력**:
   - 이름
   - 이메일
   - 비밀번호
   - 병원명
   - 개인정보 처리방침 동의

---

## 서버 로그 확인

서버 로그에서 더 자세한 정보를 확인할 수 있습니다:

**Supabase Dashboard → Edge Functions → Logs**

다음과 같은 로그를 찾으세요:
```
User lookup error: [에러 상세]
User not found in database. Auth ID: [auth_id] Email: [email]
```

---

## 여전히 해결되지 않는 경우

### 수동으로 사용자 프로필 생성

```sql
-- 현재 인증된 사용자의 auth_id 확인
SELECT auth.uid();

-- 수동으로 users 레코드 생성
INSERT INTO users (auth_id, email, name, hospital, department)
VALUES (
  'YOUR_AUTH_ID_HERE',
  'your@email.com',
  '홍길동',
  '서울대병원',
  '응급의학과'
);
```

⚠️ **주의**: `YOUR_AUTH_ID_HERE`는 실제 Supabase Auth ID로 교체해야 합니다.

---

## 예방 방법

### 1. 회원가입 시 모든 필수 정보 입력
- 이름
- 병원명
- 개인정보 처리방침 동의

### 2. 회원가입 후 즉시 로그인
- 회원가입 성공 후 자동으로 로그인됩니다

### 3. 브라우저 캐시/쿠키 문제
- 로그아웃 후 브라우저 캐시 삭제
- 시크릿 모드에서 다시 시도

---

## 기술 상세 (개발자용)

### 에러 발생 위치
- `POST /make-server-3afd3c70/teams`
- `POST /make-server-3afd3c70/teams/join`
- `POST /make-server-3afd3c70/teams/:teamId/tasks`

### 에러 발생 로직
```typescript
const { data: userData, error: userError } = await supabase
  .from('users')
  .select('id, name, hospital, department')
  .eq('auth_id', user.id)  // ← Supabase Auth의 user.id
  .single();

if (!userData) {
  return c.json({ error: 'User not found' }, 404);
}
```

### 해결된 개선 사항
- ✅ 더 자세한 에러 로깅
- ✅ 한글 에러 메시지
- ✅ auth_id와 email 출력
- ✅ 사용자 친화적인 안내

---

## 연락처

문제가 계속되면:
- 📧 admin@98point7.com
- 🔧 GitHub Issues
