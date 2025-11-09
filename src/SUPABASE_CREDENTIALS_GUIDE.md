# 🔑 Supabase 인증 정보 확인 가이드

## 📋 개요

Excel 파일 임포트 스크립트를 실행하기 위해 필요한 Supabase 인증 정보를 확인하는 방법입니다.

---

## 🔍 Supabase Dashboard에서 확인하기

### 1. Supabase Dashboard 접속

1. **Supabase 웹사이트 접속**: https://supabase.com
2. **로그인** 후 대시보드 접속
3. **프로젝트 선택** (Shifty 프로젝트)

---

## 📍 SUPABASE_URL 확인 방법

### 방법 1: Settings → API

1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. **Project URL** 섹션에서 확인
   - 예: `https://xxxxx.supabase.co`

**사용할 값:**
```
SUPABASE_URL=https://xxxxx.supabase.co
```

---

## 🔐 SUPABASE_SERVICE_ROLE_KEY 확인 방법

### 방법 1: Settings → API

1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. **Project API keys** 섹션에서 확인
4. **`service_role`** 키 찾기 (⚠️ 주의: `anon` 키가 아님!)
5. **Reveal** 버튼 클릭하여 키 표시

**사용할 값:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 중요:**
- `service_role` 키는 **절대 공개하면 안 됩니다!**
- 이 키는 서버 사이드에서만 사용해야 합니다
- 클라이언트 코드에 포함하지 마세요
- `.env` 파일에 저장하고 `.gitignore`에 추가하세요

---

## 📝 .env 파일 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ 주의:**
- `.env` 파일은 Git에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요

---

## 🔍 현재 프로젝트에서 사용 중인 값 확인

프로젝트에서 이미 사용 중인 Supabase 정보를 확인하려면:

### 1. 프로젝트 ID 확인

`src/utils/supabase/info.ts` 파일 확인:
```typescript
export const projectId = 'your-project-id';
```

### 2. URL 구성

프로젝트 ID를 알면 URL을 구성할 수 있습니다:
```
https://{projectId}.supabase.co
```

예:
- 프로젝트 ID: `qyua993bz-garden-yeoms-projects`
- URL: `https://qyua993bz-garden-yeoms-projects.supabase.co`

---

## ✅ 확인 체크리스트

- [ ] Supabase Dashboard 접속
- [ ] Settings → API 메뉴 확인
- [ ] Project URL 복사
- [ ] `service_role` 키 찾기
- [ ] `service_role` 키 Reveal하여 복사
- [ ] `.env` 파일에 저장
- [ ] `.gitignore`에 `.env` 추가 확인

---

## 🚀 스크립트 실행

`.env` 파일에 정보를 저장한 후:

```bash
npm run import-hospitals
```

또는 환경 변수를 직접 지정:

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxx \
npm run import-hospitals
```

---

## 📚 참고

- **Supabase Dashboard**: https://supabase.com/dashboard
- **API 문서**: https://supabase.com/docs/reference/javascript/initializing
- **환경 변수 가이드**: https://supabase.com/docs/guides/getting-started/local-development#environment-variables

