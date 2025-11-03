-- ============================================
-- 🧪 Shifty 테스트 계정 생성 SQL
-- ============================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요!
-- ============================================

-- 1️⃣ 테스트 사용자 생성 (이메일 자동 확인)
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Auth 사용자 생성
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'test@shifty.com',
    crypt('test1234', gen_salt('bf')),  -- 비밀번호: test1234
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"김테스트"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  -- 사용자가 생성되었거나 이미 존재하는 경우
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@shifty.com';
  END IF;

  -- 2️⃣ users 테이블에 프로필 추가
  INSERT INTO users (
    auth_id,
    email,
    name,
    hospital,
    department,
    position,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'test@shifty.com',
    '김테스트',
    '테스트병원',
    '내과병동',
    '수간호사',
    '010-1234-5678',
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    name = EXCLUDED.name,
    hospital = EXCLUDED.hospital,
    department = EXCLUDED.department,
    position = EXCLUDED.position,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  -- 3️⃣ privacy_consents 테이블에 동의 기록
  INSERT INTO privacy_consents (
    user_id,
    agreed_at
  )
  SELECT u.id, NOW()
  FROM users u
  WHERE u.auth_id = v_user_id
  ON CONFLICT (user_id) DO NOTHING;

  -- 완료 메시지
  RAISE NOTICE '✅ 테스트 계정 생성 완료!';
  RAISE NOTICE '📧 이메일: test@shifty.com';
  RAISE NOTICE '🔑 비밀번호: test1234';
  RAISE NOTICE '👤 이름: 김테스트';
END $$;

-- ============================================
-- 4️⃣ 생성 확인
-- ============================================

-- Auth 사용자 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  '✅ Auth 사용자' as status
FROM auth.users 
WHERE email = 'test@shifty.com';

-- Users 프로필 확인
SELECT 
  id,
  email,
  name,
  hospital,
  department,
  position,
  phone,
  '✅ 프로필' as status
FROM users 
WHERE email = 'test@shifty.com';

-- 동의 기록 확인
SELECT 
  c.id,
  c.agreed_at,
  u.name as user_name,
  '✅ 개인정보 동의' as status
FROM privacy_consents c
JOIN users u ON c.user_id = u.id
WHERE u.email = 'test@shifty.com';

-- ============================================
-- 🎉 완료!
-- ============================================
-- 이제 앱에서 로그인할 수 있습니다:
--   📧 이메일: test@shifty.com
--   🔑 비밀번호: test1234
-- ============================================
