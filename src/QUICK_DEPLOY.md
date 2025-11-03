# ⚡ 5분 만에 Shifty 배포하기

## 📋 사전 준비

1. Supabase 프로젝트 생성 완료
2. SETUP_TABLES.sql 실행 완료
3. Vercel 계정 (무료)

---

## 🚀 배포 5단계

### 1단계: Vercel CLI 설치 & 로그인
```bash
npm i -g vercel
vercel login
```

### 2단계: 프로젝트 배포
```bash
vercel
```

질문에 답변:
- Set up and deploy? **Y**
- Which scope? **개인 계정 선택**
- Link to existing project? **N**
- What's your project's name? **shifty** (또는 원하는 이름)
- In which directory is your code located? **./**
- Auto-detected settings okay? **Y**

### 3단계: 환경 변수 설정
```bash
vercel env add SUPABASE_URL production
# 값 입력: your_supabase_url

vercel env add SUPABASE_ANON_KEY production
# 값 입력: your_anon_key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 값 입력: your_service_role_key
```

### 4단계: 프로덕션 배포
```bash
vercel --prod
```

### 5단계: 도메인 연결
```bash
vercel domains add shifty.kr
```

DNS 설정 (도메인 등록업체):
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

---

## ✅ 완료!

**배포 URL**: https://your-project.vercel.app  
**커스텀 도메인**: https://shifty.kr (DNS 전파 후)

---

## 🔄 업데이트 배포

코드 수정 후:
```bash
vercel --prod
```

---

## 📊 확인사항

1. **접속 테스트**
   - https://your-project.vercel.app 접속
   - 회원가입/로그인 테스트

2. **Supabase 연결 확인**
   - 회원가입 시 users 테이블에 데이터 저장되는지 확인

3. **Edge Function 배포**
   ```bash
   supabase functions deploy make-server-3afd3c70
   ```

---

## ⚠️ 문제 발생 시

### 빌드 실패
```bash
# 로컬 빌드 테스트
npm run build
```

### 환경 변수 오류
```bash
# 환경 변수 재설정
vercel env rm SUPABASE_URL production
vercel env add SUPABASE_URL production
```

### 더 자세한 내용
- **DEPLOY.md** - 상세 배포 가이드
- **VERCEL_CHECKLIST.md** - 배포 체크리스트

---

Made with 💙 by **주식회사 98점7도**
