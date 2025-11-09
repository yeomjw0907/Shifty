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

### 관리자 계정 정보

**이메일**: `yeomjw0907@onecation.co.kr`  
**비밀번호**: `Onecation2024!`

### 로그인 방법

1. `http://localhost:3000/admin.html` 접속
2. 관리자 이메일: `yeomjw0907@onecation.co.kr` 입력
3. 비밀번호: `Onecation2024!` 입력
4. "관리자 로그인" 버튼 클릭
5. 로그인 성공 시 관리자 대시보드 표시

---

## 📱 PWA vs 웹 접근

### PWA (Progressive Web App)란?

PWA는 **웹 기술로 만들어진 앱**입니다. 따라서:

✅ **웹에서도 볼 수 있습니다**
- 일반 웹 브라우저에서 접근 가능
- URL로 직접 접근 가능
- 예: `http://localhost:3000` 또는 `https://shifty.ai`

✅ **앱처럼 설치할 수 있습니다**
- 모바일: 홈 화면에 추가
- 데스크톱: 브라우저에서 "앱 설치" 옵션
- 설치 후 앱처럼 실행 가능

### 차이점

| 구분 | 웹 접근 | 앱 설치 |
|------|---------|---------|
| 접근 방법 | 브라우저 URL 입력 | 홈 화면 아이콘 클릭 |
| 오프라인 | 제한적 | Service Worker로 오프라인 지원 |
| 푸시 알림 | 브라우저 알림 | 앱 알림 |
| 성능 | 일반 웹 | 최적화된 앱 성능 |

**결론**: PWA는 웹과 앱의 장점을 모두 가진 형태입니다. 웹에서도 볼 수 있고, 앱처럼 설치해서 사용할 수도 있습니다.

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

### 3. 사용자 관리
- **기능**: 사용자 조회, 수정, 삭제
- **표시 정보**: 사용자 정보, 팀 정보, 게시글, 댓글 등

### 4. 통계
- **기능**: 전체 통계, 병원별 통계, 커뮤니티 통계
- **표시 정보**: 사용자 수, 팀 수, 게시글 수, 일일 방문자 등

### 5. 팝업 관리
- **기능**: 팝업 생성, 수정, 삭제, 통계 확인
- **표시 정보**: 팝업 내용, 표시 조건, 통계 등

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
GET    /admin/users
GET    /admin/users/:userId
PATCH  /admin/users/:userId
DELETE /admin/users/:userId
GET    /admin/analytics/overview
GET    /admin/analytics/hospitals
GET    /admin/analytics/community
GET    /admin/popups
POST   /admin/popups
PATCH  /admin/popups/:id
DELETE /admin/popups/:id
GET    /admin/popups/:id/stats
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
- [x] 관리자 계정 정보 통일
- [ ] 로컬에서 `/admin.html` 접근 확인

### 서버 API
- [x] 관리자 API 엔드포인트 구현
- [x] 권한 확인 로직 구현
- [x] 테스트

### 배포
- [ ] Vercel 배포 설정
- [ ] 도메인 라우팅 설정
- [ ] 환경 변수 설정

---

## 🔐 보안 주의사항

1. **관리자 계정 보안**
   - 비밀번호는 정기적으로 변경
   - 2FA(2단계 인증) 활성화 권장

2. **접근 제한**
   - 관리자 페이지는 이메일 화이트리스트로 제한
   - 서버에서도 권한 확인

3. **로그 모니터링**
   - 관리자 접근 로그 확인
   - 의심스러운 활동 모니터링

---

**마지막 업데이트**: 2024년 12월
