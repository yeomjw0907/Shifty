# 📚 Shifty 출시 준비 문서 - 사용자 가이드

## 🎯 시작하기

### 가장 먼저 읽어야 할 문서

1. **`START_HERE_USER.md`** ⭐⭐⭐
   - 빠른 시작 가이드
   - 전체 작업 흐름
   - 필수 문서 안내

2. **`USER_ACTION_GUIDE.md`** ⭐⭐⭐
   - 사용자가 해야 할 모든 작업을 단계별로 설명
   - 가장 상세한 가이드

3. **`SETUP_VALUES_TEMPLATE.md`** ⭐⭐⭐
   - 설정 값을 입력할 템플릿
   - 값을 제공할 때 사용

---

## 📚 문서 구조

### 🚀 필수 읽기 문서

#### 1. `START_HERE_USER.md` ⭐⭐⭐
**빠른 시작 가이드**

**포함 내용:**
- 빠른 시작 (3단계)
- 필수 문서 안내
- 작업 흐름도
- 필수 작업 체크리스트

**언제 읽나요?**
- 처음 시작할 때
- 전체 흐름을 빠르게 파악하고 싶을 때

---

#### 2. `USER_ACTION_GUIDE.md` ⭐⭐⭐
**사용자가 해야 할 모든 작업을 단계별로 설명**

**포함 내용:**
- Phase 1: Supabase 데이터베이스 테이블 생성
- Phase 2: Firebase Cloud Messaging 설정
- Phase 3: Supabase Edge Function 환경 변수 설정
- Phase 4: 소셜 로그인 설정 (Kakao, Google, Naver)
- Phase 5: 공공데이터 API 설정 (선택사항)
- Phase 6: 배포 도메인 결정
- Phase 7: 설정 값 제공

**언제 읽나요?**
- 실제로 설정 작업을 수행할 때
- 각 단계별 상세한 방법이 필요할 때

---

#### 3. `SETUP_VALUES_TEMPLATE.md` ⭐⭐⭐
**설정 값을 입력할 템플릿**

**포함 내용:**
- Firebase 설정 값 입력 필드
- 소셜 로그인 설정 값 입력 필드
- 공공데이터 API 설정 값 입력 필드 (선택사항)
- 배포 도메인 입력 필드
- 각 값의 위치 및 찾는 방법

**언제 읽나요?**
- 모든 설정 작업 완료 후
- 값을 제공할 때

---

#### 4. `LAUNCH_READY_CHECKLIST.md` ⭐⭐
**출시 전 완료해야 할 모든 작업 체크리스트**

**포함 내용:**
- Phase별 체크리스트
- 확인 방법
- 최종 테스트 항목

**언제 읽나요?**
- 출시 직전
- 모든 작업이 완료되었는지 확인할 때

---

### 📖 참고 문서

#### 5. `AUTO_PROCESSING_GUIDE.md`
**설정 값 제공 시 자동 처리 작업 설명**

**포함 내용:**
- Firebase 설정 값 제공 시 자동 처리 작업
- 소셜 로그인 설정 값 제공 시 자동 처리 작업
- 도메인 정보 제공 시 자동 처리 작업
- 생성될 파일 목록

**언제 읽나요?**
- 설정 값을 제공한 후
- 어떤 작업이 자동으로 수행되는지 확인하고 싶을 때

---

#### 6. `COMPLETE_LAUNCH_GUIDE.md`
**출시 준비 완전 가이드**

**포함 내용:**
- 모든 작업 요약
- 제공해야 할 값 목록
- 자동 처리 작업 요약

**언제 읽나요?**
- 전체 가이드를 한눈에 보고 싶을 때

---

#### 7. `APP_LAUNCH_CHECKLIST.md`
**앱 스토어 등록 정보 준비 가이드**

**포함 내용:**
- PWA 설정
- 앱 아이콘 및 로고
- 푸시 알림 설정
- 앱 스토어 등록 정보
- 개인정보 처리방침 및 이용약관

