# 🏗️ 관리자 페이지 아키텍처 설계

## 📋 개요
관리자 페이지를 별도 도메인(예: `admin.shifty.ai`)으로 분리하되, API는 공유하는 구조로 설계합니다.

---

## 🎯 설계 원칙

### 1. 도메인 분리
- **메인 앱**: `shifty.ai` (또는 `app.shifty.ai`)
- **관리자 앱**: `admin.shifty.ai`
- 각각 독립적인 React 앱으로 구성

### 2. API 공유
- **동일한 서버 API 사용**: `https://[project-id].supabase.co/functions/v1/server`
- 관리자와 일반 사용자가 같은 API 엔드포인트 사용
- 권한은 서버에서 이메일/역할로 구분

### 3. 코드 공유
- **공통 컴포넌트**: `src/components/` 공유
- **공통 유틸리티**: `src/utils/` 공유
- **API 클라이언트**: `src/utils/api.ts` 공유

---

## 📁 파일 구조

```
src/
├── App.tsx                    # 메인 앱 (일반 사용자)
├── AdminApp.tsx              # 관리자 앱 (별도 앱)
├── admin-main.tsx            # 관리자 앱 진입점
├── admin.html                # 관리자 앱 HTML
├── main.tsx                  # 메인 앱 진입점
├── index.html                # 메인 앱 HTML
├── components/
│   ├── AdminDashboard.tsx    # 관리자 대시보드 (공유)
│   └── ...                   # 기타 공통 컴포넌트
└── utils/
    ├── api.ts                # API 클라이언트 (공유)
    └── ...                   # 기타 공통 유틸리티
```

---

## 🚀 개발 환경

### 로컬 개발
- **메인 앱**: `http://localhost:3000`
- **관리자 앱**: `http://localhost:3000/admin.html` (또는 별도 포트)

### Vite 설정
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './src/admin.html',
      },
    },
  },
});
```

---

## 🌐 배포 구조

### Vercel 배포
1. **메인 앱**
   - 도메인: `shifty.ai` (또는 `app.shifty.ai`)
   - 빌드: `npm run build` (index.html 기준)
   - 배포 경로: `/`

2. **관리자 앱**
   - 도메인: `admin.shifty.ai`
   - 빌드: `npm run build:admin` (admin.html 기준)
   - 배포 경로: `/`
   - 또는 같은 프로젝트에서 라우팅으로 분리

### 도메인 라우팅 (Vercel)
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "/admin.html"
    }
  ]
}
```

---

## 🔐 인증 및 권한

### 관리자 권한 확인
```typescript
// AdminApp.tsx
const ADMIN_EMAILS = [
  'yeomjw0907@onecation.co.kr',
  'yeomjw0907@naver.com',
  'admin@shifty.app'
];

// 로그인 시 이메일 확인
if (ADMIN_EMAILS.includes(user.email)) {
  // 관리자 접근 허용
}
```

### 서버 API 권한 확인
```typescript
// src/supabase/functions/server/index.tsx
const ADMIN_EMAILS = [
  'yeomjw0907@onecation.co.kr',
  'yeomjw0907@naver.com',
  'admin@shifty.app'
];

// API 엔드포인트에서 관리자 확인
if (!ADMIN_EMAILS.includes(userData.email)) {
  return c.json({ error: "Forbidden" }, 403);
}
```

---

## 📊 데이터 흐름

### 관리자 페이지 데이터
1. **공지사항** (`hospital_official_info` 테이블)
   - `GET /admin/hospitals/:hospitalId/posts?type=notice`
   - `POST /admin/hospitals/:hospitalId/posts`
   - `PATCH /admin/hospitals/:hospitalId/posts/:postId`
   - `DELETE /admin/hospitals/:hospitalId/posts/:postId`

2. **식단표** (`meal_menus` 테이블)
   - `GET /admin/hospitals/:hospitalId/posts?type=menu`
   - `POST /admin/hospitals/:hospitalId/posts` (postType: 'menu')
   - `PATCH /admin/hospitals/:hospitalId/posts/:postId`
   - `DELETE /admin/hospitals/:hospitalId/posts/:postId`

3. **관리자 권한 확인**
   - `GET /admin/hospitals/:hospitalId/status`

---

## 🔧 구현 단계

### 1단계: 문법 오류 수정 ✅
- [x] AdminDashboard.tsx 조건부 렌더링 수정

### 2단계: 관리자 앱 분리
- [x] AdminApp.tsx 생성
- [x] admin.html 생성
- [x] admin-main.tsx 생성
- [ ] vite.config.ts 빌드 설정
- [ ] 로컬 개발 서버 설정

### 3단계: 서버 API 구현
- [ ] 관리자 API 엔드포인트 구현
- [ ] 권한 확인 로직 구현
- [ ] 테스트

### 4단계: 배포 설정
- [ ] Vercel 배포 설정
- [ ] 도메인 라우팅 설정
- [ ] 환경 변수 설정

---

## 📝 접근 방법

### 로컬 개발
1. **메인 앱**: `http://localhost:3000`
2. **관리자 앱**: `http://localhost:3000/admin.html`

### 프로덕션
1. **메인 앱**: `https://shifty.ai`
2. **관리자 앱**: `https://admin.shifty.ai`

---

## ✅ 장점

1. **보안**: 관리자 페이지 분리로 접근 제어 용이
2. **확장성**: 추후 관리자 전용 기능 추가 용이
3. **유지보수**: 코드 공유로 중복 최소화
4. **배포**: 독립적인 배포 및 스케일링 가능

---

**마지막 업데이트**: 2024년 12월

