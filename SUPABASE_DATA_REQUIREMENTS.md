# Supabase 데이터 수집 및 CRUD 요구사항 문서

## 📋 목차
1. [데이터베이스 스키마](#데이터베이스-스키마)
2. [CRUD 작업 목록](#crud-작업-목록)
3. [API 엔드포인트 요구사항](#api-엔드포인트-요구사항)
4. [인증 및 권한 관리](#인증-및-권한-관리)
5. [데이터 수집 항목 상세](#데이터-수집-항목-상세)

---

## 데이터베이스 스키마

### 1. users (사용자)
**목적**: 사용자 기본 정보 및 프로필 관리

**필수 필드**:
- `id` (UUID, Primary Key)
- `auth_id` (UUID, Unique) - Supabase Auth의 user.id와 연결
- `email` (VARCHAR, Unique, Not Null)
- `name` (VARCHAR, Not Null)
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `hospital` (VARCHAR) - 근무 병원명
- `department` (VARCHAR) - 부서명
- `position` (VARCHAR) - 직책
- `phone` (VARCHAR) - 전화번호
- `avatar_url` (TEXT) - 프로필 이미지 URL
- `color` (VARCHAR) - 프로필 색상 (기본값: '#3B82F6')

**인덱스**:
- `idx_users_auth_id` - auth_id 조회 최적화
- `idx_users_email` - 이메일 조회 최적화
- `idx_users_hospital` - 병원별 조회 최적화

---

### 2. teams (팀)
**목적**: 교대근무 팀 관리

**필수 필드**:
- `id` (UUID, Primary Key)
- `name` (VARCHAR, Not Null) - 팀 이름
- `invite_code` (VARCHAR(10), Unique, Not Null) - 6자리 초대 코드
- `created_by` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `hospital` (VARCHAR) - 병원명
- `department` (VARCHAR) - 부서명
- `description` (TEXT) - 팀 설명

**인덱스**:
- `idx_teams_invite_code` - 초대 코드 조회 최적화
- `idx_teams_created_by` - 생성자별 조회 최적화
- `idx_teams_hospital` - 병원별 조회 최적화

---

### 3. team_members (팀원)
**목적**: 팀과 사용자의 다대다 관계, 팀원별 역할 및 설정

**필수 필드**:
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams.id, Not Null)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `joined_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `role` (VARCHAR, Default: 'member') - 'owner', 'admin', 'member'
- `color` (VARCHAR) - 팀원별 표시 색상

**제약조건**:
- `UNIQUE(team_id, user_id)` - 한 사용자는 한 팀에 한 번만 가입 가능

**인덱스**:
- `idx_team_members_team_id` - 팀별 멤버 조회
- `idx_team_members_user_id` - 사용자별 팀 조회

---

### 4. tasks (일정/교대근무)
**목적**: 개인 일정 및 교대근무 스케줄 관리

**필수 필드**:
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams.id, Not Null)
- `user_id` (UUID, Foreign Key → users.id, Not Null) - 할당된 사용자
- `title` (VARCHAR, Not Null) - 일정 제목
- `date` (DATE, Not Null) - 시작 날짜
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `description` (TEXT) - 일정 설명
- `shift_type` (VARCHAR) - 'day', 'evening', 'night', 'off'
- `start_time` (TIME) - 시작 시간
- `end_time` (TIME) - 종료 시간
- `end_date` (DATE) - 종료 날짜 (기간 일정)
- `is_all_day` (BOOLEAN, Default: false) - 종일 일정 여부
- `completed` (BOOLEAN, Default: false) - 완료 여부
- `category` (VARCHAR) - 'work', 'personal', 'health', 'other'
- `color` (VARCHAR) - 일정 색상
- `location` (VARCHAR) - 장소
- `notes` (TEXT) - 메모
- `created_by` (UUID, Foreign Key → users.id) - 생성자

**인덱스**:
- `idx_tasks_team_id` - 팀별 일정 조회
- `idx_tasks_user_id` - 사용자별 일정 조회
- `idx_tasks_date` - 날짜별 조회
- `idx_tasks_shift_type` - 교대근무 타입별 조회
- `idx_tasks_team_date` - 팀+날짜 복합 조회

---

### 5. board_posts (게시판 게시글)
**목적**: 팀 내 공지사항 및 메시지

**필수 필드**:
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams.id, Not Null)
- `author_id` (UUID, Foreign Key → users.id, Not Null)
- `content` (TEXT, Not Null) - 게시글 내용
- `type` (VARCHAR, Not Null) - 'notice', 'message'
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `is_pinned` (BOOLEAN, Default: false) - 고정 여부
- `view_count` (INTEGER, Default: 0) - 조회수
- `like_count` (INTEGER, Default: 0) - 좋아요 수
- `comment_count` (INTEGER, Default: 0) - 댓글 수

**인덱스**:
- `idx_board_posts_team_id` - 팀별 게시글 조회
- `idx_board_posts_author_id` - 작성자별 조회
- `idx_board_posts_created_at` - 최신순 정렬

---

### 6. admin_posts (관리자 게시글)
**목적**: 병원 관리자의 공지사항 및 식단표

**필수 필드**:
- `id` (UUID, Primary Key)
- `hospital_id` (UUID/VARCHAR) - 병원 식별자
- `author_id` (UUID, Foreign Key → users.id, Not Null)
- `title` (VARCHAR, Not Null) - 제목
- `content` (TEXT, Not Null) - 내용
- `post_type` (VARCHAR, Not Null) - 'notice', 'menu'
- `created_at` (TIMESTAMPTZ, Default: NOW())
- `updated_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `menu_date` (DATE) - 식단표 날짜 (post_type='menu'일 때)
- `meal_type` (VARCHAR) - 'breakfast', 'lunch', 'dinner', 'snack'
- `view_count` (INTEGER, Default: 0)
- `like_count` (INTEGER, Default: 0)
- `comment_count` (INTEGER, Default: 0)

**인덱스**:
- `idx_admin_posts_hospital_id` - 병원별 조회
- `idx_admin_posts_post_type` - 타입별 조회
- `idx_admin_posts_menu_date` - 식단표 날짜별 조회

---

### 7. privacy_consents (개인정보 동의)
**목적**: 개인정보 처리방침 동의 기록

**필수 필드**:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `consent_version` (VARCHAR, Not Null) - 동의 버전
- `consented_at` (TIMESTAMPTZ, Default: NOW())

**선택 필드**:
- `ip_address` (VARCHAR) - 동의 시 IP 주소
- `user_agent` (TEXT) - 브라우저 정보

**인덱스**:
- `idx_privacy_consents_user_id` - 사용자별 조회

---

## CRUD 작업 목록

### Users (사용자)

#### Create
- **회원가입**: Supabase Auth 가입 후 users 테이블에 프로필 생성
- **필수 수집**: email, name, auth_id
- **선택 수집**: hospital, department, position, phone

#### Read
- **내 프로필 조회**: auth_id로 본인 정보 조회
- **다른 사용자 조회**: user_id로 팀원 정보 조회 (제한된 정보만)
- **병원별 사용자 조회**: hospital로 필터링 (관리자용)

#### Update
- **프로필 수정**: name, hospital, department, position, phone, avatar_url, color
- **권한**: 본인만 수정 가능

#### Delete
- **계정 삭제**: users 삭제 시 관련 데이터 CASCADE 삭제
- **권한**: 본인만 삭제 가능

---

### Teams (팀)

#### Create
- **팀 생성**: name, invite_code 자동 생성, created_by 설정
- **수집**: name, hospital(선택), department(선택), description(선택)
- **자동 처리**: 생성자 자동으로 team_members에 owner 역할로 추가

#### Read
- **내 팀 조회**: team_members를 통해 사용자가 속한 팀 조회
- **팀 상세 조회**: team_id로 팀 정보 + 멤버 목록 조회
- **초대 코드로 팀 조회**: invite_code로 팀 찾기

#### Update
- **팀 정보 수정**: name, description
- **권한**: owner, admin만 수정 가능

#### Delete
- **팀 삭제**: owner만 삭제 가능
- **CASCADE**: 팀 삭제 시 관련 tasks, team_members, board_posts 모두 삭제

---

### Team Members (팀원)

#### Create
- **팀 가입**: invite_code로 팀 찾아서 가입
- **수집**: team_id, user_id, role(기본값: 'member'), color(기본값: '#3B82F6')
- **중복 체크**: 이미 가입된 팀이면 에러

#### Read
- **팀 멤버 목록**: team_id로 모든 멤버 조회
- **멤버 상세**: team_id + user_id로 조회

#### Update
- **역할 변경**: role 변경 (owner → admin → member)
- **색상 변경**: color 변경
- **권한**: 
  - 본인: color만 수정 가능
  - owner/admin: 다른 멤버의 role, color 수정 가능

#### Delete
- **팀 탈퇴**: 본인은 탈퇴 가능 (단, owner는 마지막 멤버일 때만)
- **멤버 제거**: owner/admin만 다른 멤버 제거 가능

---

### Tasks (일정/교대근무)

#### Create
- **일정 추가**: 
  - 필수: team_id, user_id, title, date
  - 선택: description, shift_type, start_time, end_time, end_date, category, color
- **수집**: 모든 필드 값

#### Read
- **팀 일정 조회**: team_id + date 범위로 조회
- **개인 일정 조회**: user_id + date 범위로 조회
- **교대근무 조회**: shift_type 필터링
- **기간 조회**: date, end_date 범위로 조회

#### Update
- **일정 수정**: 모든 필드 수정 가능
- **완료 토글**: completed 필드만 변경
- **권한**: 본인이 생성한 일정만 수정 가능 (또는 owner/admin)

#### Delete
- **일정 삭제**: 본인이 생성한 일정만 삭제 가능 (또는 owner/admin)

---

### Board Posts (게시판)

#### Create
- **게시글 작성**: team_id, author_id, content, type
- **수집**: content, type, is_pinned(선택)

#### Read
- **팀 게시글 목록**: team_id로 조회, 최신순 정렬
- **고정 게시글**: is_pinned=true 우선 표시
- **게시글 상세**: id로 조회, view_count 증가

#### Update
- **게시글 수정**: content, is_pinned
- **권한**: 작성자만 수정 가능

#### Delete
- **게시글 삭제**: 작성자 또는 owner/admin만 삭제 가능

---

### Admin Posts (관리자 게시글)

#### Create
- **공지사항 작성**: hospital_id, author_id, title, content, post_type='notice'
- **식단표 작성**: hospital_id, author_id, title, content, post_type='menu', menu_date, meal_type
- **권한**: 관리자만 작성 가능

#### Read
- **병원별 게시글**: hospital_id + post_type으로 조회
- **식단표 조회**: hospital_id + menu_date + meal_type으로 조회
- **권한**: 모든 사용자 조회 가능

#### Update
- **게시글 수정**: title, content, menu_date, meal_type
- **권한**: 작성자(관리자)만 수정 가능

#### Delete
- **게시글 삭제**: 작성자(관리자)만 삭제 가능

---

## API 엔드포인트 요구사항

### 인증 관련
- `POST /auth/signup` - 회원가입
- `POST /auth/signin` - 로그인
- `POST /auth/signout` - 로그아웃
- `GET /auth/session` - 세션 확인
- `POST /auth/social/{provider}` - 소셜 로그인 (Google, Kakao, Naver)

### 사용자 관련
- `GET /users/me` - 내 프로필 조회
- `PATCH /users/me` - 내 프로필 수정
- `DELETE /users/me` - 계정 삭제
- `GET /users/{userId}` - 다른 사용자 조회 (제한된 정보)
- `POST /users/avatar` - 프로필 이미지 업로드

### 팀 관련
- `POST /teams` - 팀 생성
- `GET /teams/{teamId}` - 팀 상세 조회
- `PATCH /teams/{teamId}` - 팀 정보 수정
- `DELETE /teams/{teamId}` - 팀 삭제
- `GET /teams/invite/{inviteCode}` - 초대 코드로 팀 조회
- `POST /teams/{teamId}/join` - 팀 가입

### 팀원 관련
- `GET /teams/{teamId}/members` - 팀 멤버 목록 조회
- `GET /teams/{teamId}/members/{userId}` - 멤버 상세 조회
- `POST /teams/{teamId}/members` - 멤버 추가 (수동)
- `PATCH /teams/{teamId}/members/{userId}` - 멤버 정보 수정
- `DELETE /teams/{teamId}/members/{userId}` - 멤버 제거

### 일정 관련
- `POST /teams/{teamId}/tasks` - 일정 생성
- `GET /teams/{teamId}/tasks` - 팀 일정 조회 (날짜 범위, shift_type 필터)
- `GET /teams/{teamId}/tasks/{taskId}` - 일정 상세 조회
- `PATCH /teams/{teamId}/tasks/{taskId}` - 일정 수정
- `DELETE /teams/{teamId}/tasks/{taskId}` - 일정 삭제
- `GET /users/me/tasks` - 내 일정 조회

### 게시판 관련
- `POST /teams/{teamId}/posts` - 게시글 작성
- `GET /teams/{teamId}/posts` - 게시글 목록 조회
- `GET /teams/{teamId}/posts/{postId}` - 게시글 상세 조회
- `PATCH /teams/{teamId}/posts/{postId}` - 게시글 수정
- `DELETE /teams/{teamId}/posts/{postId}` - 게시글 삭제

### 관리자 관련
- `GET /admin/posts` - 관리자 게시글 목록 (병원별, 타입별)
- `POST /admin/posts` - 관리자 게시글 작성
- `PATCH /admin/posts/{postId}` - 관리자 게시글 수정
- `DELETE /admin/posts/{postId}` - 관리자 게시글 삭제
- `GET /admin/users` - 사용자 목록 조회 (관리자용)
- `GET /admin/users/{userId}` - 사용자 상세 조회
- `PATCH /admin/users/{userId}` - 사용자 정보 수정
- `DELETE /admin/users/{userId}` - 사용자 삭제

---

## 인증 및 권한 관리

### 인증 방식
- **Supabase Auth**: 이메일/비밀번호, 소셜 로그인
- **JWT 토큰**: 모든 API 요청에 Authorization 헤더 필요
- **토큰 갱신**: Refresh token으로 자동 갱신

### 권한 레벨
1. **Owner (팀장)**: 팀의 모든 권한
2. **Admin (관리자)**: 팀원 관리, 일정 관리 권한
3. **Member (일반 멤버)**: 본인 일정만 관리
4. **Hospital Admin (병원 관리자)**: 병원별 공지사항, 식단표 관리

### 권한 체크 규칙
- **본인 데이터**: 본인이 생성한 데이터만 수정/삭제 가능
- **팀 데이터**: 팀 멤버만 조회 가능, owner/admin만 수정/삭제 가능
- **관리자 데이터**: 관리자만 생성/수정/삭제 가능
- **RLS (Row Level Security)**: Supabase RLS로 데이터베이스 레벨 권한 제어

---

## 데이터 수집 항목 상세

### 회원가입 시 수집
- **필수**: 이메일, 비밀번호, 이름
- **선택**: 병원명, 부서명, 직책, 전화번호
- **자동**: 가입 일시, IP 주소, User Agent

### 팀 생성 시 수집
- **필수**: 팀 이름
- **선택**: 병원명, 부서명, 설명
- **자동**: 생성자 ID, 생성 일시, 초대 코드

### 일정 생성 시 수집
- **필수**: 제목, 날짜, 할당된 사용자
- **선택**: 설명, 교대근무 타입, 시작/종료 시간, 종료 날짜, 카테고리, 색상, 장소, 메모
- **자동**: 생성자 ID, 생성 일시

### 게시글 작성 시 수집
- **필수**: 내용, 타입 (notice/message)
- **선택**: 고정 여부
- **자동**: 작성자 ID, 작성 일시, 조회수, 좋아요 수

### 관리자 게시글 작성 시 수집
- **필수**: 제목, 내용, 게시글 타입 (notice/menu)
- **선택**: 식단표 날짜, 식사 타입 (breakfast/lunch/dinner/snack)
- **자동**: 작성자 ID, 병원 ID, 작성 일시

### 사용자 행동 추적 (선택사항)
- **로그인/로그아웃**: 일시, IP 주소, User Agent
- **일정 조회**: 조회한 날짜 범위, 필터 조건
- **게시글 조회**: 게시글 ID, 조회 일시
- **알림 설정**: 푸시 알림, 이메일 알림 설정

---

## 데이터베이스 관계도

```
users (1) ──< (N) team_members (N) >── (1) teams
  │                                              │
  │                                              │
  └──< (N) tasks                                 └──< (N) board_posts
  │
  └──< (N) privacy_consents

teams (1) ──< (N) tasks
users (1) ──< (N) admin_posts (병원 관리자)
```

---

## 참고사항

1. **데이터 보존**: 계정 삭제 시 관련 데이터는 CASCADE로 삭제되거나 익명화 처리
2. **개인정보 보호**: 민감한 정보(전화번호 등)는 암호화 저장 고려
3. **백업**: 정기적인 데이터베이스 백업 필요
4. **성능**: 인덱스 최적화로 조회 성능 향상
5. **확장성**: 향후 기능 추가를 고려한 스키마 설계

