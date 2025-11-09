# 🔄 Shifty

**교대근무, 이제 쉬프티하게**

간호사와 교대근무자를 위한 스마트 일정 관리 서비스

---

## ✨ 주요 기능

### 🔄 스마트 교대근무 관리
- **Day** (데이): 오전 근무 🌞
- **Evening** (이브닝): 오후 근무 🌆  
- **Night** (나이트): 야간 근무 🌙
- **Off** (휴무): 쉬는 날 ☁️

### 👥 팀 협업
- 초대 코드로 간편한 팀 구성
- 실시간 일정 동기화
- 팀 전체 스케줄 한눈에 보기
- 팀원 관리 및 역할 설정

### 📅 캘린더 연동
- Google Calendar
- Apple Calendar (iCloud)
- Notion Calendar
- .ics 파일 내보내기/가져오기

### 🎨 토스 스타일 디자인 시스템
- **새로워진 Input 디자인**: 밝은 배경, 부드러운 포커스 링, 실시간 validation
- 글래스모피즘 UI
- iOS 드럼 피커 시간 선택
- 부드러운 Motion 애니메이션
- 명확한 에러/성공 피드백

### 📱 PWA 지원
- 앱처럼 홈 화면에 설치
- 오프라인 지원
- 빠른 로딩

---

## 🚀 빠른 시작

### 1. Supabase 설정

1. **데이터베이스 테이블 생성**
   - [SETUP_TABLES.sql](./SETUP_TABLES.sql) 파일 열기
   - Supabase SQL Editor에서 전체 복사 & 실행

2. **🔐 RLS(Row Level Security) 활성화** ⚠️ 필수!
   - [ENABLE_RLS.sql](./ENABLE_RLS.sql) 파일 열기
   - Supabase SQL Editor에서 전체 복사 & 실행
   - Table Editor에서 "Unprotected" → "Protected" 확인
   - 자세한 내용: [FIX_RLS_GUIDE.md](./FIX_RLS_GUIDE.md)

3. **🗑️ 임시 DB 삭제** (선택사항)
   - [DELETE_OLD_DB.sql](./DELETE_OLD_DB.sql) 실행
   - `kv_store_3afd3c70` 테이블 제거

4. **소셜 로그인 설정** (선택사항)
   - Supabase Dashboard → Authentication → Providers
   - 카카오/구글/네이버 설정

자세한 내용은 [SETUP.md](./SETUP.md) 참고

### 2. 로컬 개발

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# 개발 서버 실행
npm run dev
```

### 3. Vercel 배포

자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md) 참고

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 프로덕션 배포
vercel --prod
```

---

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS v4**
- **Motion (Framer Motion)**
- **Lucide React**
- **Sonner**

### Backend
- **Supabase** (PostgreSQL + Auth)
- **Hono** (Edge Functions)
- **Row Level Security**

---

## 🎯 사용 방법

### 회원가입 & 로그인
- 이메일/비밀번호 또는 소셜 로그인
- 병원명, 부서, 직책 정보 입력
- 개인정보 처리방침 동의

### 팀 생성 & 참여
- 최초 로그인 시 자동으로 팀 생성
- 초대 코드 6자리로 다른 팀 참여 가능
- 여러 팀 전환 가능

### 일정 관리
- 우측 하단 **+** 버튼으로 일정 추가
- 교대근무 타입 선택 (Day/Evening/Night/Off)
- 개인 일정 추가 가능
- 드럼 피커로 시간 선택

### 마이페이지
- 프로필 정보 수정 (이름, 직책)
- 팀 정보 확인
- 초대 코드 관리
- 계정 설정

---

## 🧪 테스트 계정

### 빠른 테스트를 위한 계정

```
📧 이메일: test@shifty.com
🔑 비밀번호: test1234
```

### 🚨 로그인이 안 되나요?

**회원가입으로 계정을 먼저 생성하세요!**

1. 앱에서 "회원가입" 탭 클릭
2. 위 정보로 가입
3. 자동 로그인!

**자세한 해결 방법**: [FIX_LOGIN_ISSUE.md](./FIX_LOGIN_ISSUE.md) ⭐  
**SQL로 생성**: [CREATE_TEST_ACCOUNT.sql](./CREATE_TEST_ACCOUNT.sql)

---

## 🛡️ 관리자 대시보드

### 접근 방법
- `/admin` 경로 또는 `admin.shifty.kr` 도메인
- 관리자 이메일로 로그인 시 자동 접근

