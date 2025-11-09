-- ========================================
-- Shifty 데이터베이스 빠른 체크 스크립트
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

-- ========================================
-- 필수 테이블 존재 여부 체크 (하나의 결과로 통합)
-- ========================================

SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = t.table_name
    ) THEN '✅ 존재함'
    ELSE '❌ 없음'
  END as status,
  CASE 
    WHEN t.table_name IN ('users', 'teams', 'team_members', 'tasks') THEN '기본 테이블'
    WHEN t.table_name IN ('hospitals', 'hospital_communities', 'community_posts', 'community_comments') THEN '커뮤니티 테이블'
    WHEN t.table_name IN ('notifications', 'notification_settings', 'fcm_tokens') THEN '알림 테이블'
    WHEN t.table_name IN ('user_visits', 'admin_popups', 'popup_interactions', 'user_sessions') THEN 'Analytics 테이블'
    WHEN t.table_name IN ('hospital_admins', 'hospital_settings', 'community_reports') THEN '관리자 테이블'
    ELSE '기타'
  END as category
FROM (VALUES
  ('users'),
  ('teams'),
  ('team_members'),
  ('tasks'),
  ('privacy_consents'),
  ('hospitals'),
  ('hospital_communities'),
  ('community_posts'),
  ('community_comments'),
  ('community_reports'),
  ('meal_menus'),
  ('hospital_official_info'),
  ('hospital_admins'),
  ('hospital_settings'),
  ('notifications'),
  ('notification_settings'),
  ('fcm_tokens'),
  ('user_visits'),
  ('admin_popups'),
  ('popup_interactions'),
  ('user_sessions')
) AS t(table_name)
ORDER BY 
  CASE 
    WHEN t.table_name IN ('users', 'teams', 'team_members', 'tasks') THEN 1
    WHEN t.table_name IN ('hospitals', 'hospital_communities', 'community_posts', 'community_comments') THEN 2
    WHEN t.table_name IN ('notifications', 'notification_settings', 'fcm_tokens') THEN 3
    WHEN t.table_name IN ('user_visits', 'admin_popups', 'popup_interactions', 'user_sessions') THEN 4
    WHEN t.table_name IN ('hospital_admins', 'hospital_settings', 'community_reports') THEN 5
    ELSE 6
  END,
  table_name;

