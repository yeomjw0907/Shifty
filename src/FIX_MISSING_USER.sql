-- ⚡ 긴급 수정: 누락된 사용자 프로필 생성
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- 1. 현재 에러 발생한 사용자 추가
INSERT INTO users (auth_id, email, name, hospital, department, position, phone, created_at, updated_at)
VALUES (
  'c1fb288d-4a04-436b-b9fc-e86d7bbc3714',
  'yeomjw0907@gmail.com',
  '염정우',  -- 이름을 원하는 대로 변경하세요
  NULL,      -- 병원명 (마이페이지에서 수정 가능)
  NULL,      -- 부서 (마이페이지에서 수정 가능)
  NULL,      -- 직책 (마이페이지에서 수정 가능)
  NULL,      -- 연락처 (마이페이지에서 수정 가능)
  NOW(),
  NOW()
)
ON CONFLICT (auth_id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- 2. 확인
SELECT * FROM users WHERE auth_id = 'c1fb288d-4a04-436b-b9fc-e86d7bbc3714';

-- 3. 이 사용자를 위한 기본 팀 생성 (선택사항)
-- 아래 코드는 users 레코드가 생성된 후에 실행하세요
/*
DO $$
DECLARE
  v_user_id UUID;
  v_team_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM users WHERE auth_id = 'c1fb288d-4a04-436b-b9fc-e86d7bbc3714';
  
  IF v_user_id IS NOT NULL THEN
    -- Create team
    INSERT INTO teams (name, invite_code, created_by, created_at, updated_at)
    VALUES ('나의 팀', UPPER(substring(md5(random()::text) from 1 for 6)), v_user_id, NOW(), NOW())
    RETURNING id INTO v_team_id;
    
    -- Add user as owner
    INSERT INTO team_members (team_id, user_id, role, color, joined_at)
    VALUES (v_team_id, v_user_id, 'owner', '#3B82F6', NOW());
    
    RAISE NOTICE 'Team created successfully for user %', v_user_id;
  ELSE
    RAISE EXCEPTION 'User not found';
  END IF;
END $$;
*/
