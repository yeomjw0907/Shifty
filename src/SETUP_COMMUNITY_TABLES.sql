-- ========================================
-- Shifty Hospital Community Tables Setup Script
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

-- 1. hospitals 테이블에 인증 필드 추가
ALTER TABLE hospitals 
ADD COLUMN IF NOT EXISTS email_domain VARCHAR(100),  -- 이메일 도메인 (예: @seoulhospital.co.kr)
ADD COLUMN IF NOT EXISTS auth_code VARCHAR(20),      -- 인증 코드 (예: SEOUL2024)
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;  -- 병원 인증 여부

-- hospitals 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_hospitals_email_domain ON hospitals(email_domain);
CREATE INDEX IF NOT EXISTS idx_hospitals_auth_code ON hospitals(auth_code);

-- 2. hospital_communities 테이블 (병원별 커뮤니티)
CREATE TABLE IF NOT EXISTS hospital_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,  -- 커뮤니티 이름 (보통 병원명과 동일)
  description TEXT,            -- 커뮤니티 설명
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_communities_hospital_id ON hospital_communities(hospital_id);

-- 3. community_posts 테이블 (커뮤니티 게시글)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES hospital_communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  post_type VARCHAR(20) NOT NULL DEFAULT 'message',  -- 'notice', 'message', 'blind'
  is_anonymous BOOLEAN DEFAULT false,  -- 익명 여부 (블라인드 게시판용)
  is_pinned BOOLEAN DEFAULT false,     -- 고정 여부
  is_official BOOLEAN DEFAULT false,   -- 병원 오피셜 여부
  view_count INTEGER DEFAULT 0,        -- 조회수
  like_count INTEGER DEFAULT 0,        -- 좋아요 수
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

-- 4. community_comments 테이블 (댓글)
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,  -- 익명 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at DESC);

-- 5. meal_menus 테이블 (식단표)
CREATE TABLE IF NOT EXISTS meal_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES hospital_communities(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,             -- 식단 날짜
  meal_type VARCHAR(20) NOT NULL,      -- 'breakfast', 'lunch', 'dinner'
  menu_items TEXT NOT NULL,             -- 메뉴 항목 (JSON 또는 텍스트)
  image_url TEXT,                       -- 식단표 이미지 URL
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, menu_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_menus_community_id ON meal_menus(community_id);
CREATE INDEX IF NOT EXISTS idx_meal_menus_menu_date ON meal_menus(menu_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_menus_meal_type ON meal_menus(meal_type);

-- 6. hospital_official_info 테이블 (병원 오피셜 정보)
CREATE TABLE IF NOT EXISTS hospital_official_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES hospital_communities(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  info_type VARCHAR(20) NOT NULL,      -- 'notice', 'event', 'policy', 'announcement'
  is_pinned BOOLEAN DEFAULT false,     -- 고정 여부
  view_count INTEGER DEFAULT 0,        -- 조회수
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospital_official_info_community_id ON hospital_official_info(community_id);
CREATE INDEX IF NOT EXISTS idx_hospital_official_info_info_type ON hospital_official_info(info_type);
CREATE INDEX IF NOT EXISTS idx_hospital_official_info_created_at ON hospital_official_info(created_at DESC);

-- 7. users 테이블에 hospital_id 필드 추가 (병원 ID 참조)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_hospital_id ON users(hospital_id);

-- 8. hospital_admins 테이블 (병원 관리자)
CREATE TABLE IF NOT EXISTS hospital_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',  -- 'admin', 'moderator'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hospital_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_admins_hospital_id ON hospital_admins(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_user_id ON hospital_admins(user_id);

-- 9. Auto-update triggers
DROP TRIGGER IF EXISTS update_hospital_communities_updated_at ON hospital_communities;
CREATE TRIGGER update_hospital_communities_updated_at
  BEFORE UPDATE ON hospital_communities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_comments_updated_at ON community_comments;
CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_menus_updated_at ON meal_menus;
CREATE TRIGGER update_meal_menus_updated_at
  BEFORE UPDATE ON meal_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospital_official_info_updated_at ON hospital_official_info;
CREATE TRIGGER update_hospital_official_info_updated_at
  BEFORE UPDATE ON hospital_official_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security) 설정
-- ========================================

-- hospital_communities: 같은 병원 사용자만 읽기 가능
ALTER TABLE hospital_communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_communities_select_policy" ON hospital_communities
  FOR SELECT
  USING (
    hospital_id IN (
      SELECT hospital_id FROM users WHERE id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

-- community_posts: 같은 병원 사용자만 읽기/쓰기 가능
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts_select_policy" ON community_posts
  FOR SELECT
  USING (
    community_id IN (
      SELECT hc.id FROM hospital_communities hc
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "community_posts_insert_policy" ON community_posts
  FOR INSERT
  WITH CHECK (
    author_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND community_id IN (
      SELECT hc.id FROM hospital_communities hc
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "community_posts_update_policy" ON community_posts
  FOR UPDATE
  USING (author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "community_posts_delete_policy" ON community_posts
  FOR DELETE
  USING (author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- community_comments: 같은 병원 사용자만 읽기/쓰기 가능
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_comments_select_policy" ON community_comments
  FOR SELECT
  USING (
    post_id IN (
      SELECT cp.id FROM community_posts cp
      JOIN hospital_communities hc ON cp.community_id = hc.id
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "community_comments_insert_policy" ON community_comments
  FOR INSERT
  WITH CHECK (
    author_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "community_comments_update_policy" ON community_comments
  FOR UPDATE
  USING (author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "community_comments_delete_policy" ON community_comments
  FOR DELETE
  USING (author_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- meal_menus: 같은 병원 사용자만 읽기 가능, 관리자만 쓰기 가능
ALTER TABLE meal_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meal_menus_select_policy" ON meal_menus
  FOR SELECT
  USING (
    community_id IN (
      SELECT hc.id FROM hospital_communities hc
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "meal_menus_insert_policy" ON meal_menus
  FOR INSERT
  WITH CHECK (
    created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND community_id IN (
      SELECT hc.id FROM hospital_communities hc
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id = (SELECT hospital_id FROM hospital_communities WHERE id = community_id)
    )
  );

-- hospital_official_info: 같은 병원 사용자만 읽기 가능, 관리자만 쓰기 가능
ALTER TABLE hospital_official_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_official_info_select_policy" ON hospital_official_info
  FOR SELECT
  USING (
    community_id IN (
      SELECT hc.id FROM hospital_communities hc
      JOIN users u ON hc.hospital_id = u.hospital_id
      WHERE u.id = (SELECT id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "hospital_official_info_insert_policy" ON hospital_official_info
  FOR INSERT
  WITH CHECK (
    created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM hospital_admins ha
      JOIN users u ON ha.user_id = u.id
      WHERE u.auth_id = auth.uid()
      AND ha.hospital_id = (SELECT hospital_id FROM hospital_communities WHERE id = community_id)
    )
  );

-- hospital_admins: 관리자만 읽기 가능
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
--     'hospital_communities',
--     'community_posts',
--     'community_comments',
--     'meal_menus',
--     'hospital_official_info',
--     'hospital_admins'
--   );
-- 
-- 6개 테이블이 보이면 성공! ✅
-- 
-- ========================================

