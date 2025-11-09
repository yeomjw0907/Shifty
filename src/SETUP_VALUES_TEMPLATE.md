# 📋 Shifty 설정 값 제공 템플릿

## 📝 사용 방법
이 템플릿을 복사하여 값을 입력한 후 제공해주세요.
빈 값은 비워두셔도 됩니다 (선택사항).

---

```markdown
# Shifty 설정 값

## Firebase
- API Key: 
- Auth Domain: 
- Project ID: 
- Messaging Sender ID: 
- App ID: 
- Server Key (FCM): 

## Supabase
- Project ID: rbjyragopwwuyfbnjoqk (이미 설정됨)
- Public Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (이미 설정됨)

## 소셜 로그인
### Kakao
- Client ID: 
- Redirect URI: 

### Google
- Client ID: 
- Client Secret: 
- Redirect URI: 

### Naver (선택사항)
- Client ID: 
- Client Secret: 
- Redirect URI: 

## 공공데이터 API (선택사항)
- API Key: 

## 배포
- 도메인: 
- Admin 도메인 (선택사항): 
```

---

## 📍 값 찾는 위치

### Firebase
- **위치**: Firebase Console → 프로젝트 설정 → 일반 탭
- **API Key, Auth Domain, Project ID, Messaging Sender ID, App ID**: "내 앱" 섹션 → "웹 앱" → "SDK 설정 및 구성"
- **Server Key (FCM)**: Firebase Console → 프로젝트 설정 → Cloud Messaging 탭 → "서버 키"

### Kakao
- **위치**: Kakao Developers → 내 애플리케이션
- **Client ID**: 앱 키 섹션 → "REST API 키"
- **Redirect URI**: 제품 설정 → 카카오 로그인 → Redirect URI 등록

### Google
- **위치**: Google Cloud Console → API 및 서비스 → 사용자 인증 정보
- **Client ID, Client Secret**: OAuth 클라이언트 ID 생성 시 팝업에 표시

### Naver (선택사항)
- **위치**: Naver Developers → 애플리케이션
- **Client ID, Client Secret**: 애플리케이션 상세 페이지

### 공공데이터 API (선택사항)
- **위치**: 공공데이터포털 → 마이페이지 → 인증키 관리
- **API Key**: "인증키 (Decoding)"

---

**마지막 업데이트**: 2024년 12월

