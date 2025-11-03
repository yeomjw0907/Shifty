# 🧪 Shifty 테스트 계정 가이드

## 📋 테스트 계정 정보

### 테스트용 사용자 계정

```
📧 이메일: test@shifty.com
🔑 비밀번호: test1234
👤 이름: 김테스트
🏥 병원: 테스트병원
📍 부서: 내과병동
💼 직책: 수간호사
📞 연락처: 010-1234-5678
```

---

## 🚀 테스트 계정 생성 방법

### 방법 1: 앱에서 회원가입 (권장)

1. **Shifty 앱 접속**
   ```
   http://localhost:5173  (로컬)
   또는 배포 URL
   ```

2. **회원가입 탭 클릭**

3. **정보 입력**
   - 이름: `김테스트`
   - 근무 병원: `테스트병원`
   - 부서/병동: `내과병동` (선택사항)
   - 직책: `수간호사` (선택사항)
   - 연락처: `010-1234-5678` (선택사항)
   - 이메일: `test@shifty.com`
   - 비밀번호: `test1234`
   - 비밀번호 확인: `test1234`

4. **개인정보 처리방침 동의** ✅

5. **회원가입 버튼 클릭**

---

### 방법 2: Supabase Dashboard에서 직접 생성

#### Step 1: Supabase Dashboard 접속
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

#### Step 2: SQL Editor에서 실행

```sql
-- 1. Auth 사용자 생성 (이메일 자동 확인)
SELECT auth.admin_create_user(
  email := 'test@shifty.com',
  password := 'test1234',
  email_confirm := true
);

-- 2. 생성된 사용자의 auth_id 확인
SELECT id, email FROM auth.users WHERE email = 'test@shifty.com';

-- 3. users 테이블에 프로필 추가 (auth_id를 위에서 확인한 값으로 교체)
INSERT INTO users (auth_id, email, name, hospital, department, position, phone)
VALUES (
  'YOUR_AUTH_ID_HERE',  -- ⬅️ Step 2에서 확인한 id 값
  'test@shifty.com',
  '김테스트',
  '테스트병원',
  '내과병동',
  '수간호사',
  '010-1234-5678'
);

-- 4. privacy_consents 테이블에 동의 기록 추가
INSERT INTO privacy_consents (user_id, agreed_at)
SELECT id, NOW()
FROM users
WHERE email = 'test@shifty.com';
```

---

## ✅ 계정 생성 확인

### 1. 데이터베이스 확인

```sql
-- Auth 사용자 확인
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@shifty.com';

-- 프로필 확인
SELECT * FROM users WHERE email = 'test@shifty.com';

-- 동의 기록 확인
SELECT c.* 
FROM privacy_consents c
JOIN users u ON c.user_id = u.id
WHERE u.email = 'test@shifty.com';
```

**예상 결과**:
- ✅ auth.users에 1개 레코드
- ✅ users에 1개 레코드
- ✅ privacy_consents에 1개 레코드

### 2. 앱에서 로그인 테스트

1. **로그인 탭 클릭**
2. **이메일**: `test@shifty.com`
3. **비밀번호**: `test1234`
4. **로그인 버튼 클릭**

**예상 결과**:
```
✅ 로그인 성공!
✅ 대시보드로 이동
✅ "김테스트님, 환영합니다!" 메시지
```

---

## 🧪 추가 테스트 계정 생성 (선택사항)

### 팀 협업 테스트용 추가 계정

```sql
-- 테스트 사용자 2
SELECT auth.admin_create_user(
  email := 'test2@shifty.com',
  password := 'test1234',
  email_confirm := true
);

-- auth_id 확인 후 프로필 추가
INSERT INTO users (auth_id, email, name, hospital, department, position)
VALUES (
  'USER2_AUTH_ID',
  'test2@shifty.com',
  '이테스트',
  '테스트병원',
  '외과병동',
  '간호사'
);

-- 테스트 사용자 3
SELECT auth.admin_create_user(
  email := 'test3@shifty.com',
  password := 'test1234',
  email_confirm := true
);

INSERT INTO users (auth_id, email, name, hospital, department, position)
VALUES (
  'USER3_AUTH_ID',
  'test3@shifty.com',
  '박테스트',
  '테스트병원',
  '응급실',
  '책임간호사'
);
```

