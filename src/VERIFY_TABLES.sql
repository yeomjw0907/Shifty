-- ========================================
-- Shifty 테이블 확인 스크립트
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

-- 1. hospitals 테이블 확인
SELECT 
  'hospitals' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ 생성됨' ELSE '❌ 비어있음' END as status
FROM hospitals;

-- 2. user_visits 테이블 확인
SELECT 
  'user_visits' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) >= 0 THEN '✅ 생성됨' ELSE '❌ 없음' END as status
FROM user_visits;

-- 3. admin_popups 테이블 확인
SELECT 
  'admin_popups' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) >= 0 THEN '✅ 생성됨' ELSE '❌ 없음' END as status
FROM admin_popups;

-- 4. popup_interactions 테이블 확인
SELECT 
  'popup_interactions' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) >= 0 THEN '✅ 생성됨' ELSE '❌ 없음' END as status
FROM popup_interactions;

-- 5. user_sessions 테이블 확인
SELECT 
  'user_sessions' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) >= 0 THEN '✅ 생성됨' ELSE '❌ 없음' END as status
FROM user_sessions;

-- 6. 모든 테이블 목록 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('hospitals', 'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions') 
    THEN '✅ Analytics 테이블'
    ELSE 'ℹ️ 기타 테이블'
  END as category
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
  CASE 
    WHEN table_name IN ('hospitals', 'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions') 
    THEN 1 
    ELSE 2 
  END,
  table_name;

-- 7. 인덱스 확인
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('hospitals', 'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions')
ORDER BY tablename, indexname;

-- ========================================
-- 완료!
-- ========================================
-- 
-- 위 쿼리 결과를 확인하여:
-- 1. 모든 테이블이 생성되었는지 확인
-- 2. 인덱스가 제대로 생성되었는지 확인
-- 3. hospitals 테이블에 샘플 데이터가 있는지 확인
-- 
-- ========================================

