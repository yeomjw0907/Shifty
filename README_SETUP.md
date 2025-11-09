# 🚀 Shifty 출시 준비 가이드

## 📋 개요
이 문서는 Shifty 앱을 출시하기 위한 **완전한 사용자 가이드**입니다.

---

## 🎯 시작하기

### 1단계: 사용자 작업 가이드 읽기
**`src/USER_ACTION_GUIDE.md`** 파일을 열어주세요.

이 파일에는 다음이 포함되어 있습니다:
- Supabase 데이터베이스 테이블 생성 방법
- Firebase Cloud Messaging 설정 방법
- 소셜 로그인 설정 방법
- 모든 설정 값 수집 방법

---

### 2단계: 설정 값 제공
**`src/SETUP_VALUES_TEMPLATE.md`** 파일을 사용하여 설정 값을 제공해주세요.

제공하신 값은 자동으로 처리되어 바로 출시할 수 있는 상태가 됩니다.

---

## 📚 문서 구조

### 필수 읽기 문서
1. **`src/USER_ACTION_GUIDE.md`** ⭐ **가장 중요!**
   - 사용자가 해야 할 모든 작업을 단계별로 설명
   - 각 단계별 상세한 실행 방법 포함

2. **`src/SETUP_VALUES_TEMPLATE.md`**
   - 설정 값을 입력할 템플릿
   - 각 값의 위치 및 찾는 방법

3. **`src/LAUNCH_READY_CHECKLIST.md`**
   - 출시 전 완료해야 할 모든 작업 체크리스트
   - 최종 확인용

### 참고 문서
4. **`src/SETUP_VALUES_GUIDE.md`**
   - 설정 값 제공 시 자동 처리 작업 설명

5. **`src/APP_LAUNCH_CHECKLIST.md`**
   - 앱 스토어 등록 정보 준비 가이드

6. **`src/COMPLETE_USER_GUIDE.md`**
   - 모든 문서의 개요 및 사용 방법

---

## 🔄 작업 순서

```
1. src/USER_ACTION_GUIDE.md 읽기
   ↓
2. Phase 1: Supabase 테이블 생성
   ↓
3. Phase 2: Firebase 설정
   ↓
4. Phase 3: Supabase 환경 변수 설정
   ↓
5. Phase 4: 소셜 로그인 설정
   ↓
6. src/SETUP_VALUES_TEMPLATE.md에 값 입력
   ↓
7. 설정 값 제공
   ↓
8. 자동 처리 완료 대기
   ↓
9. src/LAUNCH_READY_CHECKLIST.md로 최종 확인
   ↓
10. 배포 및 출시!
```

---

## ✅ 빠른 체크리스트

### 필수 작업
- [ ] `src/USER_ACTION_GUIDE.md` 읽기
- [ ] Supabase 데이터베이스 테이블 생성
- [ ] Firebase 프로젝트 생성 및 FCM 설정
- [ ] Supabase Edge Function 환경 변수 설정
- [ ] 소셜 로그인 설정 (Kakao, Google)
- [ ] `src/SETUP_VALUES_TEMPLATE.md`에 값 입력
- [ ] 설정 값 제공

### 선택 작업
- [ ] Naver 로그인 설정
- [ ] 공공데이터 API 설정
- [ ] 커스텀 도메인 연결

---

## 🆘 도움이 필요하신가요?

### 문제 해결
- **SQL 실행 오류**: `src/FIX_RLS_GUIDE.md` 참고
- **로그인 오류**: `src/FIX_LOGIN_ISSUE.md` 참고
- **사용자 찾을 수 없음**: `src/FIX_USER_NOT_FOUND.md` 참고

### 빠른 시작
- **5분 빠른 시작**: `src/QUICK_START.md` 참고
- **5분 빠른 배포**: `src/QUICK_DEPLOY.md` 참고

---

## 📝 다음 단계

1. **`src/USER_ACTION_GUIDE.md`** 파일을 열어주세요
2. Phase 1부터 순서대로 진행하세요
3. 모든 작업 완료 후 설정 값을 제공해주세요
4. 자동 처리 완료 후 출시 준비 완료!

---

**마지막 업데이트**: 2024년 12월

