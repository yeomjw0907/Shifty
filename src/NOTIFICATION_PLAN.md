# 🔔 알람 기능 구현 계획

## 📋 개요
Shifty 앱에 푸시 알림 기능을 추가하여 사용자에게 중요한 정보를 실시간으로 전달합니다.

---

## 🎯 알람이 울리는 경우

1. **팀 내에 공지가 올라왔을 경우**
   - 팀 관리자가 공지사항을 작성했을 때
   - 팀 멤버들에게 알림 발송

2. **커뮤니티 기능 내 공지사항 내에 글이 올라왔을 경우**
   - 병원 관리자가 공지사항을 작성했을 때
   - 해당 병원 커뮤니티 멤버들에게 알림 발송

3. **관리자가 알람을 보낼 경우**
   - 시스템 관리자가 전체 사용자 또는 특정 병원 사용자에게 알림 발송
   - 긴급 공지, 이벤트 안내 등

---

## 🗄️ 데이터베이스 설계

### 1. `notifications` 테이블 (알림 기록)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,  -- 'team_notice', 'community_notice', 'admin_announcement'
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  related_id UUID,  -- 관련 ID (팀 ID, 게시글 ID 등)
  related_type VARCHAR(50),  -- 'team', 'post', 'system'
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `notification_settings` 테이블 (알림 설정)
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  team_notice_enabled BOOLEAN DEFAULT true,
  community_notice_enabled BOOLEAN DEFAULT true,
  admin_announcement_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `fcm_tokens` 테이블 (FCM 토큰 저장)
```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  device_type VARCHAR(20),  -- 'ios', 'android', 'web'
  device_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 구현 단계

### Step 1: 데이터베이스 테이블 생성 ✅
- [x] `notifications` 테이블 생성
- [x] `notification_settings` 테이블 생성
- [x] `fcm_tokens` 테이블 생성
- [x] 인덱스 및 RLS 정책 설정

### Step 2: 서버 API 엔드포인트
- [ ] 알림 목록 조회: `GET /notifications`
- [ ] 알림 읽음 처리: `PATCH /notifications/:id/read`
- [ ] 알림 설정 조회: `GET /notification-settings`
- [ ] 알림 설정 업데이트: `PATCH /notification-settings`
- [ ] FCM 토큰 등록: `POST /fcm-tokens`
- [ ] 관리자 알림 발송: `POST /admin/notifications/send`

### Step 3: 마이페이지 알람 설정 UI
- [ ] 알람 설정 섹션 추가
- [ ] 토글 스위치로 각 알람 타입 on/off
- [ ] 푸시 알림 권한 요청 버튼
- [ ] 설정 저장 기능

### Step 4: 푸시 알림 서비스 연동
- [ ] Firebase Cloud Messaging (FCM) 설정
- [ ] FCM 토큰 등록 로직
- [ ] 푸시 알림 발송 로직
- [ ] 알림 클릭 시 앱 내 해당 페이지로 이동

### Step 5: 알림 트리거 구현
- [ ] 팀 공지 작성 시 알림 발송
- [ ] 커뮤니티 공지 작성 시 알림 발송
- [ ] 관리자 알림 발송 기능

### Step 6: 알림 UI 구현
- [ ] 인앱 알림 목록 (알림 센터)
- [ ] 알림 배지 (읽지 않은 알림 수)
- [ ] 알림 상세 페이지

---

## 📱 푸시 알림 설정

### Firebase Cloud Messaging (FCM)
1. Firebase 프로젝트 생성
2. iOS용 APNs 인증서 설정
3. Android용 FCM 서버 키 설정
4. `firebase-messaging-sw.js` 생성
5. FCM 토큰 저장 로직 구현

### 알림 권한 요청
- iOS: `Notification.requestPermission()`
- Android: `manifest.json`에 권한 추가
- 권한 거부 시 인앱 알림으로 대체

---

## 🎨 UI/UX 고려사항

### 마이페이지 알람 설정
- 간단하고 직관적인 토글 스위치
- 각 알람 타입별 설명 추가
- 푸시 알림 권한 상태 표시

### 알림 센터
- 헤더에 알림 아이콘 및 배지
- 알림 목록 (최신순)
- 읽지 않은 알림 강조
- 알림 클릭 시 해당 페이지로 이동

---

**마지막 업데이트**: 2024년 12월

