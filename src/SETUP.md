# Shifty 설정 가이드 🔄

**Shifty**는 간호사를 위한 스마트 교대근무 관리 서비스입니다.

## 🚀 빠른 시작

### 1. Supabase 프로젝트 연결

이미 Supabase 프로젝트에 연결되어 있습니다! ✅

### 2. 데이터베이스 테이블 생성 (필수)

Supabase Dashboard → SQL Editor에서 다음 파일들을 순서대로 실행하세요:

#### Step 1: 테이블 생성
```sql
-- SETUP_TABLES.sql 파일 내용 복사 & 실행
```
- `users`, `teams`, `team_members`, `tasks`, `privacy_consents` 테이블 생성

#### Step 2: RLS 활성화 🔐
```sql
-- ENABLE_RLS.sql 파일 내용 복사 & 실행
```
- Row Level Security 활성화
- 보안 정책 설정
- **필수!** 이 단계를 건너뛰면 보안 취약점 발생

#### Step 3: 임시 DB 삭제 (선택사항)
```sql
-- DELETE_OLD_DB.sql 파일 내용 복사 & 실행
```
- 기존 `kv_store_3afd3c70` 테이블 제거

자세한 내용: [FIX_RLS_GUIDE.md](./FIX_RLS_GUIDE.md)

### 3. 소셜 로그인 설정 (선택 사항)

Shifty는 이메일/비밀번호 로그인과 함께 **카카오**, **구글**, **네이버** 소셜 로그인을 지원합니다.

#### 🟡 카카오 로그인 설정