---

## 📊 테스트 시나리오

### 1️⃣ 기본 로그인/로그아웃
```
✅ test@shifty.com으로 로그인
✅ 대시보드 접근
✅ 로그아웃
```

### 2️⃣ 팀 생성 및 관리
```
✅ 새 팀 생성 (예: "내과병동 A팀")
✅ 팀 초대 코드 확인
✅ 팀원 초대
```

### 3️⃣ 일정 추가
```
✅ Day 근무 추가 (오늘)
✅ Evening 근무 추가 (내일)
✅ Night 근무 추가 (모레)
✅ Off Duty 설정
```

### 4️⃣ 협업 기능
```
✅ test2@shifty.com으로 팀 참여
✅ 팀 일정 조회
✅ 다른 멤버 일정 확인
```

### 5️⃣ 마이페이지
```
✅ 프로필 조회
✅ 정보 수정
✅ 참여 팀 목록 확인
```

---

## 🗑️ 테스트 계정 삭제

### 테스트 후 데이터 정리

```sql
-- 1. 관련 데이터 삭제 (순서 중요!)
DELETE FROM privacy_consents WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test%@shifty.com'
);

DELETE FROM tasks WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test%@shifty.com'
);

DELETE FROM team_members WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test%@shifty.com'
);

DELETE FROM users WHERE email LIKE 'test%@shifty.com';

-- 2. Auth 사용자 삭제
-- Supabase Dashboard → Authentication → Users → 수동 삭제
-- 또는 Admin API 사용
```

---

## 🔧 문제 해결

### "이메일 또는 비밀번호가 올바르지 않습니다"

**원인**: Auth 사용자는 있지만 이메일이 확인되지 않음

**해결**:
```sql
-- 이메일 확인 처리
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test@shifty.com';
```

### "User not found"

**원인**: Auth 사용자는 있지만 users 테이블에 프로필 없음

**해결**: 
- 방법 1: 로그인 시도 (자동 프로필 생성)
- 방법 2: SQL로 수동 추가 (위 참고)

### "Table not found"

**원인**: 데이터베이스 테이블이 생성되지 않음

**해결**:
```sql
-- SETUP_TABLES.sql 실행
-- START_HERE.md 참고
```

---

## 📝 테스트 체크리스트

복사해서 사용하세요:

```
테스트 계정 생성
- [ ] test@shifty.com 계정 생성
- [ ] 로그인 테스트 성공
- [ ] 프로필 조회 확인

기본 기능 테스트
- [ ] 팀 생성
- [ ] 일정 추가 (Day/Evening/Night/Off)
- [ ] 캘린더 보기 (월간/연간)
- [ ] 초대 코드 생성

협업 기능 테스트
- [ ] test2 계정 생성
- [ ] 팀 초대 및 참여
- [ ] 팀원 일정 조회
- [ ] 멤버 관리

추가 기능 테스트
- [ ] 마이페이지
- [ ] 구글 캘린더 연동
- [ ] OCR 근무표 업로드
- [ ] PWA 설치

정리
- [ ] 테스트 데이터 삭제
- [ ] 테스트 계정 삭제
```

---

## 🎉 테스트 완료!

모든 기능이 정상 작동하면:

1. ✅ **RLS 정책 확인** - 보안 설정 완료
2. ✅ **API 엔드포인트 확인** - 서버 정상 작동
3. ✅ **프론트엔드 확인** - UI/UX 완성
4. ✅ **데이터베이스 확인** - 정규화 완료

**이제 프로덕션 배포 준비가 완료되었습니다!** 🚀

---

<div align="center">

**Happy Testing!** 🧪

Made with 💙 by **주식회사 98점7도**

</div>
