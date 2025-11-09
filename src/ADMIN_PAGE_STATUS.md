# 🔍 관리자 페이지 상태 확인 보고서

## 📊 현재 상태

### ✅ 구현된 부분

1. **AdminDashboard 컴포넌트** (`src/components/AdminDashboard.tsx`)
   - ✅ 공지사항 관리 탭
   - ✅ 식단표 관리 탭
   - ✅ 설정 탭 (플레이스홀더)
   - ✅ 게시글 작성/수정/삭제 UI
   - ✅ 로딩 상태 처리
   - ✅ 에러 핸들링

2. **API 클라이언트** (`src/utils/api.ts`)
   - ✅ `getAdminPosts()` - 게시글 조회
   - ✅ `createAdminPost()` - 게시글 작성
   - ✅ `updateAdminPost()` - 게시글 수정
   - ✅ `deleteAdminPost()` - 게시글 삭제
   - ✅ `checkAdminStatus()` - 관리자 권한 확인

3. **서버 API** (`src/supabase/functions/server/index.tsx`)
   - ✅ `GET /admin/stats` - 관리자 통계 (시스템 전체)
   - ❌ `GET /admin/hospitals/:hospitalId/posts` - **없음**
   - ❌ `POST /admin/hospitals/:hospitalId/posts` - **없음**
   - ❌ `PATCH /admin/hospitals/:hospitalId/posts/:postId` - **없음**
   - ❌ `DELETE /admin/hospitals/:hospitalId/posts/:postId` - **없음**
   - ❌ `GET /admin/hospitals/:hospitalId/status` - **없음**

### ❌ 누락된 부분

1. **서버 API 엔드포인트**
   - 병원별 관리자 API 엔드포인트가 없음
   - 공지사항/식단표 CRUD API 없음
   - 관리자 권한 확인 API 없음

2. **App.tsx에서 관리자 페이지 접근**
   - `view` state에 `'admin'` 없음
   - `AdminDashboard` 컴포넌트 렌더링 없음
   - 관리자 권한 확인 로직 없음

3. **Header/BottomNavigation**
   - 관리자 탭 없음
   - 관리자 페이지로 이동하는 버튼 없음

4. **데이터 연결**
   - `currentHospitalId` 전달 필요
   - 사용자의 `hospital_id` 확인 필요

---

## 📋 관리자 페이지에서 볼 수 있는 데이터

### 1. 공지사항 (Notice)
- **데이터 소스**: `hospital_official_info` 테이블
- **필터**: `info_type = 'notice'`
- **표시 정보**:
  - 제목 (`title`)
  - 내용 (`content`)
  - 작성일 (`created_at`)
  - 조회수 (`view_count`)
  - 좋아요 수 (`like_count`)
  - 댓글 수 (`comment_count`)

### 2. 식단표 (Menu)
- **데이터 소스**: `meal_menus` 테이블
- **필터**: `community_id` (병원별)
- **표시 정보**:
  - 날짜 (`menu_date`)
  - 식사 종류 (`meal_type`: breakfast/lunch/dinner)
  - 메뉴 항목 (`menu_items`)
  - 이미지 URL (`image_url`)
  - 작성일 (`created_at`)

### 3. 설정 (Settings)
- **데이터 소스**: `hospital_settings` 테이블
- **표시 정보**:
  - 익명 게시글 허용 여부
  - 게시글 승인 필요 여부
  - 자동 모더레이션 키워드
  - 배너 이미지/링크
  - 커스텀 규칙

---

## 🔧 필요한 작업

### 1. 서버 API 엔드포인트 구현 (우선순위: 높음)

다음 엔드포인트를 `src/supabase/functions/server/index.tsx`에 추가:

```typescript
// 1. 관리자 권한 확인
GET /admin/hospitals/:hospitalId/status

// 2. 게시글 조회
GET /admin/hospitals/:hospitalId/posts?type=notice|menu

// 3. 게시글 작성
POST /admin/hospitals/:hospitalId/posts
Body: {
  title: string,
  content: string,
  postType: 'notice' | 'menu',
  menuDate?: string,
  mealType?: 'breakfast' | 'lunch' | 'dinner'
}

// 4. 게시글 수정
PATCH /admin/hospitals/:hospitalId/posts/:postId
Body: {
  title?: string,
  content?: string
}

// 5. 게시글 삭제
DELETE /admin/hospitals/:hospitalId/posts/:postId
```

### 2. App.tsx에 관리자 뷰 추가

- `view` state에 `'admin'` 추가
- 관리자 권한 확인 로직 추가
- `AdminDashboard` 컴포넌트 렌더링
- `currentHospitalId` 전달

### 3. Header/BottomNavigation에 관리자 탭 추가

- 관리자 권한이 있는 경우에만 표시
- 관리자 탭 클릭 시 `view`를 `'admin'`으로 변경

### 4. 사용자 데이터 확인

- `currentUser`에 `hospital_id` 포함 여부 확인
- `loadUserData`에서 `hospital_id` 로드 확인

---

## 🚀 다음 단계

1. **서버 API 엔드포인트 구현** (가장 중요)
2. **App.tsx에 관리자 뷰 추가**
3. **Header/BottomNavigation에 관리자 탭 추가**
4. **테스트**

---

**마지막 업데이트**: 2024년 12월

