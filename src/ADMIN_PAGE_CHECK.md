# 🔍 관리자 페이지 확인 보고서

## 📋 현재 상태

### ✅ 구현된 부분
1. **AdminDashboard 컴포넌트** (`src/components/AdminDashboard.tsx`)
   - 공지사항 관리 탭
   - 식단표 관리 탭
   - 설정 탭 (플레이스홀더)
   - 게시글 작성/수정/삭제 UI

2. **API 클라이언트** (`src/utils/api.ts`)
   - `getAdminPosts()` - 게시글 조회
   - `createAdminPost()` - 게시글 작성
   - `updateAdminPost()` - 게시글 수정
   - `deleteAdminPost()` - 게시글 삭제
   - `checkAdminStatus()` - 관리자 권한 확인

### ❌ 누락된 부분
1. **서버 API 엔드포인트**
   - `GET /admin/hospitals/:hospitalId/posts` - 없음
   - `POST /admin/hospitals/:hospitalId/posts` - 없음
   - `PATCH /admin/hospitals/:hospitalId/posts/:postId` - 없음
   - `DELETE /admin/hospitals/:hospitalId/posts/:postId` - 없음
   - `GET /admin/hospitals/:hospitalId/status` - 없음

2. **App.tsx에서 관리자 페이지 접근**
   - 관리자 뷰가 없음
   - Header/BottomNavigation에 관리자 탭 없음

3. **관리자 권한 확인**
   - `currentHospitalId` 전달 필요
   - 관리자 권한 확인 로직 필요

---

## 🔧 필요한 작업

### 1. 서버 API 엔드포인트 구현
`src/supabase/functions/server/index.tsx`에 다음 엔드포인트 추가:

```typescript
// GET /admin/hospitals/:hospitalId/posts
// POST /admin/hospitals/:hospitalId/posts
// PATCH /admin/hospitals/:hospitalId/posts/:postId
// DELETE /admin/hospitals/:hospitalId/posts/:postId
// GET /admin/hospitals/:hospitalId/status
```

### 2. App.tsx에 관리자 뷰 추가
- `view` state에 `'admin'` 추가
- 관리자 권한 확인 로직
- `AdminDashboard` 컴포넌트 렌더링

### 3. Header/BottomNavigation에 관리자 탭 추가
- 관리자 권한이 있는 경우에만 표시
- 관리자 탭 클릭 시 `view`를 `'admin'`으로 변경

### 4. 관리자 권한 확인
- 사용자의 `hospital_id` 확인
- `hospital_admins` 테이블에서 관리자 권한 확인
- 또는 `ADMIN_EMAILS`에 포함된 이메일 확인

---

## 📊 데이터 구조

### AdminPost 인터페이스
```typescript
interface AdminPost {
  id: string;
  title: string;
  content: string;
  postType: 'notice' | 'menu';
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}
```

### 필요한 데이터
1. **공지사항** (`postType: 'notice'`)
   - `hospital_official_info` 테이블에서 조회
   - `info_type = 'notice'`

2. **식단표** (`postType: 'menu'`)
   - `meal_menus` 테이블에서 조회
   - 날짜, 식사 종류별 조회

---

## 🚀 다음 단계

1. 서버 API 엔드포인트 구현
2. App.tsx에 관리자 뷰 추가
3. Header/BottomNavigation에 관리자 탭 추가
4. 관리자 권한 확인 로직 구현
5. 테스트

---

**마지막 업데이트**: 2024년 12월

