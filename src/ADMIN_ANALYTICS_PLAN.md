# 📊 관리자 통계 및 분석 기능 계획

## 📋 개요
관리자 페이지에 커뮤니티 통계, 사용자 활동 분석, 팝업 관리 기능을 추가합니다.

---

## 📊 필요한 통계 데이터 리스트

### 1. 전체 통계 (Dashboard Overview)
- ✅ 총 가입자 수
- ✅ 총 팀 수
- ✅ 총 게시글 수
- ✅ 총 댓글 수
- ✅ 일일 방문자 수 (신규/재방문)
- ✅ 주간/월간 방문자 수 추이
- ✅ 활성 사용자 수 (최근 7일/30일)
- ✅ 신규 가입자 추이 (일별/주별/월별)

### 2. 병원별 통계
- ✅ 병원별 가입자 수
- ✅ 병원별 활성 사용자 수
- ✅ 병원별 커뮤니티 활동
  - 게시글 수 (공지사항, 식단표, 블라인드)
  - 댓글 수
  - 좋아요 수
- ✅ 병원별 팀 수
- ✅ 병원별 근무 스케줄 수

### 3. 커뮤니티 통계
- ✅ 일일 게시글/댓글 수
- ✅ 카테고리별 게시글 분포
- ✅ 인기 게시글 (조회수, 좋아요 기준)
- ✅ 게시글 작성자 분포
- ✅ 댓글 활동 통계

### 4. 사용자 활동 통계
- ✅ 일일 로그인 수
- ✅ 사용자 세션 통계
- ✅ 기능별 사용 통계
  - 팀 생성/가입
  - 근무 추가
  - 게시글 작성
  - 댓글 작성

### 5. 팝업 관리
- ✅ 팝업 생성/수정/삭제
- ✅ 팝업 표시 조건 설정
  - 표시 기간
  - 대상 사용자 (전체/특정 병원/신규 사용자)
  - 표시 빈도
- ✅ 팝업 통계
  - 조회수
  - 클릭수
  - 닫기 수

---

## 🗄️ 필요한 데이터베이스 테이블

### 1. `user_visits` (사용자 방문 기록)
```sql
CREATE TABLE user_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  visit_date DATE NOT NULL,
  visit_time TIMESTAMPTZ DEFAULT NOW(),
  page_path VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  is_new_visit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `admin_popups` (관리자 팝업)
```sql
CREATE TABLE admin_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  popup_type VARCHAR(20) DEFAULT 'info', -- 'info', 'promotion', 'notice', 'event'
  target_audience VARCHAR(20) DEFAULT 'all', -- 'all', 'new_users', 'specific_hospital'
  target_hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  display_frequency VARCHAR(20) DEFAULT 'once', -- 'once', 'daily', 'always'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `popup_interactions` (팝업 상호작용 기록)
```sql
CREATE TABLE popup_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id UUID REFERENCES admin_popups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL, -- 'view', 'click', 'close'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `user_sessions` (사용자 세션)
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 구현 단계

### Phase 1: 데이터베이스 테이블 생성
1. `user_visits` 테이블 생성
2. `admin_popups` 테이블 생성
3. `popup_interactions` 테이블 생성
4. `user_sessions` 테이블 생성
5. 인덱스 및 RLS 정책 설정

### Phase 2: 서버 API 엔드포인트
1. 통계 조회 API
   - `GET /admin/analytics/overview` - 전체 통계
   - `GET /admin/analytics/hospitals` - 병원별 통계
   - `GET /admin/analytics/community` - 커뮤니티 통계
   - `GET /admin/analytics/users` - 사용자 활동 통계
2. 팝업 관리 API
   - `GET /admin/popups` - 팝업 목록
   - `POST /admin/popups` - 팝업 생성
   - `PATCH /admin/popups/:id` - 팝업 수정
   - `DELETE /admin/popups/:id` - 팝업 삭제
   - `GET /admin/popups/:id/stats` - 팝업 통계

### Phase 3: 프론트엔드 UI
1. AdminDashboard에 "통계" 탭 추가
2. 통계 대시보드 컴포넌트
3. 팝업 관리 컴포넌트
4. 차트/그래프 컴포넌트 (선택사항)

---

## 📈 통계 데이터 수집 방법

### 1. 방문자 수 추적
- 클라이언트에서 페이지 로드 시 `user_visits` 테이블에 기록
- Edge Function 또는 클라이언트에서 직접 기록

### 2. 세션 추적
- 로그인 시 세션 시작
- 로그아웃 또는 일정 시간 후 세션 종료

### 3. 팝업 상호작용
- 팝업 표시 시 `view` 기록
- 클릭 시 `click` 기록
- 닫기 시 `close` 기록

---

## 🎯 우선순위

### 높음 (필수)
1. 전체 통계 (가입자 수, 팀 수, 게시글 수)
2. 병원별 통계
3. 팝업 관리 (생성/수정/삭제)

### 중간
4. 일일 방문자 수
5. 커뮤니티 통계
6. 팝업 통계

### 낮음 (추후)
7. 상세 사용자 활동 분석
8. 세션 추적
9. 고급 차트/그래프

---

**마지막 업데이트**: 2024년 12월

