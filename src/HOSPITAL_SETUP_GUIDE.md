# 🏥 병원 검색 기능 설정 가이드

**전국 병원 DB 구축 및 검색 기능 활성화**

---

## 📋 설정 단계

### 1단계: 데이터베이스 테이블 생성

**Supabase Dashboard에서 실행:**

1. Supabase Dashboard 접속
2. SQL Editor → New Query
3. `src/SETUP_HOSPITALS_TABLE.sql` 파일 내용 복사 & 붙여넣기
4. Run 버튼 클릭

**확인:**
```sql
SELECT COUNT(*) FROM hospitals;
```

---

### 2단계: 초기 데이터 입력

**옵션 1: 샘플 데이터 (빠른 테스트)**

`SETUP_HOSPITALS_TABLE.sql`에 이미 주요 병원 10개가 포함되어 있습니다.

**옵션 2: 공공데이터 API로 전체 데이터 수집**

1. **공공데이터포털 인증키 발급**
   - https://www.data.go.kr/ 접속
   - 회원가입 및 로그인
   - "병원정보서비스" API 검색
   - 인증키 발급

2. **스크립트 설정**
   ```bash
   # scripts/fetch-hospitals.js 파일 수정
   const SERVICE_KEY = '발급받은_인증키';
   ```

3. **스크립트 실행**
   ```bash
   node scripts/fetch-hospitals.js
   ```

**참고:** 공공데이터 API는 초당 1회 호출 제한이 있으므로, 전체 데이터 수집에는 시간이 걸릴 수 있습니다.

---

### 3단계: 서버 배포

**Supabase Edge Function 배포:**

```bash
# Supabase CLI 사용
supabase functions deploy server

# 또는 Supabase Dashboard에서 직접 배포
```

**확인:**
```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3afd3c70/hospitals/search?q=서울대
```

---

### 4단계: 프론트엔드 테스트

1. **회원가입 페이지 테스트**
   - 회원가입 화면에서 "근무 병원" 입력
   - 병원명 입력 시 자동완성 확인

2. **마이페이지 테스트**
   - 마이페이지에서 병원 정보 수정
   - 검색 기능 확인

---

## 🔧 문제 해결

### 문제 1: 검색 결과가 나오지 않음

**원인:**
- `hospitals` 테이블에 데이터가 없음
- RLS 정책 문제

**해결:**
```sql
-- 데이터 확인
SELECT COUNT(*) FROM hospitals;

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'hospitals';
```

### 문제 2: API 호출 실패

**원인:**
- 서버가 배포되지 않음
- CORS 문제

**해결:**
- Supabase Edge Function 배포 확인
- 브라우저 콘솔에서 에러 확인

### 문제 3: 자동완성이 작동하지 않음

**원인:**
- API 엔드포인트 URL 오류
- 네트워크 에러

**해결:**
- 브라우저 개발자 도구 → Network 탭 확인
- API 응답 확인

---

## 📊 데이터 수집 방법

### 방법 1: 공공데이터 API (추천)

**장점:**
- 무료
- 정기 업데이트
- 약 3만개 병원 정보

**단점:**
- 초당 1회 호출 제한
- 전체 수집에 시간 소요

### 방법 2: 수동 입력

**장점:**
- 빠른 구현
- 필요한 병원만 입력

**단점:**
- 데이터 양 제한
- 수동 관리 필요

### 방법 3: 하이브리드

1. **1단계**: 주요 병원 100-500개 수동 입력 (빠른 시작)
2. **2단계**: 공공데이터 API로 전체 데이터 수집 (백그라운드)

---

## 🎯 다음 단계

1. **데이터 수집 완료 후:**
   - 검색 성능 최적화
   - 지역별 필터링 추가
   - 병원 상세 정보 표시

2. **추가 기능:**
   - 병원별 통계
   - 인기 병원 순위
   - 병원 인증 기능

---

**작성일**: 2025년
**작성자**: AI Assistant
**상태**: 구현 완료, 설정 대기

