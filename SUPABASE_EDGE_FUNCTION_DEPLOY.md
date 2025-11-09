# 🚀 Supabase Edge Function 재배포 가이드

## ⚠️ 중요: Edge Function은 자동 배포되지 않습니다!

코드를 수정하거나 Secrets(환경 변수)를 변경한 후에는 **반드시 재배포**해야 합니다.

---

## 📋 방법 1: Supabase Dashboard에서 배포 (권장)

### 1단계: Edge Function 코드 확인
- 현재 Edge Function 위치: `src/supabase/functions/server/index.tsx`
- Function 이름: `make-server-3afd3c70`

### 2단계: Supabase Dashboard 접속
1. **Supabase Dashboard** → https://supabase.com/dashboard
2. 프로젝트 선택: `rbjyragopwwuyfbnjoqk`
3. **Edge Functions** 메뉴 클릭

### 3단계: Secrets 확인
1. **Edge Functions** → **Secrets** 탭
2. 다음 시크릿이 설정되어 있는지 확인:
   - ✅ `SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJianlyYWdvcHd3dXlmYm5qb3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NDE2MiwiZXhwIjoyMDc3NzUwMTYyfQ.918iS1KlYiVHl7wDc6MR-oTZBE3uchSyFWa_soeJUqs`
   - ⚠️ `SUPABASE_URL`은 자동 제공되므로 별도 설정 불필요

### 4단계: Edge Function 재배포
1. **Edge Functions** → **Functions** 탭
2. `make-server-3afd3c70` 함수 찾기
3. **"Deploy"** 또는 **"Redeploy"** 버튼 클릭
4. 또는 **"Edit"** → 코드 확인 → **"Deploy"** 클릭

### 5단계: 배포 완료 확인
- 배포 상태가 **"Active"** 또는 **"Deployed"**로 표시되는지 확인
- 배포 로그에서 오류가 없는지 확인

---

## 📋 방법 2: Supabase CLI 사용 (선택사항)

### Windows에서 Supabase CLI 설치

#### 옵션 A: Scoop 사용 (권장)
```powershell
# Scoop 설치 (없는 경우)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Supabase CLI 설치
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 옵션 B: 직접 다운로드
1. https://github.com/supabase/cli/releases 에서 최신 버전 다운로드
2. Windows용 `.exe` 파일 다운로드
3. PATH에 추가

### CLI로 배포
```bash
# 1. Supabase 로그인
supabase login

# 2. 프로젝트 링크
supabase link --project-ref rbjyragopwwuyfbnjoqk

# 3. Edge Function 배포
supabase functions deploy make-server-3afd3c70
```

---

## ✅ 배포 후 확인

### 1. Edge Function 상태 확인
- Supabase Dashboard → Edge Functions → Functions
- `make-server-3afd3c70` 상태가 **"Active"**인지 확인

### 2. 로컬에서 테스트
1. 브라우저 개발자 도구 열기 (F12)
2. **Console** 탭 확인
3. 병원 검색 기능 테스트
4. 오류 메시지 확인:
   - ✅ 성공: 병원 목록이 표시됨
   - ❌ 실패: 401 오류가 계속 발생하면 Secrets 재확인

### 3. Edge Function 로그 확인
- Supabase Dashboard → Edge Functions → Logs
- 최근 요청과 응답 로그 확인
- 오류 메시지가 있는지 확인

---

## 🔍 문제 해결

### 문제 1: 401 Unauthorized 오류가 계속 발생
**원인**: `SERVICE_ROLE_KEY`가 제대로 설정되지 않았거나 Edge Function이 재배포되지 않음

**해결**:
1. Supabase Dashboard → Edge Functions → Secrets
2. `SERVICE_ROLE_KEY` 값 확인
3. Edge Function 재배포

### 문제 2: "Missing authorization header" 오류
**원인**: Edge Function이 `SERVICE_ROLE_KEY`를 읽지 못함

**해결**:
1. Secrets에서 `SERVICE_ROLE_KEY` 이름 확인 (대소문자 구분)
2. Edge Function 코드에서 `Deno.env.get("SERVICE_ROLE_KEY")` 확인
3. Edge Function 재배포

### 문제 3: 배포 버튼이 보이지 않음
**원인**: Edge Function이 아직 생성되지 않았거나 다른 이름으로 배포됨

**해결**:
1. Edge Functions 목록에서 `make-server-3afd3c70` 확인
2. 없다면 새로 생성하거나 다른 이름의 함수 확인
3. 또는 Supabase CLI로 배포

---

## 📝 참고사항

- **`SUPABASE_URL`**: Supabase가 자동으로 제공하므로 Secrets에 추가할 필요 없음
- **`SERVICE_ROLE_KEY`**: `SUPABASE_` 접두사 없이 설정해야 함
- **재배포**: 코드나 Secrets 변경 후 반드시 재배포 필요
- **배포 시간**: 보통 1-2분 소요

---

**다음 단계**: 배포 완료 후 로컬에서 병원 검색 기능을 다시 테스트해 주세요!

