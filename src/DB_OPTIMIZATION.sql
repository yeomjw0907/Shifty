-- ========================================
-- Shifty Database Optimization Script
-- 출시 전 DB 성능 최적화
-- ========================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard 접속
-- 2. SQL Editor → New Query
-- 3. 이 파일 전체를 복사 & 붙여넣기
-- 4. Run 버튼 클릭
-- 
-- ========================================

-- ========================================
-- 1. 복합 인덱스 추가 (쿼리 성능 향상)
-- ========================================

-- tasks 테이블: team_id + date 복합 인덱스 (이미 존재하지만 확인)
CREATE INDEX IF NOT EXISTS idx_tasks_team_date ON tasks(team_id, date);

-- tasks 테이블: team_id + user_id + date 복합 인덱스 (멤버별 일정 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_team_user_date ON tasks(team_id, user_id, date);

-- tasks 테이블: date + shift_type 복합 인덱스 (날짜별 근무 타입 조회)
CREATE INDEX IF NOT EXISTS idx_tasks_date_shift_type ON tasks(date, shift_type);

-- team_members 테이블: team_id + user_id 복합 인덱스 (UNIQUE 제약조건과 함께)
CREATE INDEX IF NOT EXISTS idx_team_members_team_user ON team_members(team_id, user_id);

-- community_posts 테이블: community_id + post_type + created_at 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_community_type_created ON community_posts(community_id, post_type, created_at DESC);

-- community_posts 테이블: community_id + is_pinned + created_at 복합 인덱스 (고정글 우선 조회)
CREATE INDEX IF NOT EXISTS idx_community_posts_community_pinned_created ON community_posts(community_id, is_pinned DESC, created_at DESC);

-- community_comments 테이블: post_id + created_at 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_community_comments_post_created ON community_comments(post_id, created_at DESC);

-- meal_menus 테이블: community_id + menu_date + meal_type 복합 인덱스 (UNIQUE와 함께)
CREATE INDEX IF NOT EXISTS idx_meal_menus_community_date_type ON meal_menus(community_id, menu_date DESC, meal_type);

-- hospital_official_info 테이블: community_id + info_type + created_at 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_hospital_official_info_community_type_created ON hospital_official_info(community_id, info_type, created_at DESC);

-- community_reports 테이블: status + created_at 복합 인덱스 (신고 관리 최적화)
CREATE INDEX IF NOT EXISTS idx_community_reports_status_created ON community_reports(status, created_at DESC);

-- hospital_admins 테이블: hospital_id + user_id 복합 인덱스 (UNIQUE와 함께)
CREATE INDEX IF NOT EXISTS idx_hospital_admins_hospital_user ON hospital_admins(hospital_id, user_id);

-- ========================================
-- 2. 부분 인덱스 추가 (조건부 인덱스로 저장 공간 절약)
-- ========================================

-- tasks 테이블: 완료되지 않은 일정만 인덱싱
CREATE INDEX IF NOT EXISTS idx_tasks_incomplete ON tasks(team_id, date) WHERE completed = false;

-- community_posts 테이블: 고정글만 인덱싱
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(community_id, created_at DESC) WHERE is_pinned = true;

-- community_reports 테이블: 대기 중인 신고만 인덱싱
CREATE INDEX IF NOT EXISTS idx_community_reports_pending ON community_reports(created_at DESC) WHERE status = 'pending';

-- ========================================
-- 3. 통계 정보 업데이트 (쿼리 플래너 최적화)
-- ========================================

-- ANALYZE 명령으로 통계 정보 업데이트
ANALYZE users;
ANALYZE teams;
ANALYZE team_members;
ANALYZE tasks;
ANALYZE hospitals;
ANALYZE hospital_communities;
ANALYZE community_posts;
ANALYZE community_comments;
ANALYZE meal_menus;
ANALYZE hospital_official_info;
ANALYZE hospital_admins;
ANALYZE community_reports;
ANALYZE hospital_settings;

-- ========================================
-- 4. 테이블 통계 확인
-- ========================================

-- 테이블별 행 수 및 크기 확인
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- 5. 인덱스 사용률 확인
-- ========================================

-- 인덱스별 사용 통계 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ========================================
-- 6. 느린 쿼리 모니터링 (선택사항)
-- ========================================

-- pg_stat_statements 확장 활성화 (Supabase에서 이미 활성화되어 있을 수 있음)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ========================================
-- 7. VACUUM 및 REINDEX (정기 유지보수)
-- ========================================

-- VACUUM ANALYZE로 테이블 최적화 (선택사항, 운영 중에는 주의)
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE teams;
-- VACUUM ANALYZE team_members;
-- VACUUM ANALYZE tasks;
-- VACUUM ANALYZE hospitals;
-- VACUUM ANALYZE hospital_communities;
-- VACUUM ANALYZE community_posts;
-- VACUUM ANALYZE community_comments;

-- ========================================
-- 완료!
-- ========================================
-- 
-- 다음 SQL로 인덱스 확인:
-- 
-- SELECT 
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('tasks', 'team_members', 'community_posts', 'community_comments')
-- ORDER BY tablename, indexname;
-- 
-- ========================================

