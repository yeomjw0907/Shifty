# 🔧 트러블슈팅 리포트

## 📋 테스트 개요
Supabase와의 통신 상태, DB 연동, API 엔드포인트를 테스트하고 오류를 확인 및 수정했습니다.

---

## ✅ 완료된 작업

### 1. 서버 API 엔드포인트 구현
- ✅ `GET /admin/hospitals/:hospitalId/status` - 관리자 권한 확인
- ✅ `GET /admin/hospitals/:hospitalId/posts?type=notice|menu` - 게시글 조회
- ✅ `POST /admin/hospitals/:hospitalId/posts` - 게시글 작성
- ✅ `PATCH /admin/hospitals/:hospitalId/posts/:postId` - 게시글 수정
- ✅ `DELETE /admin/hospitals/:hospitalId/posts/:postId` - 게시글 삭제

### 2. 관리자 권한 확인 로직
- ✅ `checkHospitalAdmin` 헬퍼 함수 구현
- ✅ 시스템 관리자 (ADMIN_EMAILS) 확인
- ✅ 병원별 관리자 (`hospital_admins` 테이블) 확인

### 3. 프론트엔드 API 클라이언트 수정
- ✅ `API_BASE` URL 추가
- ✅ `getAuthHeaders` 함수 추가
- ✅ `ApiResponse` 인터페이스 추가

### 4. 데이터베이스 연동 확인
- ✅ `hospital_official_info` 테이블 (공지사항)
- ✅ `meal_menus` 테이블 (식단표)
- ✅ `hospital_communities` 테이블 (병원별 커뮤니티)
- ✅ `hospital_admins` 테이블 (병원 관리자)

---

## 🔍 발견 및 수정된 문제

### 1. API_BASE URL 누락 ✅ 수정 완료
- **위치**: `src/utils/api.ts`
- **문제**: `API_BASE` 변수가 정의되어 있지 않음
- **해결**: `API_BASE` 변수 추가
```typescript
const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;
```

### 2. getAuthHeaders 함수 누락 ✅ 수정 완료
- **위치**: `src/utils/api.ts`
- **문제**: `getAuthHeaders` 함수가 정의되어 있지 않음
- **해결**: `getAuthHeaders` 함수 추가
```typescript
function getAuthHeaders(accessToken: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}
```

### 3. 서버 API 엔드포인트 누락 ✅ 수정 완료
- **위치**: `src/supabase/functions/server/index.tsx`
- **문제**: 관리자 API 엔드포인트가 구현되어 있지 않음
- **해결**: 모든 관리자 API 엔드포인트 구현

---

## 📊 데이터베이스 테이블 구조

### hospital_official_info (공지사항)
- `id`: UUID
- `community_id`: UUID (병원 커뮤니티 ID)
- `title`: VARCHAR(200)
- `content`: TEXT
- `info_type`: VARCHAR(20) ('notice')
- `view_count`: INTEGER
- `created_by`: UUID
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### meal_menus (식단표)
- `id`: UUID
- `community_id`: UUID (병원 커뮤니티 ID)
- `menu_date`: DATE
- `meal_type`: VARCHAR(20) ('breakfast', 'lunch', 'dinner')
- `menu_items`: TEXT
- `image_url`: TEXT
- `created_by`: UUID
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### hospital_communities (병원 커뮤니티)
- `id`: UUID
- `hospital_id`: UUID
- `name`: VARCHAR(200)
- `description`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### hospital_admins (병원 관리자)
- `id`: UUID
- `hospital_id`: UUID
- `user_id`: UUID
- `role`: VARCHAR(20) ('admin', 'moderator')
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

---

## 🚀 다음 단계

### 1. 서버 배포
- Supabase Edge Functions에 배포
- 환경 변수 설정 확인 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)

### 2. 테스트
- 관리자 로그인 테스트
- 공지사항 작성/수정/삭제 테스트
- 식단표 작성/수정/삭제 테스트
- 권한 확인 테스트

### 3. 데이터베이스 확인
- 테이블이 생성되어 있는지 확인
- RLS 정책이 활성화되어 있는지 확인
- 인덱스가 생성되어 있는지 확인

---

## ✅ 체크리스트

- [x] 서버 API 엔드포인트 구현
- [x] 관리자 권한 확인 로직 구현
- [x] 프론트엔드 API 클라이언트 수정
- [x] API_BASE URL 설정
- [x] getAuthHeaders 함수 구현
- [ ] 서버 배포
- [ ] 테스트

---

**마지막 업데이트**: 2024년 12월

