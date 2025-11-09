# 🏥 병원 데이터 Excel 임포트 가이드

## 📋 개요

공공데이터포털에서 다운로드한 Excel 파일(7개)을 Supabase `hospitals` 테이블에 임포트하는 스크립트입니다.

---

## 📥 Excel 파일 준비

### 1. 파일 다운로드

공공데이터포털에서 다음 파일들을 다운로드:
- `01_01_01_P.xlsx`
- `01_01_02_P.xlsx`
- `01_01_03_P.xlsx`
- `01_01_04_P.xlsx`
- `01_01_07_P.xlsx`
- `01_01_08_P.xlsx`
- `01_01_10_P.xlsx`

### 2. 파일 저장

다운로드한 모든 Excel 파일을 `scripts/` 폴더에 저장:

```
shifty/
  scripts/
    01_01_01_P.xlsx
    01_01_02_P.xlsx
    01_01_03_P.xlsx
    01_01_04_P.xlsx
    01_01_07_P.xlsx
    01_01_08_P.xlsx
    01_01_10_P.xlsx
```

---

## 🔧 설치 및 설정

### 1. 필요한 패키지 설치

```bash
npm install xlsx
```

### 2. 환경 변수 설정

`.env` 파일에 Supabase 정보 추가:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

또는 실행 시 직접 지정:

```bash
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key npm run import-hospitals
```

---

## 📊 Excel 파일 구조

스크립트는 다음 컬럼명을 자동으로 인식합니다:

| Excel 컬럼명 (가능한 변형) | DB 컬럼명 | 설명 |
|---------------------------|----------|------|
| **사업장명** (필수) | name_kr | 병원명 (한글) |
| 주소, 소재지전체주소, 도로명전체주소, 지번주소 | address | 전체 주소 |
| 시도명, 시도, 시도코드명 | city | 시/도 |
| 시군구명, 시군구, 시군구코드명 | district | 시/군/구 |
| 전화번호, 대표전화, 전화 | phone | 전화번호 |
| 업종, 업종명, 업종코드명, 의료기관종별명 | type | 병원 유형 |
| 병상수, 병상, 총병상수 | beds | 병상 수 |
| 위도, 좌표Y, 위도(WGS84) | latitude | 위도 |
| 경도, 좌표X, 경도(WGS84) | longitude | 경도 |

**참고:** 각 파일의 컬럼명이 다를 수 있지만, 스크립트가 자동으로 인식합니다.

---

## 🚀 실행 방법

### 방법 1: npm 스크립트 사용

```bash
npm run import-hospitals
```

### 방법 2: 직접 실행

```bash
node scripts/import-hospitals-from-excel.js
```

### 방법 3: 환경 변수와 함께 실행

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxx \
node scripts/import-hospitals-from-excel.js
```

---

## 🔍 실행 과정

1. **파일 읽기**: 7개 Excel 파일을 순차적으로 읽습니다
2. **데이터 변환**: Excel 데이터를 hospitals 테이블 형식으로 변환
3. **샘플 출력**: 처음 5개 데이터를 출력하여 확인
4. **통계 출력**: 각 컬럼별 데이터 존재 여부 통계
5. **Supabase 삽입**: 배치로 100개씩 삽입

---

## ⚠️ 주의사항

1. **중복 데이터 처리**
   - 스크립트는 `upsert`를 사용하여 `name_kr`(사업장명)으로 중복 체크
   - 같은 사업장명이 있으면 업데이트, 없으면 삽입

2. **대용량 데이터**
   - 한 번에 100개씩 배치로 삽입
   - 7개 파일을 모두 처리하므로 시간이 걸릴 수 있습니다

3. **데이터 검증**
   - "사업장명"이 없는 행은 자동으로 스킵됩니다
   - 실행 전 샘플 데이터를 확인하세요

4. **백업**
   - 기존 데이터가 있다면 백업을 권장합니다

---

## 🔍 실행 결과 확인

스크립트 실행 후:

1. **Supabase Dashboard** → **Table Editor** → **hospitals** 테이블 확인
2. 데이터가 정상적으로 삽입되었는지 확인
3. 샘플 쿼리로 검증:

```sql
-- 전체 개수 확인
SELECT COUNT(*) FROM hospitals;

-- 샘플 데이터 확인
SELECT name_kr, city, district, type FROM hospitals LIMIT 10;

-- 시도별 통계
SELECT city, COUNT(*) as count 
FROM hospitals 
WHERE city IS NOT NULL
GROUP BY city 
ORDER BY count DESC;

-- 업종별 통계
SELECT type, COUNT(*) as count 
FROM hospitals 
WHERE type IS NOT NULL
GROUP BY type 
ORDER BY count DESC;
```

---

## 🐛 문제 해결

### 오류: "파일을 찾을 수 없습니다"
- Excel 파일이 `scripts/` 폴더에 있는지 확인
- 파일명이 정확한지 확인 (대소문자 구분)

### 오류: "사업장명 컬럼을 찾을 수 없습니다"
- Excel 파일의 첫 번째 행이 컬럼명인지 확인
- "사업장명" 컬럼이 있는지 확인

### 오류: "환경 변수를 설정해주세요"
- `.env` 파일에 Supabase 정보 추가
- 또는 실행 시 환경 변수 직접 지정

### 데이터가 일부만 삽입됨
- Excel 파일에 "사업장명"이 없는 행은 자동으로 스킵됩니다
- 샘플 데이터를 확인하여 문제가 있는지 확인하세요

---

## 📚 참고

- **공공데이터포털**: https://www.data.go.kr
- **Supabase 문서**: https://supabase.com/docs
- **xlsx 라이브러리**: https://www.npmjs.com/package/xlsx

