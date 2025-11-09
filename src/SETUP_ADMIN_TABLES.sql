-- ========================================
-- Shifty Hospital Community Admin Tables Setup Script
-- 주식회사 98점7도
-- ========================================

-- 1. hospital_admins 테이블 (병원 관리자)
CREATE TABLE IF NOT EXISTS hospital_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',  -- 'admin', 'moderator'
  permissions JSONB DEFAULT '{}',  -- 세부 권한 관리
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_admins_hospital_id ON hospital_admins(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_user_id ON hospital_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_role ON hospital_admins(role);

-- 2. community_reports 테이블 (신고 관리)
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,  -- 'spam', 'harassment', 'inappropriate', 'false_info', 'other'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_reports_post_id ON community_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_comment_id ON community_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_reporter_id ON community_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_created_at ON community_reports(created_at DESC);

-- 3. hospital_settings 테이블 (병원 커뮤니티 설정)
CREATE TABLE IF NOT EXISTS hospital_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE UNIQUE,
  allow_anonymous_posts BOOLEAN DEFAULT true,
  require_approval_for_posts BOOLEAN DEFAULT false,
  auto_moderate_keywords TEXT[],  -- 자동 모더레이션 키워드
  banner_image_url TEXT,
  banner_link_url TEXT,
  custom_rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospital_settings_hospital_id ON hospital_settings(hospital_id);

-- 4. Auto-update triggers
DROP TRIGGER IF EXISTS update_hospital_admins_updated_at ON hospital_admins;
CREATE TRIGGER update_hospital_admins_updated_at
  BEFORE UPDATE ON hospital_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_reports_updated_at ON community_reports;
CREATE TRIGGER update_community_reports_updated_at
  BEFORE UPDATE ON community_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospital_settings_updated_at ON hospital_settings;
CREATE TRIGGER update_hospital_settings_updated_at
  BEFORE UPDATE ON hospital_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS Policies

-- hospital_admins: 자신이 관리자인지 확인 가능, 같은 병원 관리자는 조회 가능
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_admins_select_policy" ON hospital_admins
  FOR SELECT
  USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id = hospital_admins.hospital_id
    )
  );

CREATE POLICY "hospital_admins_insert_policy" ON hospital_admins
  FOR INSERT
  WITH CHECK (
    -- 시스템 관리자만 추가 가능 (서버에서만 처리)
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.email IN ('admin@shifty.app', 'admin@98point7.com')
    )
  );

-- community_reports: 자신이 신고한 내역 조회 가능, 관리자는 모든 신고 조회 가능
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_reports_select_policy" ON community_reports
  FOR SELECT
  USING (
    reporter_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id IN (
        SELECT hc.hospital_id FROM hospital_communities hc
        JOIN community_posts cp ON hc.id = cp.community_id
        WHERE cp.id = community_reports.post_id
      )
    )
  );

CREATE POLICY "community_reports_insert_policy" ON community_reports
  FOR INSERT
  WITH CHECK (
    reporter_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "community_reports_update_policy" ON community_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id IN (
        SELECT hc.hospital_id FROM hospital_communities hc
        JOIN community_posts cp ON hc.id = cp.community_id
        WHERE cp.id = community_reports.post_id
      )
    )
  );

-- hospital_settings: 같은 병원 사용자는 읽기 가능, 관리자만 수정 가능
ALTER TABLE hospital_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_settings_select_policy" ON hospital_settings
  FOR SELECT
  USING (
    hospital_id IN (
      SELECT hospital_id FROM users
      WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "hospital_settings_update_policy" ON hospital_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id = hospital_settings.hospital_id
    )
  );

-- ========================================
-- 완료!
-- ========================================

