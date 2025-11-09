# 관리자 기능 설정 가이드

## 개요
병원 커뮤니티의 공지사항과 식단표를 관리할 수 있는 관리자 기능입니다.

## 1. DB 설정

### 1.1 관리자 테이블 생성
`src/SETUP_ADMIN_TABLES.sql` 파일을 Supabase SQL Editor에서 실행하세요.

이 파일은 다음 테이블을 생성합니다:
- `hospital_admins`: 병원 관리자 정보
- `community_reports`: 신고 관리
- `hospital_settings`: 병원 커뮤니티 설정

### 1.2 관리자 계정 생성
```sql
-- 사용자를 관리자로 지정
INSERT INTO hospital_admins (hospital_id, user_id, role)
VALUES (
  '병원_ID',
  (SELECT id FROM users WHERE auth_id = '사용자_auth_id'),
  'admin'
);
```

## 2. API 엔드포인트

서버에 다음 엔드포인트가 추가되었습니다:

### 2.1 관리자 권한 확인
```
GET /admin/hospitals/:hospitalId/status
```

### 2.2 공지사항/식단표 조회
```
GET /admin/hospitals/:hospitalId/posts?type=notice|menu
```

### 2.3 공지사항/식단표 작성
```
POST /admin/hospitals/:hospitalId/posts
Body: {
  title: string,
  content: string,
  postType: 'notice' | 'menu',
  menuDate?: string,  // 식단표용
  mealType?: 'breakfast' | 'lunch' | 'dinner'  // 식단표용
}
```

### 2.4 공지사항/식단표 수정
```
PATCH /admin/hospitals/:hospitalId/posts/:postId
Body: {
  title?: string,
  content?: string
}
```

### 2.5 공지사항/식단표 삭제
```
DELETE /admin/hospitals/:hospitalId/posts/:postId
```

## 3. 프론트엔드 사용법

### 3.1 관리자 대시보드 접근
- 관리자 권한이 있는 사용자는 커뮤니티 페이지에서 "관리자" 버튼이 표시됩니다.
- 클릭하면 `AdminDashboard` 컴포넌트로 이동합니다.

### 3.2 공지사항 관리
1. "공지사항" 탭 선택
2. "새 공지사항" 버튼 클릭
3. 제목과 내용 입력 후 작성

### 3.3 식단표 관리
1. "식단표" 탭 선택
2. "새 식단표" 버튼 클릭
3. 날짜, 식사 종류(아침/점심/저녁), 제목, 내용 입력 후 작성

## 4. 코드 최적화

### 4.1 적용된 최적화
- `useMemo`로 `filteredPosts`, `displayedPosts`, `categories` 메모이제이션
- `useCallback`으로 이벤트 핸들러 메모이제이션
- 불필요한 리렌더링 방지

### 4.2 성능 개선 효과
- 필터링/정렬 연산 최소화
- 스크롤 이벤트 핸들러 최적화
- 컴포넌트 리렌더링 감소

## 5. 향후 개선 사항

1. **병원 공식 정보 자동 연동**
   - 병원 웹사이트 크롤링
   - 공공데이터 API 연동
   - RSS 피드 연동

2. **식단표 자동 업데이트**
   - 병원 식당 시스템 연동
   - 이미지 OCR을 통한 식단표 인식
   - 스케줄링을 통한 자동 업데이트

3. **관리자 권한 세분화**
   - 공지사항 관리자
   - 식단표 관리자
   - 커뮤니티 모더레이터

4. **신고 관리 시스템**
   - 신고 목록 조회
   - 신고 처리 (삭제/경고/무시)
   - 자동 모더레이션

