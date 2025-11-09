-- ========================================
-- Shifty Analytics & Popup Management Tables Setup Script
-- 주식회사 98점7도
-- ========================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor → New Query
-- 3. 이 파일 전체를 복사 & 붙여넣기
-- 4. Run 버튼 클릭
-- 
-- ========================================

-- 1. user_visits 테이블 (사용자 방문 기록)
CREATE TABLE IF NOT EXISTS user_visits (
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

CREATE INDEX IF NOT EXISTS idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_visit_date ON user_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_visits_session_id ON user_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_user_date ON user_visits(user_id, visit_date);

-- 2. admin_popups 테이블 (관리자 팝업)
CREATE TABLE IF NOT EXISTS admin_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  popup_type VARCHAR(20) DEFAULT 'info',  -- 'info', 'promotion', 'notice', 'event'
  target_audience VARCHAR(20) DEFAULT 'all',  -- 'all', 'new_users', 'specific_hospital'
  target_hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  display_frequency VARCHAR(20) DEFAULT 'once',  -- 'once', 'daily', 'always'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_popups_is_active ON admin_popups(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_popups_target_hospital_id ON admin_popups(target_hospital_id);
CREATE INDEX IF NOT EXISTS idx_admin_popups_start_end_date ON admin_popups(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_admin_popups_priority ON admin_popups(priority DESC);

-- 3. popup_interactions 테이블 (팝업 상호작용 기록)
CREATE TABLE IF NOT EXISTS popup_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popup_id UUID NOT NULL REFERENCES admin_popups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL,  -- 'view', 'click', 'close'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_popup_interactions_popup_id ON popup_interactions(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_interactions_user_id ON popup_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_popup_interactions_type ON popup_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_popup_interactions_created_at ON popup_interactions(created_at DESC);

-- 4. user_sessions 테이블 (사용자 세션)
CREATE TABLE IF NOT EXISTS user_sessions (
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

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at DESC);

-- 5. Auto-update triggers
DROP TRIGGER IF EXISTS update_admin_popups_updated_at ON admin_popups;
CREATE TRIGGER update_admin_popups_updated_at
  BEFORE UPDATE ON admin_popups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security) 설정
-- ========================================

-- user_visits: 모든 사용자는 자신의 방문 기록만 조회 가능, 관리자는 전체 조회 가능
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_visits_select_own" ON user_visits
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "user_visits_insert_own" ON user_visits
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- admin_popups: 모든 사용자는 활성 팝업만 조회 가능, 관리자는 전체 조회/수정 가능
ALTER TABLE admin_popups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_popups_select_active" ON admin_popups
  FOR SELECT
  USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "admin_popups_insert_admin" ON admin_popups
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "admin_popups_update_admin" ON admin_popups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "admin_popups_delete_admin" ON admin_popups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

-- popup_interactions: 모든 사용자는 자신의 상호작용만 조회 가능, 관리자는 전체 조회 가능
ALTER TABLE popup_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "popup_interactions_select_own" ON popup_interactions
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "popup_interactions_insert_own" ON popup_interactions
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- user_sessions: 모든 사용자는 자신의 세션만 조회 가능, 관리자는 전체 조회 가능
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_sessions_select_own" ON user_sessions
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com', 'yeomjw0907@onecation.co.kr', 'yeomjw0907@naver.com')
    )
  );

CREATE POLICY "user_sessions_insert_own" ON user_sessions
  FOR INSERT
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- ========================================
-- 완료!
-- ========================================
-- 
-- 다음 SQL로 테이블 확인:
-- 
-- SELECT table_name 
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'user_visits',
--     'admin_popups',
--     'popup_interactions',
--     'user_sessions'
--   );
-- 
-- 4개 테이블이 보이면 성공! ✅
-- 
-- ========================================

