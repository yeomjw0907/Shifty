# 🚀 출시 준비 완료 체크리스트

## 📋 개요
이 문서는 Shifty 앱을 **실제로 출시할 수 있는 상태**가 되기 위한 최종 체크리스트입니다.

---

## ✅ Phase 1: 데이터베이스 설정

### 1.1 Supabase 테이블 생성
- [ ] `src/SETUP_NOTIFICATION_TABLES.sql` 실행 완료
- [ ] `src/SETUP_ANALYTICS_TABLES.sql` 실행 완료
- [ ] 6개 테이블 생성 확인:
  - [ ] `notifications`
  - [ ] `notification_settings`
  - [ ] `fcm_tokens`
  - [ ] `user_visits`
  - [ ] `admin_popups`
  - [ ] `popup_interactions`

**확인 SQL:**
```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'notifications',
    'notification_settings',
    'fcm_tokens',
    'user_visits',
    'admin_popups',
    'popup_interactions'
  );
```

---

## ✅ Phase 2: Firebase 설정

### 2.1 Firebase 프로젝트
- [ ] Firebase 프로젝트 생성 완료
- [ ] 웹 앱 등록 완료
- [ ] Cloud Messaging API (V1) 활성화 완료

### 2.2 Firebase 설정 값 수집
- [ ] API Key 수집
- [ ] Auth Domain 수집
- [ ] Project ID 수집
- [ ] Messaging Sender ID 수집
- [ ] App ID 수집
- [ ] Server Key (FCM) 수집

---

## ✅ Phase 3: Supabase 환경 변수

### 3.1 Edge Function 환경 변수
- [ ] `FCM_SERVER_KEY` 설정 완료
- [ ] 값이 올바르게 저장되었는지 확인

**확인 방법:**
- Supabase Dashboard → Edge Functions → Environment Variables
- `FCM_SERVER_KEY`가 목록에 표시되는지 확인

---

## ✅ Phase 4: 소셜 로그인 설정

### 4.1 Kakao
- [ ] Kakao Developers에 애플리케이션 등록 완료
- [ ] REST API 키 수집
- [ ] Web 플랫폼 등록 완료
- [ ] 카카오 로그인 활성화 완료
- [ ] Redirect URI 등록 완료

### 4.2 Google
- [ ] Google Cloud Console에 프로젝트 생성 완료
- [ ] OAuth 동의 화면 설정 완료
- [ ] OAuth 클라이언트 ID 생성 완료
- [ ] 클라이언트 ID 수집
- [ ] 클라이언트 보안 비밀 수집
- [ ] Redirect URI 등록 완료

### 4.3 Naver (선택사항)
- [ ] Naver Developers에 애플리케이션 등록 완료
- [ ] 클라이언트 ID 수집
- [ ] 클라이언트 시크릿 수집
- [ ] Callback URL 등록 완료

---

## ✅ Phase 5: 설정 값 제공

### 5.1 템플릿 작성
- [ ] `SETUP_VALUES_TEMPLATE.md` 파일 열기
- [ ] 모든 필수 값 입력 완료
- [ ] 선택사항 값 입력 (원하는 경우)

### 5.2 제공
- [ ] 설정 값 템플릿을 채워서 제공
- [ ] 모든 필수 값이 입력되었는지 확인

---

## ✅ Phase 6: 자동 처리 대기

### 6.1 제공 후 확인
설정 값을 제공하신 후 다음이 자동으로 처리됩니다:

- [ ] Firebase 설정 파일 생성 확인
- [ ] 소셜 로그인 설정 파일 생성 확인
- [ ] 도메인 설정 업데이트 확인

---

## ✅ Phase 7: 최종 테스트

### 7.1 로컬 테스트
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 로그인 테스트 (이메일/비밀번호)
- [ ] 소셜 로그인 테스트 (Kakao, Google)
- [ ] 알림 설정 테스트 (마이페이지)
- [ ] 팀 공지 작성 및 알림 발송 테스트
- [ ] 커뮤니티 공지 작성 및 알림 발송 테스트

### 7.2 기능 테스트
- [ ] 팀 생성/가입
- [ ] 일정 추가/수정/삭제
- [ ] 캘린더 뷰 (일간/주간/월간/연간)
- [ ] 커뮤니티 기능 (공지사항, 식단표, 블라인드)
- [ ] 관리자 기능 (공지사항 작성, 식단표 등록)

---

## ✅ Phase 8: 배포 준비

### 8.1 Vercel 배포
- [ ] Vercel 계정 생성/로그인
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] 배포 실행
- [ ] 배포 성공 확인

### 8.2 도메인 연결 (선택사항)
- [ ] 커스텀 도메인 구매
- [ ] Vercel에 도메인 추가
- [ ] DNS 설정 완료
- [ ] 도메인 연결 확인

---

## ✅ Phase 9: 출시 후 확인

### 9.1 프로덕션 테스트
- [ ] 프로덕션 URL에서 앱 접속
- [ ] 로그인 테스트
- [ ] 주요 기능 테스트
- [ ] 모바일 브라우저에서 테스트
- [ ] PWA 설치 테스트

### 9.2 모니터링
- [ ] Supabase Dashboard에서 에러 로그 확인
- [ ] Vercel Dashboard에서 배포 상태 확인
- [ ] 사용자 피드백 수집

---

## 📝 체크리스트 요약

### 출시 전 필수 (완료해야 출시 가능)
1. ✅ Supabase 데이터베이스 테이블 생성
2. ✅ Firebase 프로젝트 생성 및 FCM 설정
3. ✅ Supabase Edge Function 환경 변수 설정
4. ✅ 소셜 로그인 설정 (Kakao, Google)
5. ✅ 설정 값 제공
6. ✅ 자동 처리 완료 확인
7. ✅ 로컬 테스트 완료
8. ✅ Vercel 배포 완료

### 출시 시 필수 (앱 스토어 등록 시)
9. ⬜ 앱 스토어 등록 정보 준비
10. ⬜ 개인정보 처리방침 및 이용약관 작성
11. ⬜ 스크린샷 준비
12. ⬜ 앱 아이콘 준비

### 선택사항
- ⬜ Naver 로그인 설정
- ⬜ 공공데이터 API 설정
- ⬜ 커스텀 도메인 연결

---

## 🎯 다음 단계

1. **`USER_ACTION_GUIDE.md`** 파일을 따라 모든 작업 완료
2. **`SETUP_VALUES_TEMPLATE.md`** 파일에 값 입력 후 제공
3. 자동 처리 완료 대기
4. 최종 테스트 수행
5. 배포 및 출시!

---

**마지막 업데이트**: 2024년 12월

