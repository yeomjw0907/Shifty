# ✅ Vercel 배포 체크리스트

## 배포 전 준비

### 1. Supabase 설정 완료
- [ ] Supabase 프로젝트 생성
- [ ] SETUP_TABLES.sql 실행 완료
- [ ] Edge Function 배포 완료
  ```bash
  supabase functions deploy make-server-3afd3c70
  ```
- [ ] 환경 변수 확인:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`

### 2. 소셜 로그인 설정 (선택사항)
- [ ] 카카오 OAuth 설정
- [ ] 구글 OAuth 설정
- [ ] 네이버 OAuth 설정
- [ ] Supabase에 Provider 연결

### 3. 관리자 설정
- [ ] AdminApp.tsx의 ADMIN_EMAILS 설정
- [ ] server/index.tsx의 ADMIN_EMAILS 설정

---

## Vercel 배포

### 방법 1: CLI 배포 (권장)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 배포 (첫 배포)
vercel

# 4. 환경 변수 추가
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 5. 프로덕션 배포
vercel --prod
```

### 방법 2: GitHub 연동

1. **GitHub에 Push**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/shifty.git
   git push -u origin main
   ```

2. **Vercel Dashboard에서 Import**
   - https://vercel.com/new
   - GitHub repository 선택
   - 환경 변수 입력
   - Deploy 클릭

---

## 도메인 연결 (shifty.kr)

### 1. Vercel에서 도메인 추가
- Vercel Dashboard → 프로젝트 → Settings → Domains
- Add Domain: `shifty.kr`
- Add Domain: `www.shifty.kr`

### 2. DNS 레코드 설정

**가비아/후이즈/GoDaddy 등 도메인 등록업체에서:**

#### A 레코드
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 자동
```

#### CNAME 레코드 (www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 자동
```

#### CNAME 레코드 (admin - 선택사항)
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: 자동
```

### 3. DNS 전파 대기
- 보통 5분~2시간 소요
- 최대 48시간 가능
- `nslookup shifty.kr` 명령으로 확인

---

## 배포 후 확인

### 1. 기본 접속 확인
- [ ] https://shifty.kr 접속 가능
- [ ] HTTPS 적용 확인
- [ ] PWA manifest.json 로드 확인

### 2. 기능 테스트
- [ ] 회원가입
- [ ] 로그인
- [ ] 소셜 로그인 (설정한 경우)
- [ ] 팀 생성
- [ ] 일정 추가
- [ ] 팀 초대/참여

### 3. 관리자 대시보드 (설정한 경우)
- [ ] https://shifty.kr/admin 접속
- [ ] 또는 https://admin.shifty.kr 접속
- [ ] 통계 데이터 확인

### 4. 성능 확인
- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 모바일 반응형 확인
- [ ] 로딩 속도 확인

---

## 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인
vercel logs
```

### 환경 변수 오류
```bash
# 환경 변수 목록 확인
vercel env ls

# 환경 변수 제거 후 재등록
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### 도메인 연결 안 됨
```bash
# DNS 확인
nslookup shifty.kr

# Whois 확인
whois shifty.kr
```

### HTTPS 오류
- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- 도메인 연결 후 몇 분 대기
- 강제 HTTPS 리다이렉트는 Vercel이 자동 처리

---

## 모니터링

### Vercel Analytics
- Dashboard → Analytics
- 방문자 수, 성능 지표 확인

### Supabase Monitoring
- Dashboard → Logs
- API 요청, 에러 확인

### Error Tracking
- Vercel Dashboard → Logs
- 실시간 에러 모니터링

---

## 자동 배포 설정

GitHub 연동 시 자동 배포:
- `main` 브랜치 Push → 프로덕션 자동 배포
- PR 생성 → 프리뷰 자동 배포
- 커밋마다 고유 URL 생성

---

## 배포 완료! 🎉

**서비스 주소**: https://shifty.kr  
**관리자**: https://shifty.kr/admin 또는 https://admin.shifty.kr

**제작**: 주식회사 98점7도
