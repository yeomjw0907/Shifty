# 🔐 관리자 페이지 접근 가이드

## 📋 개요
관리자 페이지는 별도 도메인(`admin.shifty.ai`)으로 분리되며, API는 메인 앱과 공유합니다.

---

## 🚀 로컬 개발 환경

### 접근 방법

1. **메인 앱**
   - URL: `http://localhost:3000`
   - 일반 사용자용

2. **관리자 앱**
   - URL: `http://localhost:3000/admin.html`
   - 관리자 전용

### 개발 서버 실행

```bash
npm run dev
```

서버 실행 후:
- 메인 앱: `http://localhost:3000`
- 관리자 앱: `http://localhost:3000/admin.html`

---

## 🔑 관리자 로그인

### 관리자 이메일
- `yeomjw0907@onecation.co.kr`
- `yeomjw0907@naver.com`
- `admin@shifty.app`

### 로그인 방법
1. `http://localhost:3000/admin.html` 접속
2. 관리자 이메일과 비밀번호 입력
3. 로그인 성공 시 관리자 대시보드 표시

---

## 📊 관리자 페이지 기능

### 1. 공지사항 관리
- **데이터 소스**: `hospital_official_info` 테이블
- **기능**: 작성, 수정, 삭제
- **표시 정보**: 제목, 내용, 작성일, 조회수, 좋아요 수, 댓글 수

### 2. 식단표 관리
- **데이터 소스**: `meal_menus` 테이블
- **기능**: 작성, 수정, 삭제
- **표시 정보**: 날짜, 식사 종류(아침/점심/저녁), 메뉴 항목

### 3. 설정
- **데이터 소스**: `hospital_settings` 테이블
- **기능**: 추후 구현 예정

---

## 🌐 프로덕션 배포

### 도메인 구조
- **메인 앱**: `shifty.ai` (또는 `app.shifty.ai`)
- **관리자 앱**: `admin.shifty.ai`

### 배포 방법
1. **Vercel 배포**
   - 메인 앱과 관리자 앱을 별도 프로젝트로 배포
   - 또는 같은 프로젝트에서 라우팅으로 분리

2. **도메인 설정**
   - `admin.shifty.ai` → 관리자 앱 프로젝트 연결
   - `shifty.ai` → 메인 앱 프로젝트 연결

---

## 🔧 API 공유

### 공유 API 엔드포인트
- **기본 URL**: `https://[project-id].supabase.co/functions/v1/server`
- **인증**: 동일한 Supabase Auth 사용
- **권한**: 서버에서 이메일/역할로 구분

### 관리자 API 엔드포인트
```
GET    /admin/hospitals/:hospitalId/posts?type=notice|menu
POST   /admin/hospitals/:hospitalId/posts
PATCH  /admin/hospitals/:hospitalId/posts/:postId
DELETE /admin/hospitals/:hospitalId/posts/:postId
GET    /admin/hospitals/:hospitalId/status
```

---

## 📝 파일 구조

```
src/
├── App.tsx              # 메인 앱 (일반 사용자)
├── AdminApp.tsx         # 관리자 앱 (별도 앱)
├── admin-main.tsx       # 관리자 앱 진입점
├── admin.html          # 관리자 앱 HTML
├── main.tsx            # 메인 앱 진입점
├── index.html          # 메인 앱 HTML
└── components/
    ├── AdminDashboard.tsx  # 관리자 대시보드 (공유)
    └── ...
```

---

## ✅ 체크리스트

### 로컬 개발
- [x] 문법 오류 수정
- [x] AdminApp.tsx 생성
- [x] admin.html 생성
- [x] admin-main.tsx 생성
- [ ] 로컬에서 `/admin.html` 접근 확인

### 서버 API
- [ ] 관리자 API 엔드포인트 구현
- [ ] 권한 확인 로직 구현
- [ ] 테스트

### 배포
- [ ] Vercel 배포 설정
- [ ] 도메인 라우팅 설정
- [ ] 환경 변수 설정

---

**마지막 업데이트**: 2024년 12월