1. **Kakao Developers** 접속
   - [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션 → 애플리케이션 추가

2. **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
   - 사이트 도메인: `https://your-app-url.com`

3. **제품 설정** → **카카오 로그인** → **Redirect URI 설정**
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

4. **Supabase Dashboard** → **Authentication** → **Providers** → **Kakao**
   - Client ID: REST API 키
   - Client Secret: 보안 탭의 Client Secret

5. **Enable** 토글 켜기

📖 **자세한 가이드**: https://supabase.com/docs/guides/auth/social-login/auth-kakao

#### 🔴 구글 로그인 설정

1. **Supabase Dashboard** 접속
   - [supabase.com](https://supabase.com) → 프로젝트 선택

2. **Authentication** → **Providers** → **Google** 선택

3. **Google Cloud Console**에서 OAuth 2.0 클라이언트 ID 생성
   - [console.cloud.google.com](https://console.cloud.google.com)
   - APIs & Services → Credentials → Create OAuth Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

4. Client ID와 Client Secret을 Supabase에 입력

5. **Enable** 토글 켜기

📖 **자세한 가이드**: https://supabase.com/docs/guides/auth/social-login/auth-google

#### 🟢 네이버 로그인 설정

1. **네이버 개발자 센터** 접속
   - [developers.naver.com](https://developers.naver.com) → 애플리케이션 등록

2. **애플리케이션 정보**
   - 애플리케이션 이름: Shifty
   - 사용 API: 네이버 로그인

3. **서비스 URL 및 Callback URL**
   - 서비스 URL: `https://your-app-url.com`
   - Callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

4. **제공 정보 선택**
   - 필수: 이메일, 이름 (닉네임)

5. **Supabase Dashboard** → **Authentication** → **Providers** → **Naver**
   - Client ID: 애플리케이션 정보의 Client ID
   - Client Secret: 애플리케이션 정보의 Client Secret

6. **Enable** 토글 켜기

📖 **자세한 가이드**: https://supabase.com/docs/guides/auth/social-login (Naver는 커스텀 설정 필요)

---

## 📱 PWA (Progressive Web App) 설치

Shifty는 PWA로 설치하여 앱처럼 사용할 수 있습니다.

### iOS (Safari)

1. Safari에서 Shifty 열기
2. 하단 공유 버튼 (□↑) 탭
3. "홈 화면에 추가" 선택
4. "추가" 탭

### Android (Chrome)

1. Chrome에서 Shifty 열기
2. 우측 상단 ⋮ 메뉴
3. "홈 화면에 추가" 선택
4. "추가" 탭

### Desktop (Chrome/Edge)

1. 주소창 우측의 설치 아이콘 클릭
2. "설치" 버튼 클릭

---

## 🎯 주요 기능

### 1. 교대근무 관리
- **Day** (데이): 오전 근무 🌞
- **Evening** (이브닝): 오후 근무 🌆
- **Night** (나이트): 야간 근무 🌙
- **Off** (휴무): 쉬는 날 ☁️

### 2. 팀 협업
- 초대 코드로 팀원 추가
- 실시간 일정 동기화
- 팀 전체 스케줄 보기

### 3. 캘린더 연동
- Google Calendar
- Apple Calendar (iCloud)
- Notion Calendar

일정 내보내기 → .ics 파일 다운로드 → 캘린더에 가져오기

### 4. 다양한 뷰
- **팀 뷰**: 전체 팀원 스케줄 한눈에
- **캘린더 뷰**: 월간 캘린더
- **리스트 뷰**: 일정 목록
- **멤버 관리**: 팀원 추가/수정/삭제

---

## 🛠 데이터 구조

### Supabase KV Store

```typescript
// 사용자 프로필
user:{userId} = {
  id: string,
  email: string,
  name: string,
  createdAt: string
}

// 팀 정보
team:{teamId} = {
  id: string,
  name: string,
  inviteCode: string,  // 6자리 대문자
  createdBy: string,
  memberIds: string[]
}

// 초대 코드 매핑
team:invite:{code} = teamId

// 팀원
member:{teamId}:{memberId} = {
  id: string,
  name: string,
  color: string,
  role: string,
  email: string
}

// 일정/교대근무
task:{teamId}:{taskId} = {
  id: string,
  title: string,
  date: string (ISO),
  shiftType: 'day' | 'evening' | 'night' | 'off',
  assignedTo: string,
  createdBy: string,
  completed: boolean
}
```

---

## 🛡️ 관리자 대시보드 설정

Shifty는 **관리자 전용 대시보드**를 제공하며, 일반 사용자는 접근할 수 없습니다.

### 1. 관리자 계정 설정

**`/AdminApp.tsx`** 파일을 열고 관리자 이메일 추가:

```typescript
const ADMIN_EMAILS = [
  'admin@shifty.app',
  'your-admin@example.com', // 여기에 관리자 이메일 추가
];
```

**`/supabase/functions/server/index.tsx`** 파일에도 동일하게 추가:

```typescript
const ADMIN_EMAILS = [
  'admin@shifty.app',
  'your-admin@example.com', // 동일한 이메일 추가
];
```

### 2. 도메인 분리 (배포 시)

관리자 대시보드는 **별도 도메인**으로 분리하는 것을 권장합니다:

- **메인 앱**: `https://shifty.app` → `App.tsx`
- **관리자**: `https://admin.shifty.app` → `AdminApp.tsx`

#### Vercel 배포 예시

```json
// vercel.json
{
  "routes": [
    {
      "src": "/admin(.*)",
      "dest": "/AdminApp.tsx"
    },
    {
      "src": "/(.*)",
      "dest": "/App.tsx"
    }
  ]
}
```

### 3. 관리자 로그인

1. 관리자 이메일로 Shifty 회원가입
2. `admin.shifty.app` (또는 `/admin`)에서 로그인
3. 대시보드에서 통계 확인

### 4. 보안 주의사항

⚠️ **중요**:
- 관리자 이메일은 절대 공개하지 마세요
- 서버 코드에 하드코딩된 이메일 목록으로만 접근 제어
- 일반 사용자가 관리자 API를 호출해도 403 Forbidden 응답

---

## 🔐 보안

- ✅ Supabase Auth로 안전한 인증
- ✅ Row Level Security (RLS) - 팀원만 데이터 접근
- ✅ Access Token 기반 API 호출
- ✅ HTTPS 암호화 통신
- ✅ 관리자 이메일 화이트리스트 (Admin only)

---

## 🎨 디자인 시스템

### 브랜드 컬러

```css
Primary: #3B82F6 (Blue)
Day: #FCD34D (Yellow)
Evening: #FB923C (Orange)
Night: #818CF8 (Purple)
Off: #94A3B8 (Gray)
```

### 타이포그래피
- Toss-inspired 미니멀 디자인
- 글래스모피즘 효과
- 부드러운 애니메이션

---

## 📊 API 엔드포인트

### Authentication
```
POST /auth/signup - 회원가입
POST /auth/signin - 로그인 (클라이언트에서 처리)
```

### Teams
```
POST /teams - 팀 생성
GET /teams/:teamId - 팀 조회
PATCH /teams/:teamId - 팀 이름 수정
POST /teams/join - 초대 코드로 참여
```

### Members
```
POST /teams/:teamId/members - 멤버 추가
GET /teams/:teamId/members - 멤버 목록
DELETE /teams/:teamId/members/:memberId - 멤버 삭제
```

### Tasks
```
POST /teams/:teamId/tasks - 일정 생성
GET /teams/:teamId/tasks - 일정 목록
PATCH /teams/:teamId/tasks/:taskId - 일정 수정
DELETE /teams/:teamId/tasks/:taskId - 일정 삭제
```

---

## 🐛 문제 해결

### 로그인이 안 돼요
1. 이메일과 비밀번호를 확인하세요
2. 회원가입을 먼저 진행했는지 확인하세요
3. 브라우저 쿠키가 허용되어 있는지 확인하세요

### 소셜 로그인이 안 돼요
1. Supabase에서 Provider 설정을 완료했는지 확인
2. Redirect URI가 정확한지 확인
3. 브라우저 팝업 차단 설정 확인

### 팀 초대 코드가 안 먹혀요
1. 초대 코드를 정확히 입력했는지 확인 (6자리)
2. 대소문자는 구분하지 않습니다
3. 공백이 들어가지 않았는지 확인

### 데이터가 동기화 안 돼요
1. 인터넷 연결 상태 확인
2. 로그아웃 후 다시 로그인
3. "데이터 초기화" 버튼으로 리셋 (주의: 모든 데이터 삭제됨)

---

## 💡 팁 & 트릭

### 빠른 교대근무 추가
캘린더 뷰의 Quick Shift Widget을 사용하면 클릭 한 번으로 교대근무를 추가할 수 있습니다!

### 드럼 피커로 시간 선택
일정 추가 시 iOS 스타일의 드럼 피커로 시간을 선택할 수 있습니다.

### 캘린더 내보내기
Google Calendar, Apple Calendar, Notion과 연동하려면:
1. 헤더의 캘린더 아이콘 클릭
2. "내보내기" 선택
3. .ics 파일 다운로드
4. 해당 캘린더 앱에서 가져오기

### 팀 스케줄 공유
팀 뷰에서 스크린샷을 찍어 카카오톡/슬랙으로 공유하세요!

---

## 📞 지원

문제가 있거나 기능 제안이 있으시면:
- GitHub Issues: [링크]
- 이메일: shifty@example.com

---

**Shifty로 스마트하게 교대근무를 관리하세요!** 🔄💙
