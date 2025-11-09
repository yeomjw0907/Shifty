-- 🔐 RLS (Row Level Security) 활성화 및 정책 설정
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- ============================================
-- 1단계: RLS 활성화
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2단계: USERS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Team members can view each other" ON users;

-- 자기 자신의 프로필은 읽기 가능
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- 자기 자신의 프로필은 수정 가능
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- 회원가입 시 프로필 생성 가능 (서버가 service_role로 처리)
-- 일반 사용자는 생성 불가 (서버만 가능)

-- 같은 팀 멤버는 서로 볼 수 있음
CREATE POLICY "Team members can view each other"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT tm1.user_id
      FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm2.user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- 3단계: TEAMS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;

-- 팀 멤버는 자신의 팀 조회 가능
CREATE POLICY "Team members can view their teams"
  ON teams FOR SELECT
  USING (
    id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 팀 소유자는 팀 수정 가능
CREATE POLICY "Team owners can update their teams"
  ON teams FOR UPDATE
  USING (
    created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- 팀 소유자는 팀 삭제 가능
CREATE POLICY "Team owners can delete their teams"
  ON teams FOR DELETE
  USING (
    created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ============================================
-- 4단계: TEAM_MEMBERS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;

-- 팀 멤버는 같은 팀의 멤버 목록 조회 가능
CREATE POLICY "Team members can view team members"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 팀 소유자는 멤버 추가/삭제 가능
CREATE POLICY "Team owners can manage members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- 5단계: TASKS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Team members can view team tasks" ON tasks;
DROP POLICY IF EXISTS "Team members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Task owners or team owners can update tasks" ON tasks;
DROP POLICY IF EXISTS "Task owners or team owners can delete tasks" ON tasks;

-- 팀 멤버는 팀 일정 조회 가능
CREATE POLICY "Team members can view team tasks"
  ON tasks FOR SELECT
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 팀 멤버는 팀 일정 생성 가능
CREATE POLICY "Team members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 일정 생성자 또는 팀 소유자는 일정 수정 가능
CREATE POLICY "Task owners or team owners can update tasks"
  ON tasks FOR UPDATE
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- 일정 생성자 또는 팀 소유자는 일정 삭제 가능
CREATE POLICY "Task owners or team owners can delete tasks"
  ON tasks FOR DELETE
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    team_id IN (
      SELECT id FROM teams 
      WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- ============================================
-- 6단계: PRIVACY_CONSENTS 테이블 정책
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Users can view own consents" ON privacy_consents;

-- 자신의 동의 기록만 조회 가능
CREATE POLICY "Users can view own consents"
  ON privacy_consents FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================
-- 7단계: 임시 테이블 삭제 (선택사항)
-- ============================================

-- kv_store_3afd3c70 테이블은 더 이상 사용하지 않으므로 삭제
-- 주의: 삭제 전에 백업 권장!
-- DROP TABLE IF EXISTS kv_store_3afd3c70;

-- ============================================
-- 완료! 
-- ============================================

-- 확인: 모든 테이블의 RLS 상태 체크
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'teams', 'team_members', 'tasks', 'privacy_consents')
ORDER BY tablename;

-- 확인: 설정된 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