### 관리자 설정

**AdminApp.tsx**와 **server/index.tsx**에서 관리자 이메일 추가:

```typescript
const ADMIN_EMAILS = [
  'admin@shifty.app',
  'admin@98point7.com',
  'your-admin@example.com', // 추가
];
```

### 대시보드 기능
- 전체 사용자/팀/일정 통계
- 교대근무 유형별 분석
- 팀 크기별 분포
- 최근 가입 사용자 목록
- 실시간 활성 사용자

---

## 📱 PWA 설치

### iOS
1. Safari에서 Shifty 열기
2. 공유 버튼 → "홈 화면에 추가"

### Android
1. Chrome에서 Shifty 열기
2. 메뉴 → "홈 화면에 추가"

---

## 🎨 디자인 시스템

### 브랜드 컬러
```css
/* Primary */
--shifty-primary: #3B82F6;

/* Shift Types */
--shifty-day: #FCD34D;      /* Yellow */
--shifty-evening: #FB923C;  /* Orange */
--shifty-night: #818CF8;    /* Purple */
--shifty-off: #94A3B8;      /* Gray */
```

### 특징
- **토스 스타일 Input**: 밝은 배경, 실시간 validation, 명확한 피드백
- Glass Morphism (반투명 블러)
- Toss Shadow (부드러운 그림자)
- 큰 border-radius (16-24px)
- 블루-퍼플 그라데이션

**자세한 내용**: 
- [TOSS_INPUT_CHANGELOG.md](./TOSS_INPUT_CHANGELOG.md) - 디자인 시스템 상세
- [guidelines/Guidelines.md](./guidelines/Guidelines.md) - **유지보수 가이드** ⭐

---

## 🔐 보안

- ✅ Supabase Auth 기반 안전한 인증
- ✅ HTTPS 암호화 통신
- ✅ Row Level Security (RLS) 적용
- ✅ 팀원만 데이터 접근 가능
- ✅ 최소한의 개인정보만 수집

---

## 📊 데이터 구조

```typescript
// 사용자
User {
  id: UUID
  email: string
  name: string
  hospital?: string
  department?: string
  position?: string
}

// 팀
Team {
  id: UUID
  name: string
  inviteCode: string  // 6자리
  createdBy: UUID
}

// 팀원
TeamMember {
  teamId: UUID
  userId: UUID
  role: string
  color: string
}

// 일정
Task {
  id: UUID
  title: string
  date: DateTime
  shiftType: 'day' | 'evening' | 'night' | 'off'
  assignedTo: UUID
  createdBy: UUID
}
```

---

## 🐛 문제 해결

### 데이터베이스 오류
```
❌ Could not find the table 'public.users'
```
→ [SETUP_TABLES.sql](./SETUP_TABLES.sql) 실행

### ⚠️ "User not found" 에러 ✅ 자동 해결됨!
```
❌ Create team error: User not found
```
**2024-11-03 업데이트**: 이제 자동으로 해결됩니다!

**해결 방법**:
1. **페이지 새로고침** (F5)
2. **다시 로그인**
3. 완료! 서버가 자동으로 프로필을 생성합니다 ✨

서버가 로그인 시 사용자 프로필이 없으면 자동으로 생성하도록 개선되었습니다.

여전히 문제가 있다면: [QUICK_FIX_USER.md](./QUICK_FIX_USER.md)

### 로그인 실패
- 이메일/비밀번호 확인
- 회원가입 완료 여부
- 브라우저 쿠키 허용
- 시크릿 모드에서 재시도

### 소셜 로그인 오류
- Supabase Provider 설정 확인
- Redirect URI 정확도
- 팝업 차단 해제

### 팀 생성/참여 실패
- 로그인 세션 확인
- 네트워크 연결 상태
- Supabase Functions 로그 확인

---

## 📞 문의

### 일반 문의
- **이메일**: shifty@98point7.com
- **개발 문의**: dev@98point7.com

### 개인정보 보호
- **보호책임자**: privacy@98point7.com

---

## 🙏 감사의 말

Shifty는 현장에서 고생하시는 모든 간호사분들을 위해 만들어졌습니다.

더 나은 근무 환경을 위해 작은 도움이 되길 바랍니다. 💙

---

<div align="center">

**교대근무, 이제 쉬프티하게** 🔄

Made with 💙 by **주식회사 98점7도**

[시작하기](#-빠른-시작) · [배포하기](./DEPLOY.md) · [설정 가이드](./SETUP.md)

</div>
