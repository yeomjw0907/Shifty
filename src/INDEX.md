# 📚 Shifty 출시 준비 문서 인덱스

## 🎯 시작하기

### 가장 먼저 읽어야 할 문서
1. **`FINAL_USER_GUIDE.md`** ⭐⭐⭐
   - 전체 작업 흐름 및 빠른 시작 가이드
   - 모든 문서의 개요

2. **`USER_ACTION_GUIDE.md`** ⭐⭐⭐
   - 사용자가 해야 할 모든 작업을 단계별로 설명
   - 가장 상세한 가이드

3. **`SETUP_VALUES_TEMPLATE.md`** ⭐⭐⭐
   - 설정 값을 입력할 템플릿
   - 값을 제공할 때 사용

---

## 📖 문서 분류

### 🚀 필수 읽기 문서 (출시 전 반드시 읽어야 함)

#### 1. `FINAL_USER_GUIDE.md` ⭐⭐⭐
**전체 작업 흐름 및 빠른 시작 가이드**

**포함 내용:**
- 작업 흐름도
- 필수 작업 체크리스트
- 설정 값 제공 템플릿
- 자동 처리 작업 설명

**언제 읽나요?**
- 처음 시작할 때
- 전체 흐름을 파악하고 싶을 때

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

### 📖 참고 문서 (필요할 때 참고)

#### 5. `SETUP_VALUES_GUIDE.md`
**설정 값 제공 시 자동 처리 작업 설명**

**포함 내용:**
- Firebase 설정 값 제공 시 자동 처리 작업
- 소셜 로그인 설정 값 제공 시 자동 처리 작업
- 도메인 정보 제공 시 자동 처리 작업

**언제 읽나요?**
- 설정 값을 제공한 후
- 어떤 작업이 자동으로 수행되는지 확인하고 싶을 때

---

#### 6. `APP_LAUNCH_CHECKLIST.md`
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

#### 7. `COMPLETE_USER_GUIDE.md`
**모든 문서의 개요 및 사용 방법**

**포함 내용:**
- 문서 구조 설명
- 각 문서의 사용 시점
- 작업 흐름도

**언제 읽나요?**
- 문서 구조를 파악하고 싶을 때
- 어떤 문서를 읽어야 할지 모를 때

---

#### 8. `README_SETUP.md`
**출시 준비 가이드 개요**

**포함 내용:**
- 빠른 시작 가이드
- 문서 구조
- 작업 순서

**언제 읽나요?**
- 처음 시작할 때
- 빠르게 개요를 파악하고 싶을 때

---

### 🔧 기술 문서 (개발자용)

#### 9. `SETUP_NOTIFICATION_TABLES.sql`
**알림 관련 데이터베이스 테이블 생성 SQL**

#### 10. `SETUP_ANALYTICS_TABLES.sql`
**통계 및 팝업 관리 데이터베이스 테이블 생성 SQL**

#### 11. `NOTIFICATION_PLAN.md`
**알람 기능 구현 계획**

#### 12. `ADMIN_ANALYTICS_PLAN.md`
**관리자 통계 기능 구현 계획**

---

## 🎯 작업 순서

### 1단계: 문서 읽기
1. `FINAL_USER_GUIDE.md` 읽기 (전체 흐름 파악)
2. `USER_ACTION_GUIDE.md` 읽기 (상세 작업 방법 확인)

### 2단계: 설정 작업 수행
3. `USER_ACTION_GUIDE.md`의 Phase 1부터 순서대로 진행
4. 각 Phase 완료 후 체크리스트에 체크

### 3단계: 설정 값 제공
5. `SETUP_VALUES_TEMPLATE.md`에 모든 값 입력
6. 설정 값 제공

### 4단계: 최종 확인
7. `LAUNCH_READY_CHECKLIST.md`로 최종 확인
8. 배포 및 출시!

---

## 📝 빠른 체크리스트

### 필수 작업
- [ ] `FINAL_USER_GUIDE.md` 읽기
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

## 🆘 문제 해결

### SQL 실행 오류
→ `FIX_RLS_GUIDE.md` 참고

### 로그인 오류
→ `FIX_LOGIN_ISSUE.md` 참고

### 사용자 찾을 수 없음
→ `FIX_USER_NOT_FOUND.md` 참고

---

## 📚 모든 문서 목록

### 필수 읽기
1. `FINAL_USER_GUIDE.md` ⭐⭐⭐
2. `USER_ACTION_GUIDE.md` ⭐⭐⭐
3. `SETUP_VALUES_TEMPLATE.md` ⭐⭐⭐
4. `LAUNCH_READY_CHECKLIST.md` ⭐⭐

### 참고 문서
5. `SETUP_VALUES_GUIDE.md`
6. `APP_LAUNCH_CHECKLIST.md`
7. `COMPLETE_USER_GUIDE.md`
8. `README_SETUP.md`

### 기술 문서
9. `SETUP_NOTIFICATION_TABLES.sql`
10. `SETUP_ANALYTICS_TABLES.sql`
11. `NOTIFICATION_PLAN.md`
12. `ADMIN_ANALYTICS_PLAN.md`

---

**마지막 업데이트**: 2024년 12월

