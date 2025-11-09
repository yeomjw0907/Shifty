# 🔑 Supabase 인증 정보 빠른 확인 가이드

## 📍 확인 위치

### 1. Supabase Dashboard 접속
- https://supabase.com/dashboard
- 로그인 후 프로젝트 선택

---

## 🔍 SUPABASE_URL 확인

### 경로: Settings → API

1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. **Project URL** 섹션에서 확인
   - 예: `https://rbjyragopwwuyfbnjoqk.supabase.co`

**현재 프로젝트 ID:** `rbjyragopwwuyfbnjoqk`

**따라서 URL은:**
```
https://rbjyragopwwuyfbnjoqk.supabase.co
```

---

## 🔐 SUPABASE_SERVICE_ROLE_KEY 확인

### 경로: Settings → API

1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. **Project API keys** 섹션으로 스크롤
4. **`service_role`** 키 찾기
   - ⚠️ **주의**: `anon` 키가 아닌 `service_role` 키입니다!
5. **Reveal** 버튼 클릭하여 키 표시
6. 키 복사

**형식:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJianlyYWdvcHd3dXlmYm5qb3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3NDE2MiwiZXhwIjoyMDc3NzUwMTYyfQ.xxxxx
```

---

## 📝 .env 파일 설정

프로젝트 루트에 `.env` 파일 생성:

```env
SUPABASE_URL=https://rbjyragopwwuyfbnjoqk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_키_붙여넣기
```

---

## ⚠️ 중요 주의사항

1. **`service_role` 키는 절대 공개하면 안 됩니다!**
   - GitHub에 커밋하지 마세요
   - 클라이언트 코드에 포함하지 마세요
   - `.env` 파일은 `.gitignore`에 추가되어 있어야 합니다

2. **`anon` 키와 `service_role` 키의 차이:**
   - `anon` 키: 클라이언트에서 사용 (공개 가능)
   - `service_role` 키: 서버에서만 사용 (비공개, RLS 우회)

---

## 🚀 스크립트 실행

`.env` 파일에 정보를 저장한 후:

```bash
npm run import-hospitals
```

또는 환경 변수를 직접 지정:

```bash
SUPABASE_URL=https://rbjyragopwwuyfbnjoqk.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
npm run import-hospitals
```

---

## 📸 스크린샷 가이드

### Settings → API 페이지에서:

1. **Project URL** 섹션
   - 상단에 표시됨
   - 복사 버튼 클릭

2. **Project API keys** 섹션
   - `anon` `public` 키 (이건 아님)
   - `service_role` `secret` 키 (이걸 사용!)
   - Reveal 버튼 클릭하여 표시

---

## ✅ 확인 체크리스트

- [ ] Supabase Dashboard 접속
- [ ] Settings → API 메뉴 클릭
- [ ] Project URL 복사
- [ ] `service_role` 키 찾기
- [ ] Reveal 버튼 클릭
- [ ] `service_role` 키 복사
- [ ] `.env` 파일에 저장

---

**참고:** 프로젝트 ID는 이미 `rbjyragopwwuyfbnjoqk`로 확인되었으므로, URL은 자동으로 구성할 수 있습니다.

