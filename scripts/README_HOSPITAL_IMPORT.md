# 🏥 병원 데이터 Excel 임포트 가이드

## 📋 개요

공공데이터포털에서 다운로드한 Excel 파일을 Supabase `hospitals` 테이블에 임포트하는 스크립트입니다.

---

## 📥 Excel 파일 준비

1. **공공데이터포털**에서 병원 데이터 다운로드
   - 업종: **병원** 선택
   - 형식: **EXCEL** 선택
   - 다운로드

2. **파일 저장**
   - 다운로드한 Excel 파일을 `scripts/hospitals.xlsx`로 저장
   - 또는 원하는 이름으로 저장 후 스크립트에서 경로 수정

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
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/import-hospitals-from-excel.js
```

---

## 📊 Excel 파일 구조

스크립트는 다음 컬럼명을 기대합니다 (실제 Excel 파일 구조에 맞게 수정 필요):

| Excel 컬럼명 | DB 컬럼명 | 설명 |
|------------|----------|------|
| 병원명 | name_kr | 병원명 (한글) |
| 병원명(영문) | name | 병원명 (영문) |
| 주소 | address | 전체 주소 |
| 시도 | city | 시/도 |
| 시군구 | district | 시/군/구 |
| 전화번호 | phone | 전화번호 |
| 업종 | type | 병원 유형 |
| 병상수 | beds | 병상 수 |
| 위도 | latitude | 위도 |
| 경도 | longitude | 경도 |

**⚠️ 중요:** 실제 Excel 파일의 컬럼명에 맞게 `scripts/import-hospitals-from-excel.js` 파일의 `mapping` 객체를 수정해야 합니다!

---

## 🚀 실행 방법

### 방법 1: 직접 실행

```bash
node scripts/import-hospitals-from-excel.js
```

### 방법 2: 환경 변수와 함께 실행

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxx \
node scripts/import-hospitals-from-excel.js
```

---

## 🔍 Excel 파일 컬럼명 확인 방법

실제 Excel 파일의 컬럼명을 확인하려면:

1. Excel 파일 열기
2. 첫 번째 행의 컬럼명 확인
3. `scripts/import-hospitals-from-excel.js` 파일의 `mapping` 객체 수정

예시:
```javascript
const mapping = {
  '실제Excel컬럼명1': 'name_kr',
  '실제Excel컬럼명2': 'address',
  // ...
};
```

---

## 📝 스크립트 수정 가이드

### Excel 컬럼명이 다른 경우

`transformHospitalData` 함수의 `mapping` 객체를 수정:

```javascript
const mapping = {
  '공공데이터의실제컬럼명': 'db_컬럼명',
  // 예시:
  '의료기관명': 'name_kr',
  '주소(전체)': 'address',
  '시도명': 'city',
  // ...
};
```

### 데이터 변환 로직 수정

특정 컬럼의 데이터를 변환해야 하는 경우:

```javascript
if (dbCol === 'beds') {
  // 병상수를 숫자로 변환
  hospital[dbCol] = parseInt(value) || null;
} else if (dbCol === 'type') {
  // 업종명 정규화
  hospital[dbCol] = normalizeType(value);
}
```

---

## ⚠️ 주의사항

1. **중복 데이터 처리**
   - 스크립트는 `upsert`를 사용하여 중복 데이터를 자동으로 처리합니다
   - 병원명으로 중복 체크 (필요시 수정)

2. **대용량 데이터**
   - 한 번에 100개씩 배치로 삽입합니다
   - 대용량 데이터의 경우 시간이 걸릴 수 있습니다

3. **데이터 검증**
   - 필수 필드(병원명)가 없는 행은 자동으로 스킵됩니다
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
SELECT COUNT(*) FROM hospitals;
SELECT * FROM hospitals LIMIT 10;
```

---

## 🐛 문제 해결

### 오류: "파일을 찾을 수 없습니다"
- Excel 파일 경로 확인
- `scripts/hospitals.xlsx` 파일이 존재하는지 확인

### 오류: "컬럼을 찾을 수 없습니다"
- Excel 파일의 첫 번째 행이 컬럼명인지 확인
- `mapping` 객체의 컬럼명이 실제 Excel 파일과 일치하는지 확인

### 오류: "환경 변수를 설정해주세요"
- `.env` 파일에 Supabase 정보 추가
- 또는 실행 시 환경 변수 직접 지정

---

## 📚 참고

- **공공데이터포털**: https://www.data.go.kr
- **Supabase 문서**: https://supabase.com/docs
- **xlsx 라이브러리**: https://www.npmjs.com/package/xlsx

