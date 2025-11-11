# 🚨 Edge Function 배포 확인 체크리스트

## 현재 문제
- CORS 오류 발생
- Edge Function 로그가 전혀 나타나지 않음
- 요청이 Edge Function에 도달하지 않는 것으로 보임

## 🔍 1단계: 함수 이름 확인 (가장 중요!)

### Supabase Dashboard에서 확인
1. **Supabase Dashboard** 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `rbjyragopwwuyfbnjoqk`
3. **Edge Functions** → **Functions** 탭
4. **함수 목록 확인**:
   - 함수 이름이 `server`인지 확인
   - 또는 함수 이름이 `make-server-3afd3c70`인지 확인

### 함수 이름에 따른 설정

#### 경우 1: 함수 이름이 `server`인 경우
- ✅ 현재 설정이 맞습니다
- API_BASE: `https://rbjyragopwwuyfbnjoqk.supabase.co/functions/v1/server`
- 클라이언트 요청: `/functions/v1/server/make-server-3afd3c70/teams`
- Supabase가 전달: `/make-server-3afd3c70/teams`

#### 경우 2: 함수 이름이 `make-server-3afd3c70`인 경우
- ❌ API_BASE를 수정해야 합니다
- `src/utils/api.ts` 파일 수정:
```typescript
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3afd3c70`;
```
- 그리고 URL에서 `/make-server-3afd3c70` 제거:
```typescript
const url = `${API_BASE}/teams`; // make-server-3afd3c70 제거
```

## 🔍 2단계: Edge Function 배포 확인

### Dashboard에서 확인
1. **Edge Functions** → **Functions** 탭
2. 함수 클릭
3. **"DEPLOYMENTS"** 섹션 확인:
   - 최근 배포 시간 확인
   - 배포 상태가 **"Active"**인지 확인
   - 배포 로그에 오류가 없는지 확인

### 배포되지 않았다면
1. **"Deploy"** 또는 **"Redeploy"** 버튼 클릭
2. 또는 **"Edit"** → 코드 붙여넣기 → **"Deploy"**

## 🔍 3단계: Edge Function 로그 확인

### Dashboard에서 로그 확인
1. **Edge Functions** → **Logs** 탭
2. 최근 요청 확인:
   - 요청이 도달하는지 확인
   - 오류 메시지 확인
   - "🚀 Edge Function 실행됨!" 로그가 보이는지 확인

### 로그가 전혀 없다면
- Edge Function이 배포되지 않았거나
- 함수 이름이 잘못되었거나
- 요청이 Edge Function에 도달하지 못하고 있음

## 🔍 4단계: Secrets 확인

### 필수 Secrets
1. **Edge Functions** → **Secrets** 탭
2. 다음 시크릿이 설정되어 있는지 확인:
   - ✅ `SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJianlyYWdvcHd3dXlmYm5qb3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NDE2MiwiZXhwIjoyMDc3NzUwMTYyfQ.918iS1KlYiVHl7wDc6MR-oTZBE3uchSyFWa_soeJUqs`
   - ⚠️ `SUPABASE_URL`은 자동 제공되므로 별도 설정 불필요

## ✅ 다음 단계

1. **함수 이름 확인** 후 알려주세요
2. 함수 이름에 따라 코드 수정
3. Edge Function 재배포
4. 다시 테스트

## 📝 참고

현재 코드는 함수 이름이 `server`라고 가정하고 있습니다.
만약 함수 이름이 다르다면 `src/utils/api.ts`의 `API_BASE`를 수정해야 합니다.

