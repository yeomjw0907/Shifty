# 🚀 Shifty Vercel 배포 가이드

## 배포 전 체크리스트

### 1. Supabase 프로젝트 설정 완료 확인
- [ ] Supabase 프로젝트 생성
- [ ] `SETUP_TABLES.sql` 실행하여 테이블 생성
- [ ] 소셜 로그인 프로바이더 설정 (카카오/구글/네이버)

### 2. 환경 변수 준비
프로젝트에서 사용하는 환경 변수들:
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

## Vercel 배포 방법

### 방법 1: Vercel CLI 사용 (권장)

1. **Vercel CLI 설치**
```bash
npm i -g vercel
```

2. **로그인**
```bash
vercel login
```

3. **프로젝트 배포**
```bash
vercel
```

4. **환경 변수 설정**
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

5. **프로덕션 배포**
```bash
vercel --prod
```

### 방법 2: Vercel Dashboard 사용

1. **GitHub 연동**
   - GitHub에 코드 푸시
   - Vercel Dashboard에서 Import Project
   - Repository 선택

2. **환경 변수 설정**
   - Settings → Environment Variables
   - 위의 환경 변수들 추가

3. **배포**
   - Deploy 버튼 클릭

## 도메인 연결 (shifty.kr)

### Vercel에서 도메인 추가

1. **Vercel Dashboard**
   - 프로젝트 선택
   - Settings → Domains
   - Add Domain: `shifty.kr`

2. **DNS 설정**
   - 도메인 등록 업체 (가비아, 후이즈 등)에서 DNS 레코드 추가:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

3. **서브도메인 추가 (선택사항)**
   - 관리자 페이지용: `admin.shifty.kr`
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### Vercel이 제공하는 DNS 레코드 확인
- Vercel Dashboard에서 도메인 추가 시 정확한 DNS 레코드가 표시됩니다
- 표시되는 값으로 정확히 설정하세요

## 배포 후 확인사항

### 1. 기본 기능 테스트
- [ ] 회원가입/로그인
- [ ] 소셜 로그인
- [ ] 팀 생성
- [ ] 팀 초대 코드 공유
- [ ] 팀 참여
- [ ] 일정 추가/수정/삭제
- [ ] 캘린더 뷰 확인
- [ ] PWA 설치 가능 확인

### 2. 성능 확인
- [ ] Lighthouse 점수 확인
- [ ] 로딩 속도 확인
- [ ] 모바일 반응형 확인

### 3. Supabase Edge Function 배포
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# Edge Function 배포
supabase functions deploy make-server-3afd3c70
```

## 문제 해결

### 배포 실패 시
1. `vercel logs` 명령으로 로그 확인
2. 환경 변수 설정 확인
3. `node_modules` 삭제 후 재설치

### 도메인 연결 안 될 시
1. DNS 전파 시간 대기 (최대 48시간, 보통 1-2시간)
2. `nslookup shifty.kr` 명령으로 DNS 확인
3. Vercel Dashboard에서 도메인 상태 확인

### Supabase 연결 오류 시
1. 환경 변수 값 확인
2. Supabase 프로젝트 상태 확인
3. Edge Function 배포 상태 확인

## 자동 배포 설정

GitHub 연동 시 자동으로 설정됩니다:
- `main` 브랜치 푸시 → 프로덕션 배포
- PR 생성 → 프리뷰 배포

## 모니터링

### Vercel Analytics
- Vercel Dashboard에서 Analytics 탭 확인
- 실시간 방문자, 성능 지표 확인

### Supabase 모니터링
- Supabase Dashboard → Logs
- API 요청, 에러 로그 확인

---

**제작**: 주식회사 98점7도  
**문의**: 도메인이 연결되면 `https://shifty.kr`에서 서비스 이용 가능
