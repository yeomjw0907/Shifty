-- 🗑️ 임시 데이터베이스 삭제
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- ============================================
-- 주의사항
-- ============================================
-- 이 스크립트는 기존 kv_store_3afd3c70 테이블을 삭제합니다.
-- 새로운 정규화된 DB(users, teams, team_members, tasks, privacy_consents)를 사용하므로
-- 더 이상 필요하지 않습니다.

-- ⚠️ 만약 kv_store에 중요한 데이터가 있다면 백업 후 실행하세요!

-- ============================================
-- 1단계: 백업 (선택사항)
-- ============================================

-- kv_store 데이터 백업 (필요시)
-- CREATE TABLE kv_store_backup AS SELECT * FROM kv_store_3afd3c70;

-- ============================================
-- 2단계: 관련 함수 삭제
-- ============================================

-- kv_store 관련 함수들이 있다면 삭제
DROP FUNCTION IF EXISTS kv_get(text);
DROP FUNCTION IF EXISTS kv_set(text, jsonb);
DROP FUNCTION IF EXISTS kv_delete(text);
DROP FUNCTION IF EXISTS kv_mget(text[]);
DROP FUNCTION IF EXISTS kv_mset(jsonb);
DROP FUNCTION IF EXISTS kv_mdel(text[]);

-- ============================================
-- 3단계: 테이블 삭제
-- ============================================

-- kv_store_3afd3c70 테이블 삭제
DROP TABLE IF EXISTS kv_store_3afd3c70 CASCADE;

-- ============================================
-- 4단계: 확인
-- ============================================

-- 남아있는 테이블 확인
SELECT 
  schemaname, 
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 예상 결과:
-- ✅ users
-- ✅ teams  
-- ✅ team_members
-- ✅ tasks
-- ✅ privacy_consents
-- ❌ kv_store_3afd3c70 (삭제됨)

-- ============================================
-- 완료!
-- ============================================

SELECT '✅ 임시 테이블이 성공적으로 삭제되었습니다!' as status;
SELECT '🎉 이제 정규화된 DB만 사용합니다!' as message;
