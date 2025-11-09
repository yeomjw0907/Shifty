# 📱 Shifty 앱 출시 준비 체크리스트

## 📋 개요
Shifty 앱을 iOS App Store와 Google Play Store에 출시하기 위해 필요한 모든 준비사항을 정리했습니다.

---

## 🎯 Phase 1: 앱 기본 설정

### 1.1 PWA (Progressive Web App) 설정
- [ ] `manifest.json` 설정 완료
  - 앱 이름: "Shifty"
  - 짧은 이름: "Shifty"
  - 설명: "간병인 스케줄 관리 앱"
  - 시작 URL: "/"
  - 테마 색상: 브랜드 컬러
  - 배경 색상: 브랜드 컬러
  - 디스플레이 모드: "standalone"
- [ ] 아이콘 생성 (다양한 크기)
  - 192x192px
  - 512x512px
  - Apple Touch Icon (180x180px)
  - Favicon (32x32px, 16x16px)
- [ ] 스플래시 스크린 이미지
  - iOS: 2048x2732px (iPad Pro 12.9")
  - Android: 1920x1920px

### 1.2 앱 아이콘 및 로고
- [x] 로고 파일 확인 (기존 로고 사용)
- [ ] 앱 아이콘 생성 (iOS/Android 규격)
  - iOS: 1024x1024px (App Store), 다양한 크기 (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt)
  - Android: 512x512px (Play Store), 다양한 크기 (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- [ ] 스플래시 스크린 이미지
  - iOS: Launch Screen Storyboard 또는 이미지
  - Android: Splash Screen 이미지

---

## 🔔 Phase 2: 푸시 알림 설정

### 2.1 Firebase Cloud Messaging (FCM) 설정
- [ ] Firebase 프로젝트 생성
- [ ] iOS용 APNs 인증서 설정
- [ ] Android용 FCM 서버 키 설정
- [ ] `firebase-messaging-sw.js` 생성
- [ ] FCM 토큰 저장 로직 구현

### 2.2 알림 권한 요청
- [ ] iOS: `Notification.requestPermission()` 구현
- [ ] Android: `manifest.json`에 권한 추가
- [ ] 권한 거부 시 대체 알림 방법 (인앱 알림)

---

## 📱 Phase 3: 앱 스토어 등록 정보

### 3.1 iOS App Store
- [ ] Apple Developer 계정 등록 ($99/년)
- [ ] 앱 정보 작성
  - 앱 이름: "Shifty"
  - 부제목: "간병인 스케줄 관리"
  - 카테고리: "의료" 또는 "생산성"
  - 연령 등급: 4+
  - 설명 (한국어/영어)
  - 키워드
  - 지원 URL
  - 마케팅 URL (선택)
- [ ] 스크린샷 준비
  - iPhone 6.7" (1290x2796px)
  - iPhone 6.5" (1284x2778px)
  - iPhone 5.5" (1242x2208px)
  - iPad Pro 12.9" (2048x2732px)
- [ ] 앱 아이콘 (1024x1024px)
- [ ] 개인정보 처리방침 URL
- [ ] 이용약관 URL

### 3.2 Google Play Store
- [ ] Google Play Console 계정 등록 ($25 일회성)
- [ ] 앱 정보 작성
  - 앱 이름: "Shifty"
  - 짧은 설명 (80자)
  - 전체 설명 (4000자)
  - 카테고리: "의료" 또는 "생산성"
  - 연령 등급
  - 개인정보 처리방침 URL
  - 이용약관 URL
- [ ] 스크린샷 준비
  - 휴대전화: 최소 2개 (16:9 또는 9:16)
  - 7인치 태블릿: 최소 1개
  - 10인치 태블릿: 최소 1개
- [ ] 기능 그래픽 (선택)
- [ ] 앱 아이콘 (512x512px)
- [ ] 기능 그래픽 (1024x500px, 선택)

---

## 🔐 Phase 4: 보안 및 개인정보

### 4.1 개인정보 처리방침
- [ ] 개인정보 처리방침 문서 작성
  - 수집하는 개인정보 항목
  - 개인정보 수집 목적
  - 개인정보 보유 기간
  - 개인정보 제3자 제공
  - 개인정보 처리 위탁
  - 이용자 권리
  - 개인정보 보호책임자
- [ ] 개인정보 처리방침 URL 게시

### 4.2 이용약관
- [ ] 이용약관 문서 작성
  - 서비스 이용 조건
  - 이용자 의무
  - 서비스 제공자의 권리
  - 면책 조항
  - 분쟁 해결
- [ ] 이용약관 URL 게시

### 4.3 앱 권한 설정
- [ ] iOS `Info.plist` 권한 설명
  - 알림 권한
  - 카메라 권한 (프로필 사진)
  - 사진 라이브러리 권한
- [ ] Android `AndroidManifest.xml` 권한 설정
  - 알림 권한
  - 인터넷 권한
  - 카메라 권한
  - 저장소 권한

---

## 🧪 Phase 5: 테스트 및 품질 관리

### 5.1 테스트 계정
- [ ] 테스트 계정 생성
  - iOS TestFlight 테스트 계정
  - Google Play Internal/Alpha 테스트 계정
- [ ] 테스트 시나리오 작성
  - 회원가입/로그인
  - 팀 생성/가입
  - 스케줄 추가/수정/삭제
  - 커뮤니티 기능
  - 알림 기능

### 5.2 버그 수정
- [ ] 크리티컬 버그 수정
- [ ] UI/UX 개선
- [ ] 성능 최적화
- [ ] 메모리 누수 확인

### 5.3 앱 버전 관리
- [ ] 버전 번호 설정
  - iOS: `CFBundleShortVersionString` (예: 1.0.0)
  - Android: `versionName` (예: 1.0.0)
- [ ] 빌드 번호 설정
  - iOS: `CFBundleVersion` (예: 1)
  - Android: `versionCode` (예: 1)

---

## 🚀 Phase 6: 배포 준비

### 6.1 빌드 설정
- [ ] iOS 빌드 설정
  - Xcode 프로젝트 설정
  - Code Signing 설정
  - Provisioning Profile 설정
  - Archive 생성
- [ ] Android 빌드 설정
  - `build.gradle` 설정
  - Signing Key 생성
  - APK/AAB 빌드

### 6.2 스토어 제출
- [ ] iOS App Store Connect에 앱 업로드
- [ ] Google Play Console에 앱 업로드
- [ ] 심사 제출
- [ ] 심사 대기 및 피드백 대응

---

## 📊 Phase 7: 출시 후 모니터링

### 7.1 분석 도구 설정
- [ ] Firebase Analytics 설정
- [ ] Crashlytics 설정
- [ ] 사용자 행동 분석 도구 설정

### 7.2 고객 지원
- [ ] 고객 지원 채널 설정
  - 이메일: support@shifty.app
  - 인앱 문의 기능
- [ ] FAQ 작성
- [ ] 업데이트 계획 수립

---

## ✅ 체크리스트 요약

### 필수 항목 (출시 전 완료)
1. ✅ PWA 설정
2. ✅ 앱 아이콘 및 로고
3. ✅ 푸시 알림 설정
4. ✅ 개인정보 처리방침
5. ✅ 이용약관
6. ✅ 앱 스토어 등록 정보
7. ✅ 스크린샷 준비
8. ✅ 테스트 완료
9. ✅ 버그 수정
10. ✅ 빌드 및 제출

### 선택 항목 (출시 후 추가 가능)
- 기능 그래픽
- 마케팅 URL
- 추가 분석 도구

---

**마지막 업데이트**: 2024년 12월

