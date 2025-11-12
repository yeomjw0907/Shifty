-- ========================================
-- Shifty Hospitals Table Setup Script
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

-- hospitals 테이블 생성
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,                    -- 병원명
  name_kr VARCHAR(200),                           -- 병원명 (한글, 검색용)
  address VARCHAR(500),                            -- 주소
  city VARCHAR(50),                                -- 시/도
  district VARCHAR(50),                            -- 시/군/구
  phone VARCHAR(20),                               -- 전화번호
  type VARCHAR(50),                                -- 병원 유형 (종합병원, 대학병원, 병원, 의원 등)
  beds INTEGER,                                    -- 병상 수
  latitude DECIMAL(10, 8),                        -- 위도
  longitude DECIMAL(11, 8),                       -- 경도
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- hospitals 인덱스
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
CREATE INDEX IF NOT EXISTS idx_hospitals_name_kr ON hospitals(name_kr);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district);
CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);

-- Full-text search 인덱스 (한글 검색 최적화)
-- Note: 'korean' 텍스트 검색 설정이 없을 수 있으므로 'simple' 사용
-- 한글 검색은 ILIKE를 사용하는 것이 더 효과적일 수 있습니다
CREATE INDEX IF NOT EXISTS idx_hospitals_search ON hospitals USING gin(to_tsvector('simple', COALESCE(name_kr, name)));

-- 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals;
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security) 설정
-- ========================================

-- RLS 활성화
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "hospitals_select_policy" ON hospitals;

-- 모든 사용자가 읽기 가능 (검색용)
CREATE POLICY "hospitals_select_policy" ON hospitals
  FOR SELECT
  USING (true);

-- ========================================
-- 초기 데이터 (주요 병원 샘플)
-- ========================================

-- 주요 병원 샘플 데이터 (나중에 공공데이터 API로 대체)
INSERT INTO hospitals (name, name_kr, city, district, type) VALUES
  ('서울대학교병원', '서울대학교병원', '서울특별시', '종로구', '대학병원'),
  ('세브란스병원', '세브란스병원', '서울특별시', '서대문구', '대학병원'),
  ('아산병원', '아산병원', '서울특별시', '송파구', '대학병원'),
  ('삼성서울병원', '삼성서울병원', '서울특별시', '강남구', '대학병원'),
  ('아주대학교병원', '아주대학교병원', '경기도', '수원시', '대학병원'),
  ('가톨릭대학교 서울성모병원', '가톨릭대학교 서울성모병원', '서울특별시', '서초구', '대학병원'),
  ('고려대학교 안암병원', '고려대학교 안암병원', '서울특별시', '성북구', '대학병원'),
  ('고려대학교 구로병원', '고려대학교 구로병원', '서울특별시', '구로구', '대학병원'),
  ('한양대학교병원', '한양대학교병원', '서울특별시', '성동구', '대학병원'),
  ('중앙대학교병원', '중앙대학교병원', '서울특별시', '동작구', '대학병원')
ON CONFLICT DO NOTHING;

-- ========================================
-- 외래 키 제약조건 추가 (admin_popups 테이블이 있는 경우)
-- ========================================

-- admin_popups 테이블에 hospitals 외래 키 추가
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_popups') THEN
    -- 기존 제약조건이 있으면 삭제
    ALTER TABLE admin_popups DROP CONSTRAINT IF EXISTS fk_admin_popups_hospital;
    
    -- 외래 키 제약조건 추가
    ALTER TABLE admin_popups 
      ADD CONSTRAINT fk_admin_popups_hospital 
      FOREIGN KEY (target_hospital_id) 
      REFERENCES hospitals(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- ========================================
-- 완료! 
-- ========================================
-- 
-- 다음 SQL로 테이블 확인:
-- 
-- SELECT table_name 
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name = 'hospitals';
-- 
-- 1개 테이블이 보이면 성공! ✅
-- 
-- ========================================

