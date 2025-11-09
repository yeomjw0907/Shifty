# 📚 Shifty 완전 사용자 가이드

## 📋 개요
이 문서는 Shifty 앱 출시를 위해 **사용자가 해야 할 모든 작업**과 **제공해야 할 모든 값**을 단계별로 정리한 완전한 가이드입니다.

---

## 🎯 빠른 시작

### 1단계: 데이터베이스 테이블 생성
→ `USER_ACTION_GUIDE.md`의 **Phase 1** 참고

### 2단계: Firebase 설정
→ `USER_ACTION_GUIDE.md`의 **Phase 2** 참고

### 3단계: 소셜 로그인 설정
→ `USER_ACTION_GUIDE.md`의 **Phase 4** 참고

### 4단계: 설정 값 제공
→ `SETUP_VALUES_TEMPLATE.md` 파일 사용

---

## 📖 상세 가이드

### 1. 사용자 작업 가이드
**파일**: `USER_ACTION_GUIDE.md`

**내용**:
- Supabase 데이터베이스 테이블 생성 방법
- Firebase Cloud Messaging 설정 방법
- Supabase Edge Function 환경 변수 설정 방법
- 소셜 로그인 설정 방법 (Kakao, Google, Naver)
- 공공데이터 API 설정 방법 (선택사항)
- 배포 도메인 결정

**사용 시점**: 모든 설정 작업을 수행할 때

---

### 2. 설정 값 제공 템플릿
**파일**: `SETUP_VALUES_TEMPLATE.md`

**내용**:
- 설정 값을 입력할 템플릿
- 각 값의 위치 및 찾는 방법

**사용 시점**: 모든 설정 작업 완료 후, 값을 제공할 때

---

### 3. 설정 값 제공 시 자동 처리 가이드
**파일**: `SETUP_VALUES_GUIDE.md`

**내용**:
- 설정 값을 제공하면 자동으로 처리되는 작업들
- 생성될 파일 목록
- 수정될 파일 목록

**사용 시점**: 설정 값을 제공한 후, 어떤 작업이 자동으로 수행되는지 확인할 때

---

### 4. 출시 준비 체크리스트
**파일**: `LAUNCH_READY_CHECKLIST.md`

**내용**:
- 출시 전 완료해야 할 모든 작업 체크리스트
- 각 단계별 확인 방법
- 최종 테스트 항목

**사용 시점**: 출시 직전, 모든 작업이 완료되었는지 확인할 때

---

### 5. 앱 출시 체크리스트
**파일**: `APP_LAUNCH_CHECKLIST.md`

**내용**:
- PWA 설정
- 앱 아이콘 및 로고
- 푸시 알림 설정
- 앱 스토어 등록 정보
- 개인정보 처리방침 및 이용약관

**사용 시점**: 앱 스토어에 등록할 때

---

## 🔄 작업 흐름도

```
1. USER_ACTION_GUIDE.md 읽기
   ↓
2. Phase 1: Supabase 테이블 생성
   ↓
3. Phase 2: Firebase 설정
   ↓
4. Phase 3: Supabase 환경 변수 설정
   ↓
5. Phase 4: 소셜 로그인 설정
   ↓
6. SETUP_VALUES_TEMPLATE.md에 값 입력
   ↓
7. 설정 값 제공
   ↓
8. 자동 처리 완료 대기
   ↓
9. LAUNCH_READY_CHECKLIST.md로 최종 확인
   ↓
10. 배포 및 출시!
```

---

## 📝 체크리스트 요약

### 필수 작업
- [ ] Supabase 데이터베이스 테이블 생성
- [ ] Firebase 프로젝트 생성 및 FCM 설정
- [ ] Supabase Edge Function 환경 변수 설정
- [ ] 소셜 로그인 설정 (Kakao, Google)
- [ ] 설정 값 제공

### 선택 작업
- [ ] Naver 로그인 설정
- [ ] 공공데이터 API 설정
- [ ] 커스텀 도메인 연결

---

## 🆘 문제 해결

### Supabase 테이블 생성 오류
- **문제**: SQL 실행 시 오류 발생
- **해결**: `FIX_RLS_GUIDE.md` 참고

### Firebase 설정 값 찾기 어려움
- **문제**: Firebase Console에서 값 찾기 어려움
- **해결**: `USER_ACTION_GUIDE.md`의 Phase 2.3 참고

### 소셜 로그인 설정 오류
- **문제**: Redirect URI 오류
- **해결**: `USER_ACTION_GUIDE.md`의 Phase 4 참고, URI 형식 확인

---

## 📚 관련 문서 목록

1. **`USER_ACTION_GUIDE.md`** - 사용자 작업 가이드 (가장 중요!)
2. **`SETUP_VALUES_TEMPLATE.md`** - 설정 값 제공 템플릿
3. **`SETUP_VALUES_GUIDE.md`** - 자동 처리 작업 가이드
4. **`LAUNCH_READY_CHECKLIST.md`** - 출시 준비 체크리스트
5. **`APP_LAUNCH_CHECKLIST.md`** - 앱 출시 체크리스트
6. **`COMPLETE_SETUP_GUIDE.md`** - 완전 설정 가이드
7. **`FINAL_SETUP_SUMMARY.md`** - 최종 요약

---

## 🎯 시작하기

1. **`USER_ACTION_GUIDE.md`** 파일을 열어주세요
2. Phase 1부터 순서대로 진행하세요
3. 각 Phase 완료 후 체크리스트에 체크하세요
4. 모든 작업 완료 후 **`SETUP_VALUES_TEMPLATE.md`**에 값 입력
5. 설정 값 제공 후 자동 처리 완료 대기

---

**마지막 업데이트**: 2024년 12월