**언제 읽나요?**
- 앱 스토어에 등록할 때

---

#### 8. `INDEX.md`
**문서 인덱스**

**포함 내용:**
- 모든 문서 목록
- 문서 분류
- 각 문서의 사용 시점

**언제 읽나요?**
- 문서 구조를 파악하고 싶을 때
- 어떤 문서를 읽어야 할지 모를 때

---

## 🔄 작업 순서

```
1. START_HERE_USER.md 읽기
   ↓
2. USER_ACTION_GUIDE.md 읽기
   ↓
3. Phase 1: Supabase 테이블 생성
   ↓
4. Phase 2: Firebase 설정
   ↓
5. Phase 3: Supabase 환경 변수 설정
   ↓
6. Phase 4: 소셜 로그인 설정
   ↓
7. SETUP_VALUES_TEMPLATE.md에 값 입력
   ↓
8. 설정 값 제공
   ↓
9. 자동 처리 완료 대기
   ↓
10. LAUNCH_READY_CHECKLIST.md로 최종 확인
   ↓
11. 배포 및 출시!
```

---

## ✅ 빠른 체크리스트

### 필수 작업
- [ ] `START_HERE_USER.md` 읽기
- [ ] `USER_ACTION_GUIDE.md` 읽기
- [ ] Supabase 데이터베이스 테이블 생성
- [ ] Firebase 프로젝트 생성 및 FCM 설정
- [ ] Supabase Edge Function 환경 변수 설정
- [ ] 소셜 로그인 설정 (Kakao, Google)
- [ ] `SETUP_VALUES_TEMPLATE.md`에 값 입력
- [ ] 설정 값 제공
- [ ] `LAUNCH_READY_CHECKLIST.md`로 최종 확인

### 선택 작업
- [ ] Naver 로그인 설정
- [ ] 공공데이터 API 설정
- [ ] 커스텀 도메인 연결

---

## 📝 설정 값 제공 템플릿

**`src/SETUP_VALUES_TEMPLATE.md`** 파일을 열어서 값을 입력한 후 제공해주세요.

---

## 🔄 설정 값 제공 시 자동 처리 작업

### Firebase 설정 값 제공 시
- ✅ Firebase 설정 파일 생성
- ✅ Service Worker 생성
- ✅ FCM 토큰 관리 유틸리티 생성
- ✅ 마이페이지 통합

### 소셜 로그인 설정 값 제공 시
- ✅ 소셜 로그인 유틸리티 생성
- ✅ AuthScreen 컴포넌트 수정
- ✅ Supabase Auth 설정 가이드 제공

### 도메인 정보 제공 시
- ✅ PWA 설정 업데이트
- ✅ 소셜 로그인 Redirect URI 업데이트
- ✅ Vercel 배포 설정 가이드 제공

**상세 가이드**: `AUTO_PROCESSING_GUIDE.md` 참고

---

## 🆘 문제 해결

### SQL 실행 오류
→ `FIX_RLS_GUIDE.md` 참고

### Firebase 설정 값 찾기 어려움
→ `USER_ACTION_GUIDE.md`의 Phase 2.3 참고

### 소셜 로그인 설정 오류
→ `USER_ACTION_GUIDE.md`의 Phase 4 참고

---

## 📚 모든 문서 목록

### 필수 읽기
1. `START_HERE_USER.md` ⭐⭐⭐
2. `USER_ACTION_GUIDE.md` ⭐⭐⭐
3. `SETUP_VALUES_TEMPLATE.md` ⭐⭐⭐
4. `LAUNCH_READY_CHECKLIST.md` ⭐⭐

### 참고 문서
5. `AUTO_PROCESSING_GUIDE.md`
6. `COMPLETE_LAUNCH_GUIDE.md`
7. `APP_LAUNCH_CHECKLIST.md`
8. `INDEX.md`

---

**마지막 업데이트**: 2024년 12월

