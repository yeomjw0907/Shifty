# 🔍 데이터베이스 체크 가이드 (단계별)

Supabase SQL Editor는 여러 SELECT 문을 실행할 때 마지막 결과만 보여주므로, 각 체크 항목을 개별적으로 실행해야 합니다.

---

## 📋 체크 항목별 SQL 쿼리

### 1️⃣ 필수 테이블 존재 여부 체크

**파일:** `src/QUICK_DB_CHECK.sql` 사용

또는 다음 쿼리 실행:

```sql
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = t.table_name
    ) THEN '✅ 존재함'
    ELSE '❌ 없음'
  END as status
FROM (VALUES
  ('users'), ('teams'), ('team_members'), ('tasks'), ('privacy_consents'),
  ('hospitals'), ('hospital_communities'), ('community_posts'), ('community_comments'),
  ('community_reports'), ('meal_menus'), ('hospital_official_info'),
  ('hospital_admins'), ('hospital_settings'),
  ('notifications'), ('notification_settings'), ('fcm_tokens'),
  ('user_visits'), ('admin_popups'), ('popup_interactions'), ('user_sessions')
) AS t(table_name)
ORDER BY table_name;
```

**예상 결과:** 21개 테이블 모두 `✅ 존재함`으로 표시되어야 합니다.

---

### 2️⃣ 테이블별 데이터 개수 확인

```sql
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'hospital_communities', COUNT(*) FROM hospital_communities
UNION ALL
SELECT 'community_posts', COUNT(*) FROM community_posts
UNION ALL
SELECT 'community_comments', COUNT(*) FROM community_comments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'notification_settings', COUNT(*) FROM notification_settings
UNION ALL
SELECT 'user_visits', COUNT(*) FROM user_visits
UNION ALL
SELECT 'admin_popups', COUNT(*) FROM admin_popups
ORDER BY table_name;
```

**예상 결과:**
- `hospitals`: 10개 (샘플 데이터)
- 나머지: 0개 (정상, 앱 사용 시 데이터 생성됨)

---

### 3️⃣ hospitals 테이블 샘플 데이터 확인

```sql
SELECT 
  id,
  name,
  name_kr,
  city,
  district,
  type
FROM hospitals
ORDER BY created_at DESC
LIMIT 10;
```

**예상 결과:** 10개의 병원 데이터가 표시되어야 합니다.

---

### 4️⃣ 인덱스 확인

```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'teams', 'team_members', 'tasks', 'hospitals',
    'hospital_communities', 'community_posts', 'community_comments',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY tablename, indexname;
```

**예상 결과:** 각 테이블마다 여러 인덱스가 표시되어야 합니다.

---

### 5️⃣ RLS 정책 확인

```sql
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'teams', 'team_members', 'tasks', 'hospitals',
    'hospital_communities', 'community_posts', 'community_comments',
    'notifications', 'notification_settings', 'fcm_tokens',
    'user_visits', 'admin_popups', 'popup_interactions', 'user_sessions'
  )
ORDER BY tablename, policyname;
```

**예상 결과:** 각 테이블마다 RLS 정책이 표시되어야 합니다.

---

### 6️⃣ 외래 키 제약조건 확인

```sql
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

**예상 결과:** 외래 키 관계가 표시되어야 합니다.

---

### 7️⃣ 트리거 확인

```sql
SELECT 
  trigger_name,
  event_object_table as table_name,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**예상 결과:** `update_updated_at_column` 트리거가 여러 테이블에 설정되어 있어야 합니다.

---

### 8️⃣ 함수 확인

```sql
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'update_updated_at_column';
```

**예상 결과:** `update_updated_at_column` 함수가 표시되어야 합니다.

---

## ✅ 체크리스트

각 쿼리를 실행한 후 다음을 확인하세요:

- [ ] 21개 필수 테이블 모두 존재함
- [ ] hospitals 테이블에 10개 샘플 데이터 있음
- [ ] 각 테이블에 인덱스가 생성됨
- [ ] 각 테이블에 RLS 정책이 설정됨
- [ ] 외래 키 제약조건이 올바르게 설정됨
- [ ] 트리거가 제대로 설정됨
- [ ] `update_updated_at_column` 함수가 존재함

**모든 항목이 ✅이면 데이터베이스 설정 완료!** 🎉

