-- ========================================
-- Shifty 데이터베이스 완전 체크 스크립트
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
-- 1. 모든 테이블 목록 확인
-- ========================================

SELECT 
  '📊 모든 테이블 목록' as section,
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
      'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
      'community_reports', 'meal_menus', 'hospital_official_info',
      'hospital_admins', 'hospital_settings',
      'notifications', 'notification_settings', 'fcm_tokens',
      'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
    ) THEN '✅ 핵심 테이블'
    ELSE 'ℹ️ 기타 테이블'
  END as category
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
  CASE 
    WHEN table_name IN (
      'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
      'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
      'community_reports', 'meal_menus', 'hospital_official_info',
      'hospital_admins', 'hospital_settings',
      'notifications', 'notification_settings', 'fcm_tokens',
      'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
    ) THEN 1 
    ELSE 2 
  END,
  table_name;

-- ========================================
-- 2. 핵심 테이블별 데이터 개수 확인
-- ========================================

SELECT 
  '📈 테이블별 데이터 개수' as section,
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'teams' as table_name,
  COUNT(*) as row_count
FROM teams
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'team_members' as table_name,
  COUNT(*) as row_count
FROM team_members
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'tasks' as table_name,
  COUNT(*) as row_count
FROM tasks
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'hospitals' as table_name,
  COUNT(*) as row_count
FROM hospitals
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'hospital_communities' as table_name,
  COUNT(*) as row_count
FROM hospital_communities
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'community_posts' as table_name,
  COUNT(*) as row_count
FROM community_posts
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'community_comments' as table_name,
  COUNT(*) as row_count
FROM community_comments
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'notifications' as table_name,
  COUNT(*) as row_count
FROM notifications
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'notification_settings' as table_name,
  COUNT(*) as row_count
FROM notification_settings
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'user_visits' as table_name,
  COUNT(*) as row_count
FROM user_visits
UNION ALL
SELECT 
  '📈 테이블별 데이터 개수' as section,
  'admin_popups' as table_name,
  COUNT(*) as row_count
FROM admin_popups
ORDER BY table_name;

-- ========================================
-- 3. 인덱스 확인
-- ========================================

SELECT 
  '🔍 인덱스 확인' as section,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
    'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
    'community_reports', 'meal_menus', 'hospital_official_info',
    'hospital_admins', 'hospital_settings',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY tablename, indexname;

-- ========================================
-- 4. RLS (Row Level Security) 정책 확인
-- ========================================

SELECT 
  '🔒 RLS 정책 확인' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
    'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
    'community_reports', 'meal_menus', 'hospital_official_info',
    'hospital_admins', 'hospital_settings',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY tablename, policyname;

-- ========================================
-- 5. 외래 키 제약조건 확인
-- ========================================

SELECT 
  '🔗 외래 키 확인' as section,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
    'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
    'community_reports', 'meal_menus', 'hospital_official_info',
    'hospital_admins', 'hospital_settings',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ========================================
-- 6. 트리거 확인
-- ========================================

SELECT 
  '⚡ 트리거 확인' as section,
  trigger_name,
  event_object_table as table_name,
  event_manipulation as event,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'users', 'teams', 'team_members', 'tasks', 'privacy_consents',
    'hospitals', 'hospital_communities', 'community_posts', 'community_comments',
    'community_reports', 'meal_menus', 'hospital_official_info',
    'hospital_admins', 'hospital_settings',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY event_object_table, trigger_name;

-- ========================================
-- 7. 필수 테이블 존재 여부 체크
-- ========================================

SELECT 
  '✅ 필수 테이블 체크' as section,
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = t.table_name
    ) THEN '✅ 존재함'
    ELSE '❌ 없음'
  END as status
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
ORDER BY status DESC, table_name;

-- ========================================
-- 8. hospitals 테이블 샘플 데이터 확인
-- ========================================

SELECT 
  '🏥 hospitals 샘플 데이터' as section,
  id,
  name,
  name_kr,
  city,
  district,
  type,
  created_at
FROM hospitals
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 9. 함수 확인 (update_updated_at_column)
-- ========================================

SELECT 
  '🔧 함수 확인' as section,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_updated_at_column';

-- ========================================
-- 완료!
-- ========================================
-- 
-- 위 쿼리 결과를 확인하여:
-- 1. 모든 필수 테이블이 생성되었는지 확인
-- 2. 인덱스가 제대로 생성되었는지 확인
-- 3. RLS 정책이 올바르게 설정되었는지 확인
-- 4. 외래 키 제약조건이 올바른지 확인
-- 5. 트리거가 제대로 설정되었는지 확인
-- 6. hospitals 테이블에 샘플 데이터가 있는지 확인
-- 
-- 모든 항목이 ✅로 표시되면 성공! 🎉
-- 
-- ========================================

