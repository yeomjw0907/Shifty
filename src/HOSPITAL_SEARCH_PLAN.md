# 🏥 병원 검색 기능 구현 계획서

**전국 병원 DB를 활용한 자동완성 검색 기능**

---

## 📋 현재 상태

### 현재 구현
- ✅ `users` 테이블에 `hospital VARCHAR(200)` 필드 존재
- ✅ 회원가입 시 텍스트 입력으로 병원명 입력
- ❌ 병원 검색/자동완성 기능 없음
- ❌ 마이페이지에서 병원 정보 수정 불가

### 필요한 개선
1. **병원 데이터베이스 구축**
   - `hospitals` 테이블 생성
   - 전국 병원 정보 저장

2. **병원 검색 API**
   - 자동완성 검색 엔드포인트
   - 이름, 주소, 지역별 검색

3. **UI 컴포넌트**
   - 회원가입: 병원 검색 자동완성
   - 마이페이지: 병원 정보 수정 기능

---

## 🗄️ 데이터베이스 설계

### 1. hospitals 테이블

```sql
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,                    -- 병원명
  name_kr VARCHAR(200),                           -- 병원명 (한글)
  address VARCHAR(500),                            -- 주소
  city VARCHAR(50),                                -- 시/도
  district VARCHAR(50),                            -- 시/군/구
  phone VARCHAR(20),                               -- 전화번호
  type VARCHAR(50),                                -- 병원 유형 (종합병원, 대학병원 등)
  beds INTEGER,                                    -- 병상 수
  latitude DECIMAL(10, 8),                        -- 위도
  longitude DECIMAL(11, 8),                       -- 경도
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_name_search ON hospitals USING gin(to_tsvector('korean', name));
```

### 2. 데이터 소스

**옵션 1: 공공데이터포털 (추천)**
- 보건복지부 병원 정보 API
- 무료, 정기 업데이트
- 약 3만개 병원 정보

**옵션 2: 수동 입력**
- 주요 병원만 수동으로 입력
- 빠른 구현 가능

**옵션 3: 하이브리드**
- 주요 병원은 수동 입력
- 나머지는 공공데이터 활용

---

## 🔧 구현 단계

### Phase 1: 데이터베이스 구축

1. **hospitals 테이블 생성**
   ```sql
   -- SETUP_HOSPITALS_TABLE.sql 실행
   ```

2. **초기 데이터 입력**
   - 공공데이터 API로 데이터 수집
   - 또는 주요 병원 수동 입력

### Phase 2: 백엔드 API

1. **병원 검색 엔드포인트**
   ```
   GET /hospitals/search?q={검색어}&limit=10
   ```

2. **병원 상세 정보**
   ```
   GET /hospitals/:id
   ```

### Phase 3: 프론트엔드 컴포넌트

1. **HospitalSearchInput 컴포넌트**
   - 자동완성 검색
   - 토스 스타일 디자인
   - 키보드 네비게이션

2. **회원가입 페이지 수정**
   - `AuthScreen.tsx`의 병원 입력 필드를 `HospitalSearchInput`으로 교체

3. **마이페이지 수정**
   - `MyPage.tsx`에 병원 정보 수정 기능 추가

---

## 📝 상세 구현 계획

### 1. HospitalSearchInput 컴포넌트

**기능:**
- 입력 시 실시간 검색
- 드롭다운으로 결과 표시
- 키보드로 선택 (↑↓, Enter)
- 선택 시 자동 완성

**디자인:**
- 토스 스타일 Input
- Glass Morphism 드롭다운
- 부드러운 애니메이션

### 2. 회원가입 수정

**변경 사항:**
```tsx
// 기존
<TossInput
  label="근무 병원"
  value={hospital}
  onChange={(e) => handleHospitalChange(e.target.value)}
/>

// 변경 후
<HospitalSearchInput
  label="근무 병원"
  value={hospital}
  onChange={handleHospitalChange}
  placeholder="병원명을 검색하세요"
/>
```

### 3. 마이페이지 수정

**추가 기능:**
- 병원 정보 표시
- 병원 정보 수정 (검색으로 변경)
- 저장 버튼

---

## 🎯 데이터 수집 방법

### 방법 1: 공공데이터포털 API

**보건복지부 병원 정보 API**
- URL: `https://apis.data.go.kr/B552657/HsptlAsembySearchService/getHsptlMdcncLcnsInfo`
- 무료, 인증키 필요
- 약 3만개 병원 정보

**데이터 수집 스크립트:**
```javascript
// scripts/fetch-hospitals.js
// 공공데이터 API 호출하여 hospitals 테이블에 저장
```

### 방법 2: 수동 입력

**주요 병원 목록:**
- 서울대학교병원
- 세브란스병원
- 아산병원
- 삼성서울병원
- 등등...

**SQL 스크립트:**
```sql
-- scripts/insert-major-hospitals.sql
INSERT INTO hospitals (name, city, type) VALUES
  ('서울대학교병원', '서울특별시', '대학병원'),
  ('세브란스병원', '서울특별시', '대학병원'),
  ...
```

### 방법 3: 하이브리드 (추천)

1. **1단계**: 주요 병원 수동 입력 (빠른 구현)
2. **2단계**: 공공데이터 API로 전체 병원 정보 수집

---

## 📊 예상 데이터 규모

- **전국 병원 수**: 약 30,000개
- **주요 병원**: 약 500개 (수동 입력 가능)
- **검색 성능**: 인덱스 활용으로 빠른 검색 가능

---

## ✅ 구현 체크리스트

### Phase 1: 데이터베이스
- [ ] `hospitals` 테이블 생성
- [ ] 인덱스 생성
- [ ] 초기 데이터 입력 (주요 병원 100-500개)

### Phase 2: 백엔드
- [ ] `GET /hospitals/search` 엔드포인트
- [ ] 검색 쿼리 최적화
- [ ] RLS 정책 설정

### Phase 3: 프론트엔드
- [ ] `HospitalSearchInput` 컴포넌트
- [ ] 회원가입 페이지 수정
- [ ] 마이페이지 수정
- [ ] API 연동

### Phase 4: 데이터 수집
- [ ] 공공데이터 API 연동 (선택)
- [ ] 데이터 수집 스크립트
- [ ] 정기 업데이트 계획

---

## 🚀 빠른 시작 (MVP)

**최소 기능으로 빠르게 구현:**

1. **주요 병원 100개만 수동 입력**
2. **간단한 검색 기능 구현**
3. **회원가입/마이페이지에 적용**

**이후 확장:**
- 공공데이터 API로 전체 병원 정보 수집
- 검색 기능 고도화
- 지역별 필터링 등

---

## 💡 추가 개선 아이디어

1. **병원별 통계**
   - 병원별 사용자 수
   - 인기 병원 순위

2. **병원 정보 상세**
   - 주소, 전화번호
   - 지도 표시

3. **병원 인증**
   - 이메일 도메인으로 병원 자동 인식
   - 병원 인증 배지

---

**작성일**: 2025년
**작성자**: AI Assistant
**상태**: 기획 완료, 구현 대기

