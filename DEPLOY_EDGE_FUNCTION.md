# 🚀 Edge Function 배포 가이드 (Edit/Deploy 버튼이 없는 경우)

## 문제
Supabase Dashboard에서 Edge Function의 "Edit" 또는 "Deploy" 버튼이 보이지 않습니다.

## 해결 방법

### 방법 1: Dashboard에서 직접 코드 복사/붙여넣기

1. **Supabase Dashboard** → Edge Functions → Functions 탭
2. **`make-server-3afd3c70`** 함수 클릭
3. 함수 상세 페이지에서:
   - **"Code"** 또는 **"Editor"** 탭 찾기
   - 또는 **"Create"** 또는 **"New Function"** 버튼 클릭
   - 함수 이름: `make-server-3afd3c70` 입력
4. 로컬 파일 `src/supabase/functions/server/index.tsx` 내용을 복사
5. Dashboard의 코드 에디터에 붙여넣기
6. **"Save"** 또는 **"Deploy"** 버튼 클릭

### 방법 2: Supabase CLI 사용 (권장)

#### Windows에서 Supabase CLI 설치

**옵션 A: Scoop 사용 (가장 쉬움)**
```powershell
# PowerShell을 관리자 권한으로 실행

# 1. Scoop 설치 (없는 경우)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# 2. Supabase CLI 설치
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**옵션 B: 직접 다운로드**
1. https://github.com/supabase/cli/releases 접속
2. Windows용 `.exe` 파일 다운로드 (예: `supabase_windows_amd64.exe`)
3. 파일 이름을 `supabase.exe`로 변경
4. `C:\Windows\System32` 또는 PATH에 추가된 폴더에 복사

#### CLI로 배포

```bash
# 1. 프로젝트 루트 디렉토리로 이동
cd C:\Users\yeomj\OneDrive\Desktop\shifty

# 2. Supabase 로그인
supabase login

# 3. 프로젝트 링크
supabase link --project-ref rbjyragopwwuyfbnjoqk

# 4. Edge Function 배포
supabase functions deploy make-server-3afd3c70 --project-ref rbjyragopwwuyfbnjoqk
```

### 방법 3: Dashboard에서 새 함수 생성

1. **Supabase Dashboard** → Edge Functions → Functions 탭
2. **"Deploy a new function"** 또는 **"Create function"** 버튼 클릭
3. 함수 이름: `make-server-3afd3c70` 입력
4. 로컬 파일 `src/supabase/functions/server/index.tsx` 내용을 복사
5. Dashboard의 코드 에디터에 붙여넣기
6. **"Deploy"** 버튼 클릭

---

## Secrets 설정

배포 전에 Secrets를 설정해야 합니다:

1. **Supabase Dashboard** → Edge Functions → **Secrets** 탭
2. 다음 시크릿 추가:
   - **Name**: `SERVICE_ROLE_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJianlyYWdvcHd3dXlmYm5qb3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NDE2MiwiZXhwIjoyMDc3NzUwMTYyfQ.918iS1KlYiVHl7wDc6MR-oTZBE3uchSyFWa_soeJUqs`

**참고**: `SUPABASE_URL`은 Supabase가 자동으로 제공하므로 별도 설정 불필요

---

## 배포 후 확인

1. **Edge Functions** → Functions 탭
2. `make-server-3afd3c70` 함수의 **"LAST UPDATED"** 시간이 방금 전으로 변경되었는지 확인
3. **"DEPLOYMENTS"** 숫자가 증가했는지 확인
4. 로컬에서 병원 검색 기능 테스트

---

## 문제 해결

### CLI 설치 실패
- PowerShell을 관리자 권한으로 실행
- 또는 직접 다운로드 방법 사용

### 배포 실패
- Secrets가 제대로 설정되었는지 확인
- Edge Function 코드에 문법 오류가 없는지 확인
- Supabase Dashboard → Edge Functions → Logs에서 오류 확인

---

**다음 단계**: 위 방법 중 하나를 선택하여 Edge Function을 재배포해 주세요!

