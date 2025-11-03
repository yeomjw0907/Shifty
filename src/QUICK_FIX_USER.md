# ⚡ 빠른 해결: User not found 에러

## 🎯 문제
```
Create team error: 사용자 프로필을 찾을 수 없습니다. 다시 로그인해주세요.
User not found in database. Auth ID: xxx Email: xxx
```

---

## ✅ 자동 해결 (권장)

**2024-11-03 업데이트**: 이제 자동으로 해결됩니다! 🎉

### 변경 사항
서버가 자동으로 사용자 프로필을 생성하도록 개선되었습니다.

**다음 작업만 하면 됩니다**:
1. **페이지 새로고침** (F5 또는 Cmd+R)
2. **다시 로그인**
3. 완료! ✨

서버가 로그인 시 `users` 테이블에 프로필이 없으면 자동으로 생성합니다.

---

## 🔧 수동 해결 (긴급 상황)

만약 자동 해결이 작동하지 않는다면:

### 1. Supabase Dashboard 접속
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

### 2. SQL Editor에서 실행

**현재 로그인 사용자 확인**:
```sql
SELECT auth.uid() as my_auth_id;
```

**사용자 프로필 수동 생성**:
```sql
-- auth_id를 위에서 확인한 값으로 교체하세요
INSERT INTO users (auth_id, email, name, created_at, updated_at)
VALUES (
  'YOUR_AUTH_ID_HERE',  -- ← 실제 auth_id로 교체
  'your@email.com',     -- ← 실제 이메일로 교체
  '사용자',              -- ← 원하는 이름으로 교체
  NOW(),
  NOW()
)
ON CONFLICT (auth_id) DO NOTHING;
```

### 3. 확인
```sql
SELECT * FROM users WHERE email = 'your@email.com';
```

---

## 🚀 작동 원리

### Before (이전)
1. 회원가입 → Supabase Auth에 저장
2. `users` 테이블에 저장 시도
3. **실패하면** → 에러 발생 ❌

### After (현재)
1. 로그인 요청
2. `users` 테이블 확인
3. **없으면** → 자동 생성 ✅
4. 성공! 🎉

### 자동 생성되는 항목
```typescript
{
  auth_id: "xxx",           // Supabase Auth ID
  email: "user@email.com",  // 이메일
  name: "사용자",            // 이메일 앞부분 또는 메타데이터
  hospital: null,           // 나중에 업데이트 가능
  department: null,
  position: null,
  phone: null
}
```

---

## 🔍 에러 로그 확인

**Supabase Dashboard → Edge Functions → Logs**

### 정상 작동 시 로그:
```
🔧 Auto-creating user profile for auth_id: xxx email: xxx
✅ User profile auto-created successfully: xxx
```

### 여전히 에러가 발생한다면:
```
Failed to auto-create user profile: [에러 상세]
```
→ [FIX_USER_NOT_FOUND.md](./FIX_USER_NOT_FOUND.md) 참고

---

## 📞 여전히 문제가 있나요?

1. **로그아웃 후 재로그인**
2. **브라우저 캐시 삭제**
3. **시크릿 모드에서 시도**
4. **다른 브라우저에서 시도**

그래도 안 되면:
- 📧 shifty@98point7.com
- 💬 GitHub Issues

---

## ✨ 개선된 기능

### 모든 엔드포인트에 적용:
- ✅ `/auth/me` - 로그인 확인
- ✅ `/teams` - 팀 생성
- ✅ `/teams/join` - 팀 참여
- ✅ `/teams/:id/members/:id` - 멤버 수정
- ✅ `/teams/:id/tasks` - 일정 생성

### Helper 함수
```typescript
async function getOrCreateUserProfile(authUser: any) {
  // users 테이블에서 조회
  // 없으면 자동으로 생성
  // 반환
}
```

---

<div align="center">

**더 이상 수동으로 사용자를 생성할 필요가 없습니다!** 🎉

Made with 💙 by **주식회사 98점7도**

</div>
