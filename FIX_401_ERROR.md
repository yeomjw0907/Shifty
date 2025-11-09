# 🔧 401 오류 해결 가이드

## ❌ 문제
병원 검색 API 호출 시 `401 Unauthorized` 오류가 발생합니다.

## 🔍 원인
Supabase Dashboard에서 Edge Function의 **"Verify JWT with legacy secret"** 설정이 **ON (활성화)** 되어 있어서, 인증 없이 호출되는 공개 API가 차단되고 있습니다.

## ✅ 해결 방법

### 방법 1: Dashboard에서 JWT 인증 설정 OFF (권장)

1. **Supabase Dashboard** → https://supabase.com/dashboard 접속
2. 프로젝트 `rbjyragopwwuyfbnjoqk` 선택
3. **Edge Functions** → **Functions** 탭
4. **`make-server-3afd3c70`** 함수 클릭 (또는 `bright-task` 함수)
5. **"Details"** 또는 **"Settings"** 탭으로 이동
6. **"Function Configuration"** 섹션 찾기
7. **"Verify JWT with legacy secret"** 토글을 **OFF (비활성화)** 로 변경
8. **"Save"** 또는 **"Deploy"** 클릭

### 방법 2: 코드에서 인증 우회 (대안)

만약 Dashboard에서 설정을 변경할 수 없다면, 코드에서 인증을 우회할 수 있습니다. 하지만 이는 보안상 권장되지 않습니다.

---

## 📋 확인 사항

### 1. 함수 이름 확인
- 현재 사용 중인 Edge Function 이름 확인:
  - `make-server-3afd3c70` (우리가 작업한 함수)
  - `bright-task` (다른 함수일 수 있음)

### 2. API 엔드포인트 확인
콘솔에서 호출되는 URL 확인:
```
https://rbjyragopwwuyfbnjoqk.supabase.co/functions/v1/make-server-3afd3c70/hospitals/search
```

### 3. Secrets 확인
- **Edge Functions** → **Secrets** 탭
- `SERVICE_ROLE_KEY`가 설정되어 있는지 확인
- 값: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (전체 service role key)

---

## 🧪 테스트

설정 변경 후:

1. 브라우저 새로고침 (F5)
2. 병원 검색 기능 테스트
3. 개발자 도구 콘솔 확인:
   - ✅ 성공: 병원 목록이 표시됨
   - ❌ 실패: 여전히 401 오류가 발생하면 다른 원인 확인

---

## 🔍 추가 문제 해결

### 문제 1: "Verify JWT with legacy secret" 토글이 보이지 않음
**해결**: 
- 함수의 "Details" 또는 "Settings" 탭에서 찾기
- 또는 "Function Configuration" 섹션 확인

### 문제 2: 설정을 OFF로 변경했는데도 401 오류 발생
**해결**:
1. Edge Function 재배포 확인
2. Secrets에서 `SERVICE_ROLE_KEY` 값 확인
3. 브라우저 캐시 삭제 후 재시도

### 문제 3: 다른 함수 이름이 사용 중
**해결**:
- `bright-task` 함수의 설정도 확인
- 또는 `make-server-3afd3c70` 함수가 실제로 배포되었는지 확인

---

**다음 단계**: Dashboard에서 "Verify JWT with legacy secret" 설정을 OFF로 변경한 후 다시 테스트해 주세요!

