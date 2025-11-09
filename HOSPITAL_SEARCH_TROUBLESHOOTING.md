# 🔍 병원 검색 API 문제 해결 과정 정리

## 📋 문제 요약

병원 검색 API가 로컬에서 404 오류를 발생시키며 작동하지 않았습니다.

---

## 🐛 주요 문제점들

### 1. **Supabase Edge Function의 경로 처리 방식 이해 부족**

**문제:**
- Supabase Edge Function은 함수 이름을 경로에서 **자동으로 제거**합니다
- 클라이언트 호출: `/functions/v1/make-server-3afd3c70/hospitals/search`
- Edge Function 내부에서 받는 경로: `/hospitals/search` (함수 이름 제거됨)

**해결:**
- Edge Function 내부 경로에서 함수 이름(`/make-server-3afd3c70/...`)을 제거해야 함
- `/hospitals/search`로 직접 라우팅 설정

---

### 2. **Dashboard 테스트 환경과 실제 클라이언트 호출의 경로 차이**

**문제:**
- **Dashboard 테스트**: 경로가 `/make-server-3afd3c70`만 들어옴 (함수 이름만)
- **실제 클라이언트 호출**: `/functions/v1/make-server-3afd3c70/hospitals/search` (전체 경로)

**해결:**
- 두 가지 경우를 모두 처리하는 커스텀 핸들러 구현
- Dashboard 테스트 환경: 함수 이름만 있는 경우 쿼리 파라미터로 병원 검색 감지
- 실제 클라이언트 호출: 경로에서 함수 이름 제거 후 처리

---

### 3. **JWT 인증 설정 문제**

**문제:**
- Supabase Edge Function의 기본 설정에서 "Verify JWT with legacy secret"이 **ON**으로 되어 있음
- 공개 API인 병원 검색도 JWT 인증을 요구하여 401 오류 발생

**해결:**
- Dashboard에서 "Verify JWT with legacy secret" 설정을 **OFF**로 변경
- 또는 코드에서 공개 API 경로를 인증 없이 처리하도록 설정

---

### 4. **환경 변수 설정 문제**

**문제:**
- `SUPABASE_SERVICE_ROLE_KEY`를 Secrets에 설정하려 했지만 `SUPABASE_` 접두사 때문에 오류 발생
- Supabase는 `SUPABASE_` 접두사로 시작하는 시크릿 이름을 허용하지 않음

**해결:**
- `SERVICE_ROLE_KEY`로 이름 변경 (접두사 제거)
- `SUPABASE_URL`은 Supabase가 자동 제공하므로 별도 설정 불필요

---

### 5. **Edge Function 재배포 필요성**

**문제:**
- 코드를 수정하거나 Secrets를 변경한 후 **재배포**를 하지 않음
- Supabase Edge Function은 자동 배포되지 않음

**해결:**
- 코드 수정 후 Dashboard에서 Edge Function 재배포 필요
- 또는 Supabase CLI를 사용하여 배포

---

## 🔧 최종 해결 방법

### 1. Edge Function 경로 처리 로직 개선

```typescript
Deno.serve(async (req) => {
  const url = new URL(req.url);
  let pathname = url.pathname;
  
  const functionName = 'make-server-3afd3c70';
  
  // 경로에서 함수 이름 제거
  if (pathname.startsWith(`/functions/v1/${functionName}/`)) {
    pathname = pathname.replace(`/functions/v1/${functionName}`, '');
  } else if (pathname.startsWith(`/${functionName}/`)) {
    pathname = pathname.replace(`/${functionName}`, '');
  } else if (pathname === `/${functionName}` || pathname === `/functions/v1/${functionName}`) {
    // Dashboard 테스트 환경: 함수 이름만 있는 경우
    const query = url.searchParams.get('q');
    if (query) {
      pathname = '/hospitals/search';
    } else {
      pathname = '/';
    }
  }
  
  // 경로를 수정한 새 요청 생성
  const newUrl = new URL(req.url);
  newUrl.pathname = pathname;
  const newReq = new Request(newUrl.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
  
  return app.fetch(newReq);
});
```

### 2. Edge Function 내부 경로 설정

```typescript
// 올바른 경로 설정
app.get("/hospitals/search", async (c) => {
  // 병원 검색 로직
});

// 잘못된 경로 설정 (함수 이름 포함)
app.get("/make-server-3afd3c70/hospitals/search", async (c) => {
  // 이렇게 하면 404 오류 발생
});
```

### 3. Secrets 설정

- **Name**: `SERVICE_ROLE_KEY` (주의: `SUPABASE_` 접두사 없이)
- **Value**: Service Role Key 값

---

## 📚 교훈

1. **Supabase Edge Function의 경로 처리 방식을 정확히 이해해야 함**
   - 함수 이름은 자동으로 제거됨
   - 내부 경로에서는 함수 이름을 포함하지 않아야 함

2. **테스트 환경과 실제 환경의 차이를 고려해야 함**
   - Dashboard 테스트와 실제 클라이언트 호출의 경로가 다를 수 있음
   - 두 가지 경우를 모두 처리해야 함

3. **환경 변수 설정 시 Supabase 정책을 확인해야 함**
   - `SUPABASE_` 접두사로 시작하는 시크릿 이름은 사용 불가
   - `SUPABASE_URL`은 자동 제공되므로 별도 설정 불필요

4. **코드 수정 후 반드시 재배포해야 함**
   - Edge Function은 자동 배포되지 않음
   - 코드나 Secrets 변경 후 재배포 필수

5. **디버깅 로그를 적극 활용해야 함**
   - 실제 경로를 확인하기 위해 로그 추가
   - Logs 탭에서 실제 경로 확인

---

## ✅ 최종 결과

- ✅ Dashboard 테스트 환경에서 작동
- ✅ 실제 클라이언트 호출에서 작동
- ✅ 경로 처리 로직 개선
- ✅ JWT 인증 설정 완료
- ✅ 환경 변수 설정 완료

---

**결론**: Supabase Edge Function의 경로 처리 방식과 테스트 환경의 차이를 이해하지 못해 발생한 문제였습니다. 경로 처리 로직을 개선하고 환경 변수를 올바르게 설정하여 해결했습니다.

