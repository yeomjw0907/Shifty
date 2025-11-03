# ⚡ Shifty 5분 빠른 시작 가이드

## 1️⃣ 개발 서버 실행 (1분)

```bash
# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 시작
npm run dev
```

브라우저 자동 실행: `http://localhost:5173`

---

## 2️⃣ 테스트 계정으로 로그인 (2분)

### ⭐ 가장 쉬운 방법: 앱에서 회원가입

1. **"회원가입" 탭 클릭**

2. **정보 입력**:
   ```
   이름: 김테스트
   근무 병원: 테스트병원
   이메일: test@shifty.com
   비밀번호: test1234
   비밀번호 확인: test1234
   ```
   (부서, 직책, 연락처는 선택사항)

3. **개인정보 동의 체크** ✅

4. **회원가입 버튼 클릭**

5. ✅ **완료!** 자동 로그인됩니다!

---

## 3️⃣ 기능 테스트 (2분)

### ✅ 일정 추가하기
1. 우측 하단 **+ 버튼** 클릭
2. 교대근무 타입 선택 (Day/Evening/Night/Off)
3. 날짜/시간 선택
4. 저장!

### ✅ 팀 만들기
1. 좌측 상단 **메뉴** → "팀 만들기"
2. 팀 이름 입력 (예: "내과병동 A팀")
3. 생성!
4. 초대 코드 확인 (6자리)

### ✅ 캘린더 보기
- **월간 보기**: 기본 캘린더
- **연간 보기**: 상단 토글
- **팀 일정**: 팀원 전체 스케줄 확인

---

## 🚨 문제 해결

### "로그인이 안 돼요"
→ 위의 **2️⃣ 회원가입**을 먼저 하세요!  
→ 자세한 해결: [FIX_LOGIN_ISSUE.md](./FIX_LOGIN_ISSUE.md)

### "데이터베이스 에러"
→ Supabase 설정 필요: [SETUP_TABLES.sql](./SETUP_TABLES.sql) 실행  
→ 자세한 가이드: [START_HERE.md](./START_HERE.md)

### "User not found"
→ 로그인 재시도 (자동으로 프로필 생성됨)  
→ 자세한 해결: [FIX_USER_NOT_FOUND.md](./FIX_USER_NOT_FOUND.md)

---

## 🎉 성공!

이제 Shifty의 모든 기능을 사용할 수 있습니다:

- ✅ 교대근무 일정 관리
- ✅ 팀 협업
- ✅ 캘린더 동기화
- ✅ 드럼 피커 시간 선택
- ✅ 토스 스타일 UI

---

## 📚 더 알아보기

- **전체 가이드**: [README.md](./README.md)
- **Supabase 설정**: [SETUP.md](./SETUP.md)
- **배포 가이드**: [DEPLOY.md](./DEPLOY.md)
- **테스트 계정**: [TEST_ACCOUNT_GUIDE.md](./TEST_ACCOUNT_GUIDE.md)
- **Input 디자인**: [TOSS_INPUT_CHANGELOG.md](./TOSS_INPUT_CHANGELOG.md)

---

<div align="center">

**Happy Shifting!** 🔄

Made with 💙 by **주식회사 98점7도**

</div>
