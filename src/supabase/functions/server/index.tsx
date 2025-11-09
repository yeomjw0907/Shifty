import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("*", logger(console.log));

// Create Supabase client
// SUPABASE_URL은 Supabase가 자동으로 제공합니다
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
// SUPABASE_SERVICE_ROLE_KEY는 SUPABASE_ 접두사 때문에 다른 이름으로 설정해야 합니다
const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase 환경 변수가 설정되지 않았습니다!");
  console.error("SUPABASE_URL:", supabaseUrl ? "✅ 설정됨" : "❌ 없음");
  console.error("SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ 설정됨" : "❌ 없음");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin emails (화이트리스트)
const ADMIN_EMAILS = ["yeomjw0907@onecation.co.kr"];

// Helper: Generate random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(
      Math.floor(Math.random() * chars.length),
    );
  }
  return code;
}

// Convert team data from database format (snake_case) to API format (camelCase)
function formatTeamResponse(teamData: any): any {
  if (!teamData) return null;
  
  return {
    ...teamData,
    inviteCode: teamData.invite_code || teamData.inviteCode,
    createdBy: teamData.created_by || teamData.createdBy,
    createdAt: teamData.created_at || teamData.createdAt,
    updatedAt: teamData.updated_at || teamData.updatedAt,
  };
}

// Helper: Generate random color
function generateMemberColor(): string {
  const colors = [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#EF4444",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Helper: Get or create user profile
async function getOrCreateUserProfile(
  authUser: any,
): Promise<{ data: any; error: any }> {
  // Try to get existing user
  let { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  // If user doesn't exist, create it automatically
  if (userError && userError.code === "PGRST116") {
    console.log(
      "🔧 Auto-creating user profile for auth_id:",
      authUser.id,
      "email:",
      authUser.email,
    );

    const userName =
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      "사용자";

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        auth_id: authUser.id,
        email: authUser.email,
        name: userName,
        hospital: authUser.user_metadata?.hospital || null,
        department: authUser.user_metadata?.department || null,
        position: authUser.user_metadata?.position || null,
        phone: authUser.user_metadata?.phone || null,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        "Failed to auto-create user profile:",
        createError,
      );
      return { data: null, error: createError };
    }

    console.log(
      "✅ User profile auto-created successfully:",
      newUser.id,
    );
    return { data: newUser, error: null };
  }

  if (userError) {
    console.error("User profile lookup error:", userError);
    return { data: null, error: userError };
  }

  return { data: userData, error: null };
}

// Initialize database tables
async function initializeTables() {
  try {
    console.log("🔧 Checking and creating database tables...");

    // Execute SQL to create all tables
    const createTablesSQL = `
      -- 1. users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auth_id UUID NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        hospital VARCHAR(200),
        department VARCHAR(100),
        position VARCHAR(50),
        phone VARCHAR(20),
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      -- 2. teams table
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        invite_code VARCHAR(10) NOT NULL UNIQUE,
        hospital VARCHAR(200),
        department VARCHAR(100),
        description TEXT,
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
      CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

      -- 3. team_members table
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        color VARCHAR(7),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
      CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

      -- 4. tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        shift_type VARCHAR(20),
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_all_day BOOLEAN DEFAULT false,
        completed BOOLEAN DEFAULT false,
        recurrence VARCHAR(20),
        recurrence_end_date DATE,
        color VARCHAR(7),
        location VARCHAR(200),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

      -- 5. privacy_consents table
      CREATE TABLE IF NOT EXISTS privacy_consents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        consent_version VARCHAR(20) NOT NULL,
        consented_at TIMESTAMPTZ DEFAULT NOW(),
        ip_address VARCHAR(50),
        user_agent TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);

      -- 6. hospitals table
      CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        name_kr VARCHAR(200),
        address VARCHAR(500),
        city VARCHAR(50),
        district VARCHAR(50),
        phone VARCHAR(20),
        type VARCHAR(50),
        beds INTEGER,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
      CREATE INDEX IF NOT EXISTS idx_hospitals_name_kr ON hospitals(name_kr);
      CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
      CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals(district);
      CREATE INDEX IF NOT EXISTS idx_hospitals_type ON hospitals(type);
      CREATE INDEX IF NOT EXISTS idx_hospitals_search ON hospitals USING gin(to_tsvector('simple', COALESCE(name_kr, name)));

      -- 7. Auto-update trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- 7. Triggers
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
      CREATE TRIGGER update_teams_updated_at
        BEFORE UPDATE ON teams
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals;
      CREATE TRIGGER update_hospitals_updated_at
        BEFORE UPDATE ON hospitals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL using Supabase client
    const { error } = await supabase
      .rpc("exec_sql", { sql: createTablesSQL })
      .catch(() => {
        // If exec_sql function doesn't exist, we need to use REST API
        // This is a fallback - tables should be created manually via Supabase dashboard
        return { error: null };
      });

    if (error) {
      console.log("⚠️ Could not auto-create tables:", error);
      console.log(
        "📝 Please create tables manually using DATABASE_SCHEMA.md",
      );
    } else {
      console.log(
        "✅ Database tables initialized successfully",
      );
    }
  } catch (err) {
    console.log("⚠️ Table initialization skipped:", err);
    console.log(
      "📝 Please create tables manually via Supabase Dashboard → SQL Editor",
    );
    console.log("📄 Use the SQL in DATABASE_SCHEMA.md");
  }
}

// Initialize storage buckets
async function initializeStorageBuckets() {
  try {
    console.log("🔧 Checking and creating storage buckets...");

    const bucketName = "shifty-avatars";

    // Check if bucket exists
    const { data: buckets } =
      await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === bucketName,
    );

    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(
        bucketName,
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
          ],
        },
      );

      if (error) {
        console.error("Failed to create bucket:", error);
      } else {
        console.log("✅ Storage bucket created successfully");
      }
    } else {
      console.log("✅ Storage bucket already exists");
    }
  } catch (err) {
    console.log(
      "⚠️ Storage bucket initialization skipped:",
      err,
    );
  }
}

// Initialize tables and storage on startup
initializeTables();
initializeStorageBuckets();

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "Shifty API",
    version: "2.0.0",
    database: "PostgreSQL (정규화된 테이블)",
    timestamp: new Date().toISOString(),
  });
});

// ======================
// AUTH ROUTES
// ======================

// Sign up - create new user
app.post("/make-server-3afd3c70/auth/signup", async (c) => {
  try {
    const {
      email,
      password,
      name,
      hospital,
      hospital_id,
      hospital_auth_code,
      department,
      position,
      phone,
    } = await c.req.json();

    if (!email || !password || !name) {
      return c.json(
        { error: "Email, password, and name are required" },
        400,
      );
    }

    // Check if email already exists
    const { data: existingUsers } =
      await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email === email,
    );

    if (emailExists) {
      return c.json(
        { error: "이미 사용 중인 이메일입니다" },
        400,
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true, // Auto-confirm since we don't have email server configured
      });

    if (authError) {
      console.log("Signup error:", authError);
      if (authError.message.includes("already registered")) {
        return c.json(
          { error: "이미 사용 중인 이메일입니다" },
          400,
        );
      }
      return c.json(
        {
          error: `Failed to create user: ${authError.message}`,
        },
        400,
      );
    }

    // Verify hospital authentication if provided
    let verifiedHospitalId = null;
    if (hospital_id) {
      // Check if hospital exists
      const { data: hospitalData, error: hospitalError } = await supabase
        .from("hospitals")
        .select("id, email_domain, auth_code")
        .eq("id", hospital_id)
        .single();

      if (hospitalError || !hospitalData) {
        return c.json(
          { error: "병원 정보를 찾을 수 없습니다" },
          400,
        );
      }

      // Verify authentication method
      const emailDomain = email.split("@")[1];
      const isEmailDomainMatch = hospitalData.email_domain && 
        emailDomain === hospitalData.email_domain;
      const isAuthCodeMatch = hospital_auth_code && 
        hospitalData.auth_code && 
        hospital_auth_code === hospitalData.auth_code;

      if (!isEmailDomainMatch && !isAuthCodeMatch) {
        // If hospital requires authentication but not provided, return error
        if (hospitalData.email_domain || hospitalData.auth_code) {
          return c.json(
            { error: "병원 인증이 필요합니다. 이메일 도메인 또는 인증 코드를 확인해주세요" },
            400,
          );
        }
      }

      verifiedHospitalId = hospitalData.id;
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authData.user.id,
        email: authData.user.email,
        name,
        hospital: hospital || null,
        hospital_id: verifiedHospitalId,
        department: department || null,
        position: position || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (userError) {
      console.error("User profile creation error:", userError);

      // Check if tables don't exist
      if (
        userError.code === "PGRST205" ||
        userError.message?.includes("could not find") ||
        userError.message?.includes("does not exist")
      ) {
        return c.json(
          {
            error:
              "⚠️ 데이터베이스 테이블이 생성되지 않았습니다.\n\nSupabase Dashboard → SQL Editor에서 SETUP_TABLES.sql 파일을 실행해주세요.\n\n자세한 내용: FIX_ERRORS.md 참고",
          },
          500,
        );
      }

      return c.json(
        {
          error: `회원가입 중 오류가 발생했습니다: ${userError.message}`,
        },
        500,
      );
    }

    if (!userData) {
      console.error(
        "❌ CRITICAL: User profile was not created! auth_id:",
        authData.user.id,
      );
      return c.json(
        {
          error:
            "사용자 프로필 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
        },
        500,
      );
    }

    console.log(
      "✅ User profile created successfully:",
      userData.id,
      userData.email,
    );

    // Create or get hospital community
    let communityId = null;
    if (verifiedHospitalId) {
      // Check if community exists
      const { data: existingCommunity } = await supabase
        .from("hospital_communities")
        .select("id")
        .eq("hospital_id", verifiedHospitalId)
        .single();

      if (existingCommunity) {
        communityId = existingCommunity.id;
      } else {
        // Create new community
        const { data: newCommunity, error: communityError } = await supabase
          .from("hospital_communities")
          .insert({
            hospital_id: verifiedHospitalId,
            name: hospital || "병원 커뮤니티",
            description: `${hospital} 커뮤니티`,
          })
          .select()
          .single();

        if (!communityError && newCommunity) {
          communityId = newCommunity.id;
        }
      }
    }

    // Create default team for the user
    const inviteCode = generateInviteCode();
    const teamName = `${name}의 팀`;

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        invite_code: inviteCode,
        hospital: hospital || null,
        department: department || null,
        created_by: userData.id,
      })
      .select()
      .single();

    if (teamError) {
      console.error("Team creation error:", teamError);
      // Continue even if team creation fails
    }

    // Add user to team_members
    if (teamData) {
      await supabase.from("team_members").insert({
        team_id: teamData.id,
        user_id: userData.id,
        role: "owner",
        color: generateMemberColor(),
      });
    }

    // Record privacy consent
    await supabase.from("privacy_consents").insert({
      user_id: userData.id,
      consent_version: "v1.0",
      ip_address:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown",
      user_agent: c.req.header("user-agent") || "unknown",
    });

    return c.json({
      user: {
        id: userData.id,
        auth_id: authData.user.id,
        email: userData.email,
        name: userData.name,
        hospital: userData.hospital,
      },
      team: teamData
        ? {
            id: teamData.id,
            name: teamData.name,
            inviteCode: teamData.invite_code,
          }
        : null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json(
      { error: `Server error during signup: ${error}` },
      500,
    );
  }
});

// Get current user profile
app.get("/make-server-3afd3c70/auth/me", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get or create user profile
    const { data: userData, error: userError } =
      await getOrCreateUserProfile(user);

    if (userError || !userData) {
      return c.json(
        {
          error:
            "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
        },
        500,
      );
    }

    // Get user's teams
    const { data: teamMemberships } = await supabase
      .from("team_members")
      .select(
        `
        team_id,
        role,
        teams (
          id,
          name,
          invite_code,
          hospital,
          department
        )
      `,
      )
      .eq("user_id", userData.id);

    return c.json({
      user: userData,
      teams: teamMemberships?.map((tm) => tm.teams) || [],
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// TEAM ROUTES
// ======================

// Create team
app.post("/make-server-3afd3c70/teams", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get or create user profile
    const { data: userData, error: userError } =
      await getOrCreateUserProfile(user);

    if (userError || !userData) {
      console.error(
        "Failed to get/create user profile:",
        userError,
      );
      return c.json(
        {
          error:
            "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
          details: "User profile not found in database",
        },
        500,
      );
    }

    const { name, hospital, department, description } =
      await c.req.json();
    const inviteCode = generateInviteCode();

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: name || `${userData.name}의 팀`,
        invite_code: inviteCode,
        hospital: hospital || userData.hospital,
        department: department || userData.department,
        description: description || null,
        created_by: userData.id,
      })
      .select()
      .single();

    if (teamError) {
      console.error("❌ Failed to create team:", teamError);
      return c.json(
        {
          error: `Failed to create team: ${teamError.message}`,
        },
        500,
      );
    }

    console.log("✅ Team created:", teamData.id);

    // Add creator as owner
    const { data: memberData, error: memberError } =
      await supabase
        .from("team_members")
        .insert({
          team_id: teamData.id,
          user_id: userData.id,
          role: "owner",
          color: generateMemberColor(),
        })
        .select()
        .single();

    if (memberError) {
      console.error(
        "❌ Failed to add creator as owner:",
        memberError,
      );
      return c.json(
        {
          error: `Failed to add creator as member: ${memberError.message}`,
        },
        500,
      );
    }

    console.log("✅ Creator added as owner:", memberData);

    // Format team response (convert invite_code to inviteCode)
    const formattedTeam = formatTeamResponse(teamData);
    console.log("📋 Formatted team response:", formattedTeam);

    return c.json({ team: formattedTeam });
  } catch (error) {
    console.error("Create team error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get team by ID
app.get("/make-server-3afd3c70/teams/:teamId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const teamId = c.req.param("teamId");

    // Get team with members
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select(
        `
        *,
        team_members (
          id,
          role,
          color,
          joined_at,
          users (
            id,
            name,
            email,
            position,
            avatar_url
          )
        )
      `,
      )
      .eq("id", teamId)
      .single();

    if (teamError) {
      return c.json({ error: "Team not found" }, 404);
    }

    // Format team response (convert invite_code to inviteCode)
    const formattedTeam = formatTeamResponse(teamData);
    return c.json({ team: formattedTeam });
  } catch (error) {
    console.error("Get team error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Join team with invite code
app.post("/make-server-3afd3c70/teams/join", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get or create user profile
    const { data: userData, error: userError } =
      await getOrCreateUserProfile(user);

    if (userError || !userData) {
      console.error(
        "Failed to get/create user profile (join team):",
        userError,
      );
      return c.json(
        {
          error:
            "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
          details: "User profile not found in database",
        },
        500,
      );
    }

    const { inviteCode } = await c.req.json();

    if (!inviteCode) {
      return c.json({ error: "Invite code is required" }, 400);
    }

    // Find team by invite code
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (teamError || !teamData) {
      return c.json(
        { error: "유효하지 않은 초대 코드입니다" },
        404,
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamData.id)
      .eq("user_id", userData.id)
      .single();

    if (existingMember) {
      return c.json(
        { error: "이미 팀에 가입되어 있습니다" },
        400,
      );
    }

    // Add user to team
    await supabase.from("team_members").insert({
      team_id: teamData.id,
      user_id: userData.id,
      role: "member",
      color: generateMemberColor(),
    });

    // Format team response (convert invite_code to inviteCode)
    const formattedTeam = formatTeamResponse(teamData);
    return c.json({ team: formattedTeam });
  } catch (error) {
    console.error("Join team error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Update team
app.patch("/make-server-3afd3c70/teams/:teamId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const teamId = c.req.param("teamId");
    const updates = await c.req.json();

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select()
      .single();

    if (teamError) {
      return c.json({ error: "Failed to update team" }, 500);
    }

    // Format team response (convert invite_code to inviteCode)
    const formattedTeam = formatTeamResponse(teamData);
    return c.json({ team: formattedTeam });
  } catch (error) {
    console.error("Update team error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// MEMBER ROUTES
// ======================

// Get team members
app.get(
  "/make-server-3afd3c70/teams/:teamId/members",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const teamId = c.req.param("teamId");

      console.log("📥 Fetching members for team:", teamId);

      const { data: members, error } = await supabase
        .from("team_members")
        .select(
          `
        id,
        role,
        color,
        joined_at,
        user_id,
        users!inner (
          id,
          auth_id,
          name,
          email,
          position,
          avatar_url
        )
      `,
        )
        .eq("team_id", teamId);

      if (error) {
        console.error("❌ Get members error:", error);
        return c.json({ error: "Failed to get members" }, 500);
      }

      console.log(
        "📋 Raw members data:",
        JSON.stringify(members, null, 2),
      );

      // Format members to flatten the structure
      // IMPORTANT: Use auth_id as the id, not user_id (internal db id)
      const formattedMembers =
        members?.map((m) => {
          const formatted = {
            id: m.users?.auth_id || m.user_id, // Use auth_id for matching with frontend user.id
            name: m.users?.name || "Unknown",
            email: m.users?.email || "",
            role: m.users?.position || m.role || "member",
            color: m.color || "#3B82F6",
            avatar: m.users?.avatar_url,
          };
          console.log("👤 Formatted member:", formatted);
          return formatted;
        }) || [];

      console.log(
        "✅ Returning formatted members:",
        formattedMembers.length,
      );

      return c.json({ members: formattedMembers });
    } catch (error) {
      console.error("Get members error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Add team member (manually, not via invite)
app.post(
  "/make-server-3afd3c70/teams/:teamId/members",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(accessToken);
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get or create user profile
      const { data: userData, error: userError } =
        await getOrCreateUserProfile(user);

      if (userError || !userData) {
        console.error(
          "Failed to get/create user profile (add member):",
          userError,
        );
        return c.json(
          {
            error:
              "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
            details: "User profile not found in database",
          },
          500,
        );
      }

      const teamId = c.req.param("teamId");
      const memberData = await c.req.json();

      console.log(
        "📝 Adding member to team:",
        teamId,
        "Data:",
        memberData,
      );

      // For manual member addition, we create a fake user entry
      // This is for display purposes only - they won't be able to log in
      const fakeName = memberData.name;
      const fakeEmail =
        memberData.email || `fake-${Date.now()}@shifty.local`;

      // Create a user entry (without auth)
      const { data: newUser, error: createUserError } =
        await supabase
          .from("users")
          .insert({
            auth_id: null, // No auth_id for manually added members
            email: fakeEmail,
            name: fakeName,
            hospital: null,
            department: null,
            position: memberData.role || "팀원",
            phone: null,
          })
          .select()
          .single();

      if (createUserError) {
        console.error(
          "❌ Failed to create user entry:",
          createUserError,
        );
        return c.json(
          {
            error: `팀원 추가 실패: ${createUserError.message}`,
          },
          500,
        );
      }

      console.log("✅ User entry created:", newUser.id);

      // Add to team_members
      const { data: teamMember, error: memberError } =
        await supabase
          .from("team_members")
          .insert({
            team_id: teamId,
            user_id: newUser.id,
            role: memberData.role || "member",
            color: memberData.color || generateMemberColor(),
          })
          .select()
          .single();

      if (memberError) {
        console.error(
          "❌ Failed to add to team_members:",
          memberError,
        );
        // Clean up the user entry
        await supabase
          .from("users")
          .delete()
          .eq("id", newUser.id);
        return c.json(
          {
            error: `팀원 추가 실패: ${memberError.message}`,
          },
          500,
        );
      }

      console.log("✅ Team member added successfully");

      // Return formatted member
      const formattedMember = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: teamMember.role,
        color: teamMember.color,
        avatar: newUser.avatar_url,
      };

      return c.json({ member: formattedMember });
    } catch (error) {
      console.error("💥 Add member exception:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Update team member
app.patch(
  "/make-server-3afd3c70/teams/:teamId/members/:memberId",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(accessToken);
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const teamId = c.req.param("teamId");
      const memberId = c.req.param("memberId");
      const updates = await c.req.json();

      // Get or create user profile
      const { data: userData, error: userError } =
        await getOrCreateUserProfile(user);

      if (userError || !userData) {
        console.error(
          "Failed to get/create user profile (update member):",
          userError,
        );
        return c.json(
          {
            error:
              "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
            details: "User profile not found in database",
          },
          500,
        );
      }

      // Update team_members table (for role and color)
      const memberUpdates: any = {};
      if (updates.role !== undefined)
        memberUpdates.role = updates.role;
      if (updates.color !== undefined)
        memberUpdates.color = updates.color;

      if (Object.keys(memberUpdates).length > 0) {
        const { error: memberError } = await supabase
          .from("team_members")
          .update(memberUpdates)
          .eq("user_id", memberId)
          .eq("team_id", teamId);

        if (memberError) {
          console.error(
            "Update team_members error:",
            memberError,
          );
          return c.json(
            { error: "Failed to update member" },
            500,
          );
        }
      }

      // Update users table (for name)
      if (updates.name !== undefined) {
        const { error: userError } = await supabase
          .from("users")
          .update({ name: updates.name })
          .eq("id", memberId);

        if (userError) {
          console.error("Update users error:", userError);
          return c.json(
            { error: "Failed to update user name" },
            500,
          );
        }
      }

      // Get updated member data
      const { data: member } = await supabase
        .from("team_members")
        .select(
          `
        user_id,
        role,
        color,
        users!inner (
          id,
          name,
          email,
          avatar_url
        )
      `,
        )
        .eq("user_id", memberId)
        .eq("team_id", teamId)
        .single();

      if (!member) {
        return c.json({ error: "Member not found" }, 404);
      }

      const formattedMember = {
        id: member.user_id,
        name: member.users.name,
        email: member.users.email,
        role: member.role,
        color: member.color,
        avatar: member.users.avatar_url,
      };

      return c.json({ member: formattedMember });
    } catch (error) {
      console.error("Update member error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Delete team member
app.delete(
  "/make-server-3afd3c70/teams/:teamId/members/:memberId",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const teamId = c.req.param("teamId");
      const memberId = c.req.param("memberId");

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("user_id", memberId)
        .eq("team_id", teamId);

      if (error) {
        return c.json(
          { error: "Failed to delete member" },
          500,
        );
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Delete member error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// ======================
// TASK ROUTES
// ======================

// Create task
app.post(
  "/make-server-3afd3c70/teams/:teamId/tasks",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(accessToken);
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Get or create user profile
      const { data: userData, error: userError } =
        await getOrCreateUserProfile(user);

      if (userError || !userData) {
        console.error(
          "Failed to get/create user profile (create task):",
          userError,
        );
        return c.json(
          {
            error:
              "사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.",
            details: "User profile not found in database",
          },
          500,
        );
      }

      const teamId = c.req.param("teamId");
      const taskData = await c.req.json();

      // Map client fields to database fields
      // Convert date from ISO string to DATE format
      let taskDate: string;
      if (taskData.date) {
        const dateObj = new Date(taskData.date);
        taskDate = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD
      } else {
        return c.json({ error: "Date is required" }, 400);
      }

      // Resolve user_id from assignedTo
      // assignedTo might be auth_id, so we need to find the actual users.id
      let targetUserId = userData.id; // Default to current user
      
      if (taskData.assignedTo) {
        // Check if assignedTo is already a users.id (UUID format)
        // If it's an auth_id, we need to look it up
        const { data: assignedUser, error: lookupError } = await supabase
          .from("users")
          .select("id")
          .or(`id.eq.${taskData.assignedTo},auth_id.eq.${taskData.assignedTo}`)
          .single();
        
        if (assignedUser && !lookupError) {
          targetUserId = assignedUser.id;
          console.log("✅ Resolved assignedTo to user_id:", targetUserId);
        } else {
          console.log("⚠️ Could not resolve assignedTo, using current user:", taskData.assignedTo);
          // Use current user if lookup fails
          targetUserId = userData.id;
        }
      }

      // Map fields: camelCase -> snake_case
      // Only include fields that exist in the database schema
      const dbTaskData: any = {
        team_id: teamId,
        user_id: targetUserId, // Use resolved user_id
        title: taskData.title || '',
        description: taskData.description || null,
        shift_type: taskData.shiftType || taskData.shift_type || null,
        date: taskDate,
        start_time: taskData.time || taskData.start_time || null,
        end_time: taskData.endTime || taskData.end_time || null,
        completed: taskData.completed || false,
        is_all_day: taskData.isAllDay || taskData.is_all_day || false,
        color: taskData.color || null,
        location: taskData.location || null,
        notes: taskData.notes || null,
        // Explicitly exclude fields that don't exist in DB:
        // - category (not in DB schema)
        // - assignedTo (mapped to user_id)
        // - endDate (not in DB schema, only date, start_time, end_time exist)
      };

      // Handle endDate if provided (convert to end_time or separate date field)
      if (taskData.endDate) {
        const endDateObj = new Date(taskData.endDate);
        // If endDate is different from date, we might need to handle it differently
        // For now, we'll just use it for end_time calculation if needed
        if (taskData.time) {
          // If there's a time, we might want to calculate end_time
          // For simplicity, we'll just store the date part
        }
      }

      console.log("📋 Creating task with data:", dbTaskData);

      const { data: task, error } = await supabase
        .from("tasks")
        .insert(dbTaskData)
        .select(`
          *,
          users!inner (
            id,
            auth_id
          )
        `)
        .single();

      if (error) {
        console.error("❌ Failed to create task:", error);
        return c.json(
          { error: `Failed to create task: ${error.message}` },
          500,
        );
      }

      // Get auth_id from users table for assignedTo
      // assignedTo should be auth_id (not user_id) to match frontend
      let assignedToAuthId = task.user_id; // Fallback to user_id
      if (task.users && task.users.auth_id) {
        assignedToAuthId = task.users.auth_id;
      } else {
        // If users relation not loaded, query separately
        const { data: userData } = await supabase
          .from("users")
          .select("auth_id")
          .eq("id", task.user_id)
          .single();
        if (userData?.auth_id) {
          assignedToAuthId = userData.auth_id;
        }
      }

      // Format task response (convert snake_case to camelCase)
      const formattedTask = {
        ...task,
        assignedTo: assignedToAuthId, // Use auth_id instead of user_id
        shiftType: task.shift_type,
        date: task.date ? new Date(task.date).toISOString() : null,
        time: task.start_time || null,
        endTime: task.end_time || null,
        endDate: task.end_date || null,
        isAllDay: task.is_all_day || false,
        createdBy: assignedToAuthId, // Use auth_id for consistency
      };

      console.log("✅ Task created successfully:", formattedTask.id);

      return c.json({ task: formattedTask });
    } catch (error) {
      console.error("Create task error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Get tasks for team
app.get(
  "/make-server-3afd3c70/teams/:teamId/tasks",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const teamId = c.req.param("teamId");

      const { data: tasks, error } = await supabase
        .from("tasks")
        .select(
          `
        *,
        users!inner (
          id,
          auth_id,
          name,
          avatar_url
        )
      `,
        )
        .eq("team_id", teamId)
        .order("date", { ascending: true });

      if (error) {
        console.error("❌ Failed to get tasks:", error);
        return c.json({ error: "Failed to get tasks" }, 500);
      }

      // Format tasks response (convert snake_case to camelCase)
      // Use auth_id for assignedTo to match frontend expectations
      const formattedTasks = (tasks || []).map((task: any) => ({
        ...task,
        assignedTo: task.users?.auth_id || task.user_id, // Use auth_id if available
        shiftType: task.shift_type,
        date: task.date ? new Date(task.date).toISOString() : null,
        time: task.start_time || null,
        endTime: task.end_time || null,
        endDate: task.end_date || null,
        isAllDay: task.is_all_day || false,
        createdBy: task.users?.auth_id || task.user_id, // Use auth_id for consistency
      }));

      return c.json({ tasks: formattedTasks });
    } catch (error) {
      console.error("Get tasks error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Update task
app.patch(
  "/make-server-3afd3c70/teams/:teamId/tasks/:taskId",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const taskId = c.req.param("taskId");
      const updates = await c.req.json();

      const { data: task, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        return c.json({ error: "Failed to update task" }, 500);
      }

      return c.json({ task });
    } catch (error) {
      console.error("Update task error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// Delete task
app.delete(
  "/make-server-3afd3c70/teams/:teamId/tasks/:taskId",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      if (!accessToken) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const taskId = c.req.param("taskId");

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) {
        return c.json({ error: "Failed to delete task" }, 500);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Delete task error:", error);
      return c.json({ error: `Server error: ${error}` }, 500);
    }
  },
);

// ======================
// HOSPITAL ROUTES
// ======================

// Search hospitals (공개 API - 인증 불필요)
app.get("/hospitals/search", async (c) => {
  try {
    const query = c.req.query("q") || "";
    const limit = parseInt(c.req.query("limit") || "10", 10);
    const city = c.req.query("city") || "";

    console.log("🔍 병원 검색 요청:", { query, limit, city });

    if (!query || query.trim().length === 0) {
      return c.json({ hospitals: [] });
    }

    // Build search query
    // Supabase .or() 메서드는 % 와일드카드를 사용합니다
    const sanitizedQuery = query.trim();
    let searchQuery = supabase
      .from("hospitals")
      .select("id, name, name_kr, city, district, type, address, phone")
      .or(`name.ilike.%${sanitizedQuery}%,name_kr.ilike.%${sanitizedQuery}%`)
      .limit(Math.min(limit, 50)); // 최대 50개로 제한

    // Filter by city if provided
    if (city) {
      searchQuery = searchQuery.eq("city", city);
    }

    const { data: hospitals, error } = await searchQuery;

    if (error) {
      console.error("❌ 병원 검색 오류:", error);
      return c.json({ error: `Failed to search hospitals: ${error.message}` }, 500);
    }

    console.log("✅ 병원 검색 결과:", hospitals?.length || 0, "개");

    return c.json({
      hospitals: hospitals || [],
    });
  } catch (error) {
    console.error("❌ 병원 검색 예외:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get hospital by ID
app.get("/make-server-3afd3c70/hospitals/:id", async (c) => {
  try {
    const hospitalId = c.req.param("id");

    const { data: hospital, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", hospitalId)
      .single();

    if (error) {
      console.error("Get hospital error:", error);
      return c.json({ error: "Hospital not found" }, 404);
    }

    return c.json({ hospital });
  } catch (error) {
    console.error("Get hospital error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// ADMIN ROUTES
// ======================

// Get admin stats
app.get("/make-server-3afd3c70/admin/stats", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("auth_id", user.id)
      .single();

    if (!userData || !ADMIN_EMAILS.includes(userData.email)) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get stats
    const { count: usersCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    const { count: teamsCount } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true });

    const { count: tasksCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true });

    // Get shift type distribution
    const { data: shiftData } = await supabase
      .from("tasks")
      .select("shift_type")
      .not("shift_type", "is", null);

    const shiftDistribution = shiftData?.reduce(
      (acc: any, task: any) => {
        acc[task.shift_type] = (acc[task.shift_type] || 0) + 1;
        return acc;
      },
      {},
    );

    // Get recent users
    const { data: recentUsers } = await supabase
      .from("users")
      .select("id, name, email, hospital, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    return c.json({
      stats: {
        totalUsers: usersCount || 0,
        totalTeams: teamsCount || 0,
        totalTasks: tasksCount || 0,
        shiftDistribution,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// HOSPITAL ADMIN ROUTES
// ======================

// Helper: Check if user is admin for a hospital
async function checkHospitalAdmin(
  accessToken: string,
  hospitalId: string,
): Promise<{ isAdmin: boolean; user: any; userData: any }> {
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  if (!user) {
    return { isAdmin: false, user: null, userData: null };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email, hospital_id")
    .eq("auth_id", user.id)
    .single();

  if (!userData) {
    return { isAdmin: false, user, userData: null };
  }

  // Check if user is in ADMIN_EMAILS (system admin)
  const isSystemAdmin = ADMIN_EMAILS.includes(userData.email);

  // Check if user is admin for this hospital
  const { data: adminData } = await supabase
    .from("hospital_admins")
    .select("id, role")
    .eq("hospital_id", hospitalId)
    .eq("user_id", userData.id)
    .single();

  const isHospitalAdmin = !!adminData || isSystemAdmin;

  return { isAdmin: isHospitalAdmin, user, userData };
}

// Get admin status for a hospital
app.get("/make-server-3afd3c70/admin/hospitals/:hospitalId/status", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hospitalId = c.req.param("hospitalId");
    if (!hospitalId) {
      return c.json({ error: "Hospital ID is required" }, 400);
    }

    const { isAdmin, userData } = await checkHospitalAdmin(
      accessToken,
      hospitalId,
    );

    return c.json({
      isAdmin,
      role: isAdmin ? "admin" : "user",
      userId: userData?.id,
    });
  } catch (error) {
    console.error("Check admin status error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get admin posts (notices or meal menus)
app.get("/make-server-3afd3c70/admin/hospitals/:hospitalId/posts", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hospitalId = c.req.param("hospitalId");
    const postType = c.req.query("type") as "notice" | "menu";

    if (!hospitalId) {
      return c.json({ error: "Hospital ID is required" }, 400);
    }

    if (!postType || !["notice", "menu"].includes(postType)) {
      return c.json({ error: "Post type must be 'notice' or 'menu'" }, 400);
    }

    const { isAdmin } = await checkHospitalAdmin(accessToken, hospitalId);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get community_id for this hospital
    const { data: community } = await supabase
      .from("hospital_communities")
      .select("id")
      .eq("hospital_id", hospitalId)
      .single();

    if (!community) {
      return c.json({ posts: [] });
    }

    if (postType === "notice") {
      // Get notices from hospital_official_info
      const { data: notices, error: noticesError } = await supabase
        .from("hospital_official_info")
        .select(
          "id, title, content, info_type, view_count, created_at, updated_at, created_by",
        )
        .eq("community_id", community.id)
        .eq("info_type", "notice")
        .order("created_at", { ascending: false });

      if (noticesError) {
        console.error("Get notices error:", noticesError);
        return c.json({ error: "Failed to get notices" }, 500);
      }

      // Format notices as posts
      const posts = (notices || []).map((notice: any) => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        postType: "notice",
        createdAt: notice.created_at,
        updatedAt: notice.updated_at,
        viewCount: notice.view_count || 0,
        likeCount: 0,
        commentCount: 0,
      }));

      return c.json({ posts });
    } else {
      // Get meal menus
      const { data: menus, error: menusError } = await supabase
        .from("meal_menus")
        .select(
          "id, menu_date, meal_type, menu_items, image_url, created_at, updated_at, created_by",
        )
        .eq("community_id", community.id)
        .order("menu_date", { ascending: false })
        .order("meal_type", { ascending: true });

      if (menusError) {
        console.error("Get meal menus error:", menusError);
        return c.json({ error: "Failed to get meal menus" }, 500);
      }

      // Format meal menus as posts
      const mealTypeLabels: Record<string, string> = {
        breakfast: "아침",
        lunch: "점심",
        dinner: "저녁",
      };

      const posts = (menus || []).map((menu: any) => ({
        id: menu.id,
        title: `${new Date(menu.menu_date).toLocaleDateString("ko-KR")} ${mealTypeLabels[menu.meal_type] || menu.meal_type}`,
        content: menu.menu_items,
        postType: "menu",
        createdAt: menu.created_at,
        updatedAt: menu.updated_at,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        menuDate: menu.menu_date,
        mealType: menu.meal_type,
        imageUrl: menu.image_url,
      }));

      return c.json({ posts });
    }
  } catch (error) {
    console.error("Get admin posts error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Create admin post (notice or meal menu)
app.post("/make-server-3afd3c70/admin/hospitals/:hospitalId/posts", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hospitalId = c.req.param("hospitalId");
    if (!hospitalId) {
      return c.json({ error: "Hospital ID is required" }, 400);
    }

    const { isAdmin, userData } = await checkHospitalAdmin(
      accessToken,
      hospitalId,
    );
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const body = await c.req.json();
    const { title, content, postType, menuDate, mealType } = body;

    if (!title || !content || !postType) {
      return c.json(
        { error: "Title, content, and postType are required" },
        400,
      );
    }

    // Get community_id for this hospital
    const { data: community } = await supabase
      .from("hospital_communities")
      .select("id")
      .eq("hospital_id", hospitalId)
      .single();

    if (!community) {
      return c.json(
        { error: "Community not found for this hospital" },
        404,
      );
    }

    if (postType === "notice") {
      // Create notice in hospital_official_info
      const { data: notice, error: noticeError } = await supabase
        .from("hospital_official_info")
        .insert({
          community_id: community.id,
          title,
          content,
          info_type: "notice",
          view_count: 0,
          created_by: userData.id,
        })
        .select()
        .single();

      if (noticeError) {
        console.error("Create notice error:", noticeError);
        return c.json({ error: "Failed to create notice" }, 500);
      }

      // Send notifications to hospital community members
      try {
        // Get all users in this hospital
        const { data: hospitalUsers } = await supabase
          .from("users")
          .select("id")
          .eq("hospital_id", hospitalId);

        if (hospitalUsers && hospitalUsers.length > 0) {
          // Get notification settings for each user
          const notifications: any[] = [];
          for (const user of hospitalUsers) {
            // Check if user has community notice enabled
            const { data: settings } = await supabase
              .from("notification_settings")
              .select("community_notice_enabled")
              .eq("user_id", user.id)
              .single();

            // Default to true if no settings exist
            const shouldNotify = settings?.community_notice_enabled !== false;

            if (shouldNotify) {
              notifications.push({
                user_id: user.id,
                notification_type: "community_notice",
                title: "새 공지사항",
                content: title,
                related_id: notice.id,
                related_type: "post",
              });
            }
          }

          // Create notifications
          if (notifications.length > 0) {
            await supabase.from("notifications").insert(notifications);
            // TODO: Send push notifications via FCM (Step 4)
          }
        }
      } catch (notifError) {
        console.error("Send notification error:", notifError);
        // Don't fail the request if notification fails
      }

      return c.json({
        post: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          postType: "notice",
          createdAt: notice.created_at,
          updatedAt: notice.updated_at,
          viewCount: notice.view_count || 0,
          likeCount: 0,
          commentCount: 0,
        },
      });
    } else if (postType === "menu") {
      // Create meal menu
      if (!menuDate || !mealType) {
        return c.json(
          { error: "menuDate and mealType are required for menu posts" },
          400,
        );
      }

      const { data: menu, error: menuError } = await supabase
        .from("meal_menus")
        .insert({
          community_id: community.id,
          menu_date: menuDate,
          meal_type: mealType,
          menu_items: content,
          created_by: userData.id,
        })
        .select()
        .single();

      if (menuError) {
        console.error("Create meal menu error:", menuError);
        return c.json({ error: "Failed to create meal menu" }, 500);
      }

      const mealTypeLabels: Record<string, string> = {
        breakfast: "아침",
        lunch: "점심",
        dinner: "저녁",
      };

      return c.json({
        post: {
          id: menu.id,
          title: `${new Date(menu.menu_date).toLocaleDateString("ko-KR")} ${mealTypeLabels[menu.meal_type] || menu.meal_type}`,
          content: menu.menu_items,
          postType: "menu",
          createdAt: menu.created_at,
          updatedAt: menu.updated_at,
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          menuDate: menu.menu_date,
          mealType: menu.meal_type,
        },
      });
    } else {
      return c.json({ error: "Invalid postType" }, 400);
    }
  } catch (error) {
    console.error("Create admin post error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Update admin post
app.patch("/make-server-3afd3c70/admin/hospitals/:hospitalId/posts/:postId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hospitalId = c.req.param("hospitalId");
    const postId = c.req.param("postId");
    if (!hospitalId || !postId) {
      return c.json({ error: "Hospital ID and Post ID are required" }, 400);
    }

    const { isAdmin } = await checkHospitalAdmin(accessToken, hospitalId);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const body = await c.req.json();
    const { title, content } = body;

    // Get community_id for this hospital
    const { data: community } = await supabase
      .from("hospital_communities")
      .select("id")
      .eq("hospital_id", hospitalId)
      .single();

    if (!community) {
      return c.json(
        { error: "Community not found for this hospital" },
        404,
      );
    }

    // Try to update in hospital_official_info first
    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = content;

    const { data: notice, error: noticeError } = await supabase
      .from("hospital_official_info")
      .update(updates)
      .eq("id", postId)
      .eq("community_id", community.id)
      .select()
      .single();

    if (!noticeError && notice) {
      return c.json({
        post: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          postType: "notice",
          createdAt: notice.created_at,
          updatedAt: notice.updated_at,
          viewCount: notice.view_count || 0,
          likeCount: 0,
          commentCount: 0,
        },
      });
    }

    // If not found in hospital_official_info, try meal_menus
    const { data: menu, error: menuError } = await supabase
      .from("meal_menus")
      .update(updates)
      .eq("id", postId)
      .eq("community_id", community.id)
      .select()
      .single();

    if (menuError) {
      console.error("Update post error:", menuError);
      return c.json({ error: "Post not found" }, 404);
    }

    const mealTypeLabels: Record<string, string> = {
      breakfast: "아침",
      lunch: "점심",
      dinner: "저녁",
    };

    return c.json({
      post: {
        id: menu.id,
        title: `${new Date(menu.menu_date).toLocaleDateString("ko-KR")} ${mealTypeLabels[menu.meal_type] || menu.meal_type}`,
        content: menu.menu_items,
        postType: "menu",
        createdAt: menu.created_at,
        updatedAt: menu.updated_at,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        menuDate: menu.menu_date,
        mealType: menu.meal_type,
      },
    });
  } catch (error) {
    console.error("Update admin post error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Delete admin post
app.delete("/make-server-3afd3c70/admin/hospitals/:hospitalId/posts/:postId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const hospitalId = c.req.param("hospitalId");
    const postId = c.req.param("postId");
    if (!hospitalId || !postId) {
      return c.json({ error: "Hospital ID and Post ID are required" }, 400);
    }

    const { isAdmin } = await checkHospitalAdmin(accessToken, hospitalId);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get community_id for this hospital
    const { data: community } = await supabase
      .from("hospital_communities")
      .select("id")
      .eq("hospital_id", hospitalId)
      .single();

    if (!community) {
      return c.json(
        { error: "Community not found for this hospital" },
        404,
      );
    }

    // Try to delete from hospital_official_info first
    const { error: noticeError } = await supabase
      .from("hospital_official_info")
      .delete()
      .eq("id", postId)
      .eq("community_id", community.id);

    if (!noticeError) {
      return c.json({ success: true });
    }

    // If not found in hospital_official_info, try meal_menus
    const { error: menuError } = await supabase
      .from("meal_menus")
      .delete()
      .eq("id", postId)
      .eq("community_id", community.id);

    if (menuError) {
      console.error("Delete post error:", menuError);
      return c.json({ error: "Post not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete admin post error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// USER MANAGEMENT ROUTES (Admin Only)
// ======================

// Helper: Check if user is system admin
async function checkSystemAdmin(accessToken: string): Promise<{ isAdmin: boolean; user: any; userData: any }> {
  const {
    data: { user },
  } = await supabase.auth.getUser(accessToken);
  if (!user) {
    return { isAdmin: false, user: null, userData: null };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("id, email")
    .eq("auth_id", user.id)
    .single();

  if (!userData) {
    return { isAdmin: false, user, userData: null };
  }

  const isSystemAdmin = ADMIN_EMAILS.includes(userData.email);

  return { isAdmin: isSystemAdmin, user, userData };
}

// Get all users (admin only)
app.get("/make-server-3afd3c70/admin/users", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = (page - 1) * limit;
    const search = c.req.query("search") || "";

    let query = supabase
      .from("users")
      .select("id, auth_id, email, name, hospital, department, position, phone, avatar_url, hospital_id, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,hospital.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Get users error:", error);
      return c.json({ error: "Failed to get users" }, 500);
    }

    return c.json({
      users: (users || []).map((u: any) => ({
        ...u,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })),
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get user details with all related data
app.get("/make-server-3afd3c70/admin/users/:userId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const userId = c.req.param("userId");
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Get user basic info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get teams user belongs to
    const { data: teamMemberships } = await supabase
      .from("team_members")
      .select("team_id, role, color, joined_at, teams!inner(id, name, invite_code, hospital, department, created_at)")
      .eq("user_id", userId);

    // Get teams user created
    const { data: createdTeams } = await supabase
      .from("teams")
      .select("id, name, invite_code, hospital, department, created_at")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    // Get tasks user created
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, shift_type, date, team_id, teams!inner(id, name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    // Get community posts user created
    const { data: posts } = await supabase
      .from("community_posts")
      .select("id, title, post_type, is_anonymous, view_count, like_count, created_at, hospital_communities!inner(id, name, hospitals!inner(id, name, name_kr)))")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    // Get comments user created
    const { data: comments } = await supabase
      .from("community_comments")
      .select("id, content, is_anonymous, created_at, community_posts!inner(id, title, post_type))")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    return c.json({
      user: {
        ...user,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      teams: teamMemberships || [],
      createdTeams: createdTeams || [],
      tasks: tasks || [],
      posts: posts || [],
      comments: comments || [],
    });
  } catch (error) {
    console.error("Get user details error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Update user
app.patch("/make-server-3afd3c70/admin/users/:userId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const userId = c.req.param("userId");
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    const body = await c.req.json();
    const { name, email, hospital, department, position, phone, hospital_id } = body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (hospital !== undefined) updates.hospital = hospital;
    if (department !== undefined) updates.department = department;
    if (position !== undefined) updates.position = position;
    if (phone !== undefined) updates.phone = phone;
    if (hospital_id !== undefined) updates.hospital_id = hospital_id;

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Update user error:", updateError);
      return c.json({ error: "Failed to update user" }, 500);
    }

    return c.json({
      user: {
        ...updatedUser,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Delete user
app.delete("/make-server-3afd3c70/admin/users/:userId", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin, userData } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const userId = c.req.param("userId");
    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Prevent self-deletion
    if (userData.id === userId) {
      return c.json({ error: "Cannot delete yourself" }, 400);
    }

    // Get user's auth_id to delete from auth
    const { data: user } = await supabase
      .from("users")
      .select("auth_id")
      .eq("id", userId)
      .single();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Delete from auth (this will cascade delete from users table due to ON DELETE CASCADE)
    const { error: authError } = await supabase.auth.admin.deleteUser(
      user.auth_id,
    );

    if (authError) {
      console.error("Delete user from auth error:", authError);
      return c.json({ error: "Failed to delete user" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// ANALYTICS ROUTES (Admin Only)
// ======================

// Get analytics overview
app.get("/make-server-3afd3c70/admin/analytics/overview", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get date range from query params
    const startDate = c.req.query("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = c.req.query("endDate") || new Date().toISOString().split('T')[0];

    // Total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // New users in date range
    const { count: newUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate)
      .lte("created_at", `${endDate}T23:59:59`);

    // Total teams
    const { count: totalTeams } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true });

    // Total posts
    const { count: totalPosts } = await supabase
      .from("community_posts")
      .select("*", { count: "exact", head: true });

    // Total comments
    const { count: totalComments } = await supabase
      .from("community_comments")
      .select("*", { count: "exact", head: true });

    // Daily visits (if user_visits table exists)
    const { data: dailyVisits } = await supabase
      .from("user_visits")
      .select("visit_date, user_id")
      .gte("visit_date", startDate)
      .lte("visit_date", endDate)
      .catch(() => ({ data: null }));

    // Calculate unique daily visitors
    const uniqueVisitorsByDate: Record<string, Set<string>> = {};
    if (dailyVisits) {
      dailyVisits.forEach((visit: any) => {
        const date = visit.visit_date;
        if (!uniqueVisitorsByDate[date]) {
          uniqueVisitorsByDate[date] = new Set();
        }
        if (visit.user_id) {
          uniqueVisitorsByDate[date].add(visit.user_id);
        }
      });
    }

    const dailyVisitorStats = Object.entries(uniqueVisitorsByDate).map(([date, visitors]) => ({
      date,
      count: visitors.size,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Active users (users who logged in in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers7d } = await supabase
      .from("user_visits")
      .select("user_id", { count: "exact", head: true })
      .gte("visit_time", sevenDaysAgo)
      .not("user_id", "is", null)
      .catch(() => ({ count: 0 }));

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers30d } = await supabase
      .from("user_visits")
      .select("user_id", { count: "exact", head: true })
      .gte("visit_time", thirtyDaysAgo)
      .not("user_id", "is", null)
      .catch(() => ({ count: 0 }));

    return c.json({
      overview: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalTeams: totalTeams || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        activeUsers7d: activeUsers7d || 0,
        activeUsers30d: activeUsers30d || 0,
        dailyVisitorStats,
      },
    });
  } catch (error) {
    console.error("Get analytics overview error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get hospital statistics
app.get("/make-server-3afd3c70/admin/analytics/hospitals", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get all hospitals with statistics
    const { data: hospitals } = await supabase
      .from("hospitals")
      .select("id, name, name_kr, city, district, type")
      .order("name_kr", { ascending: true });

    if (!hospitals) {
      return c.json({ hospitals: [] });
    }

    // Get statistics for each hospital
    const hospitalStats = await Promise.all(
      hospitals.map(async (hospital: any) => {
        // Users in this hospital
        const { count: userCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("hospital_id", hospital.id);

        // Teams in this hospital
        const { count: teamCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("hospital", hospital.name_kr || hospital.name);

        // Get community for this hospital
        const { data: community } = await supabase
          .from("hospital_communities")
          .select("id")
          .eq("hospital_id", hospital.id)
          .single();

        let postCount = 0;
        let commentCount = 0;
        if (community) {
          const { count: posts } = await supabase
            .from("community_posts")
            .select("*", { count: "exact", head: true })
            .eq("community_id", community.id);

          const { count: comments } = await supabase
            .from("community_comments")
            .select("*", { count: "exact", head: true })
            .in(
              "post_id",
              supabase
                .from("community_posts")
                .select("id")
                .eq("community_id", community.id),
            );

          postCount = posts || 0;
          commentCount = comments || 0;
        }

        // Active users (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: activeUsers } = await supabase
          .from("user_visits")
          .select("user_id", { count: "exact", head: true })
          .gte("visit_time", sevenDaysAgo)
          .in(
            "user_id",
            supabase
              .from("users")
              .select("id")
              .eq("hospital_id", hospital.id),
          )
          .catch(() => ({ count: 0 }));

        return {
          hospital: {
            id: hospital.id,
            name: hospital.name_kr || hospital.name,
            city: hospital.city,
            district: hospital.district,
            type: hospital.type,
          },
          stats: {
            userCount: userCount || 0,
            teamCount: teamCount || 0,
            postCount,
            commentCount,
            activeUsers: activeUsers || 0,
          },
        };
      }),
    );

    return c.json({ hospitals: hospitalStats });
  } catch (error) {
    console.error("Get hospital statistics error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get community statistics
app.get("/make-server-3afd3c70/admin/analytics/community", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    // Get date range
    const startDate = c.req.query("startDate") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = c.req.query("endDate") || new Date().toISOString().split('T')[0];

    // Posts by type
    const { data: postsByType } = await supabase
      .from("community_posts")
      .select("post_type")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    const postTypeDistribution = (postsByType || []).reduce((acc: any, post: any) => {
      acc[post.post_type] = (acc[post.post_type] || 0) + 1;
      return acc;
    }, {});

    // Daily posts and comments
    const { data: dailyPosts } = await supabase
      .from("community_posts")
      .select("created_at")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    const { data: dailyComments } = await supabase
      .from("community_comments")
      .select("created_at")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    // Group by date
    const postsByDate: Record<string, number> = {};
    (dailyPosts || []).forEach((post: any) => {
      const date = post.created_at.split('T')[0];
      postsByDate[date] = (postsByDate[date] || 0) + 1;
    });

    const commentsByDate: Record<string, number> = {};
    (dailyComments || []).forEach((comment: any) => {
      const date = comment.created_at.split('T')[0];
      commentsByDate[date] = (commentsByDate[date] || 0) + 1;
    });

    const dailyStats = Object.keys({ ...postsByDate, ...commentsByDate })
      .sort()
      .map((date) => ({
        date,
        posts: postsByDate[date] || 0,
        comments: commentsByDate[date] || 0,
      }));

    // Top posts by view count
    const { data: topPosts } = await supabase
      .from("community_posts")
      .select("id, title, view_count, like_count, post_type, created_at")
      .order("view_count", { ascending: false })
      .limit(10);

    // Top posts by like count
    const { data: topLikedPosts } = await supabase
      .from("community_posts")
      .select("id, title, view_count, like_count, post_type, created_at")
      .order("like_count", { ascending: false })
      .limit(10);

    return c.json({
      postTypeDistribution,
      dailyStats,
      topPosts: topPosts || [],
      topLikedPosts: topLikedPosts || [],
    });
  } catch (error) {
    console.error("Get community statistics error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// POPUP MANAGEMENT ROUTES (Admin Only)
// ======================

// Get all popups
app.get("/make-server-3afd3c70/admin/popups", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const { data: popups, error } = await supabase
      .from("admin_popups")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get popups error:", error);
      return c.json({ error: "Failed to get popups" }, 500);
    }

    return c.json({
      popups: (popups || []).map((p: any) => ({
        ...p,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (error) {
    console.error("Get popups error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Create popup
app.post("/make-server-3afd3c70/admin/popups", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin, userData } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const body = await c.req.json();
    const {
      title,
      content,
      image_url,
      link_url,
      popup_type,
      target_audience,
      target_hospital_id,
      start_date,
      end_date,
      display_frequency,
      is_active,
      priority,
    } = body;

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const { data: popup, error: createError } = await supabase
      .from("admin_popups")
      .insert({
        title,
        content,
        image_url,
        link_url,
        popup_type: popup_type || "info",
        target_audience: target_audience || "all",
        target_hospital_id,
        start_date,
        end_date,
        display_frequency: display_frequency || "once",
        is_active: is_active !== undefined ? is_active : true,
        priority: priority || 0,
        created_by: userData.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create popup error:", createError);
      return c.json({ error: "Failed to create popup" }, 500);
    }

    return c.json({
      popup: {
        ...popup,
        createdAt: popup.created_at,
        updatedAt: popup.updated_at,
      },
    });
  } catch (error) {
    console.error("Create popup error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Update popup
app.patch("/make-server-3afd3c70/admin/popups/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const popupId = c.req.param("id");
    if (!popupId) {
      return c.json({ error: "Popup ID is required" }, 400);
    }

    const body = await c.req.json();
    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.image_url !== undefined) updates.image_url = body.image_url;
    if (body.link_url !== undefined) updates.link_url = body.link_url;
    if (body.popup_type !== undefined) updates.popup_type = body.popup_type;
    if (body.target_audience !== undefined) updates.target_audience = body.target_audience;
    if (body.target_hospital_id !== undefined) updates.target_hospital_id = body.target_hospital_id;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.display_frequency !== undefined) updates.display_frequency = body.display_frequency;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.priority !== undefined) updates.priority = body.priority;

    const { data: popup, error: updateError } = await supabase
      .from("admin_popups")
      .update(updates)
      .eq("id", popupId)
      .select()
      .single();

    if (updateError) {
      console.error("Update popup error:", updateError);
      return c.json({ error: "Failed to update popup" }, 500);
    }

    return c.json({
      popup: {
        ...popup,
        createdAt: popup.created_at,
        updatedAt: popup.updated_at,
      },
    });
  } catch (error) {
    console.error("Update popup error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Delete popup
app.delete("/make-server-3afd3c70/admin/popups/:id", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const popupId = c.req.param("id");
    if (!popupId) {
      return c.json({ error: "Popup ID is required" }, 400);
    }

    const { error: deleteError } = await supabase
      .from("admin_popups")
      .delete()
      .eq("id", popupId);

    if (deleteError) {
      console.error("Delete popup error:", deleteError);
      return c.json({ error: "Failed to delete popup" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete popup error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get popup statistics
app.get("/make-server-3afd3c70/admin/popups/:id/stats", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const popupId = c.req.param("id");
    if (!popupId) {
      return c.json({ error: "Popup ID is required" }, 400);
    }

    // Get interaction counts
    const { count: viewCount } = await supabase
      .from("popup_interactions")
      .select("*", { count: "exact", head: true })
      .eq("popup_id", popupId)
      .eq("interaction_type", "view")
      .catch(() => ({ count: 0 }));

    const { count: clickCount } = await supabase
      .from("popup_interactions")
      .select("*", { count: "exact", head: true })
      .eq("popup_id", popupId)
      .eq("interaction_type", "click")
      .catch(() => ({ count: 0 }));

    const { count: closeCount } = await supabase
      .from("popup_interactions")
      .select("*", { count: "exact", head: true })
      .eq("popup_id", popupId)
      .eq("interaction_type", "close")
      .catch(() => ({ count: 0 }));

    // Daily interactions
    const { data: interactions } = await supabase
      .from("popup_interactions")
      .select("interaction_type, created_at")
      .eq("popup_id", popupId)
      .order("created_at", { ascending: false })
      .limit(1000)
      .catch(() => ({ data: [] }));

    const dailyInteractions: Record<string, { views: number; clicks: number; closes: number }> = {};
    (interactions || []).forEach((interaction: any) => {
      const date = interaction.created_at.split('T')[0];
      if (!dailyInteractions[date]) {
        dailyInteractions[date] = { views: 0, clicks: 0, closes: 0 };
      }
      if (interaction.interaction_type === "view") dailyInteractions[date].views++;
      if (interaction.interaction_type === "click") dailyInteractions[date].clicks++;
      if (interaction.interaction_type === "close") dailyInteractions[date].closes++;
    });

    const dailyStats = Object.entries(dailyInteractions)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return c.json({
      stats: {
        viewCount: viewCount || 0,
        clickCount: clickCount || 0,
        closeCount: closeCount || 0,
        clickThroughRate: viewCount > 0 ? ((clickCount || 0) / viewCount) * 100 : 0,
        dailyStats,
      },
    });
  } catch (error) {
    console.error("Get popup statistics error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// TEAM BOARD POSTS ROUTES
// ======================

// Create team board post (notice or message)
app.post("/make-server-3afd3c70/teams/:teamId/posts", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const teamId = c.req.param("teamId");
    const body = await c.req.json();
    const { content, type } = body;

    if (!content || !type) {
      return c.json({ error: "Content and type are required" }, 400);
    }

    // Check if user is a member of this team
    const { data: membership } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userProfile.id)
      .single();

    if (!membership) {
      return c.json({ error: "You are not a member of this team" }, 403);
    }

    // Save post to localStorage (client-side) or create a board_posts table
    // For now, we'll just send notifications if it's a notice
    if (type === "notice") {
      // Get all team members
      const { data: teamMembers } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId);

      if (teamMembers && teamMembers.length > 0) {
        // Get notification settings for each member
        const notifications: any[] = [];
        for (const member of teamMembers) {
          // Skip the author
          if (member.user_id === userProfile.id) continue;

          // Check if user has team notice enabled
          const { data: settings } = await supabase
            .from("notification_settings")
            .select("team_notice_enabled")
            .eq("user_id", member.user_id)
            .single();

          // Default to true if no settings exist
          const shouldNotify = settings?.team_notice_enabled !== false;

          if (shouldNotify) {
            notifications.push({
              user_id: member.user_id,
              notification_type: "team_notice",
              title: "팀 공지",
              content: content.substring(0, 100), // First 100 chars
              related_id: teamId,
              related_type: "team",
            });
          }
        }

        // Create notifications
        if (notifications.length > 0) {
          await supabase.from("notifications").insert(notifications);
          // TODO: Send push notifications via FCM (Step 4)
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Create team post error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// NOTIFICATION ROUTES
// ======================

// Get notifications for current user
app.get("/make-server-3afd3c70/notifications", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = (page - 1) * limit;
    const unreadOnly = c.req.query("unreadOnly") === "true";

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userProfile.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error("Get notifications error:", error);
      return c.json({ error: "Failed to get notifications" }, 500);
    }

    return c.json({
      notifications: (notifications || []).map((n: any) => ({
        ...n,
        createdAt: n.created_at,
        readAt: n.read_at,
        isRead: n.is_read,
      })),
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Mark notification as read
app.patch("/make-server-3afd3c70/notifications/:id/read", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const notificationId = c.req.param("id");
    if (!notificationId) {
      return c.json({ error: "Notification ID is required" }, 400);
    }

    const { data: notification, error: updateError } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", userProfile.id)
      .select()
      .single();

    if (updateError || !notification) {
      console.error("Update notification error:", updateError);
      return c.json({ error: "Failed to update notification" }, 500);
    }

    return c.json({
      notification: {
        ...notification,
        createdAt: notification.created_at,
        readAt: notification.read_at,
        isRead: notification.is_read,
      },
    });
  } catch (error) {
    console.error("Update notification error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Get notification settings
app.get("/make-server-3afd3c70/notification-settings", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const { data: settings, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", userProfile.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get notification settings error:", error);
      return c.json({ error: "Failed to get notification settings" }, 500);
    }

    // If no settings exist, return defaults
    if (!settings) {
      return c.json({
        settings: {
          teamNoticeEnabled: true,
          communityNoticeEnabled: true,
          adminAnnouncementEnabled: true,
          pushEnabled: true,
          emailEnabled: false,
        },
      });
    }

    return c.json({
      settings: {
        teamNoticeEnabled: settings.team_notice_enabled,
        communityNoticeEnabled: settings.community_notice_enabled,
        adminAnnouncementEnabled: settings.admin_announcement_enabled,
        pushEnabled: settings.push_enabled,
        emailEnabled: settings.email_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      },
    });
  } catch (error) {
    console.error("Get notification settings error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Update notification settings
app.patch("/make-server-3afd3c70/notification-settings", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const body = await c.req.json();
    const updates: any = {};
    if (body.teamNoticeEnabled !== undefined) updates.team_notice_enabled = body.teamNoticeEnabled;
    if (body.communityNoticeEnabled !== undefined) updates.community_notice_enabled = body.communityNoticeEnabled;
    if (body.adminAnnouncementEnabled !== undefined) updates.admin_announcement_enabled = body.adminAnnouncementEnabled;
    if (body.pushEnabled !== undefined) updates.push_enabled = body.pushEnabled;
    if (body.emailEnabled !== undefined) updates.email_enabled = body.emailEnabled;

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("notification_settings")
      .select("id")
      .eq("user_id", userProfile.id)
      .single();

    let settings;
    if (existingSettings) {
      // Update existing settings
      const { data, error: updateError } = await supabase
        .from("notification_settings")
        .update(updates)
        .eq("user_id", userProfile.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update notification settings error:", updateError);
        return c.json({ error: "Failed to update notification settings" }, 500);
      }
      settings = data;
    } else {
      // Create new settings
      const { data, error: insertError } = await supabase
        .from("notification_settings")
        .insert({
          user_id: userProfile.id,
          ...updates,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Create notification settings error:", insertError);
        return c.json({ error: "Failed to create notification settings" }, 500);
      }
      settings = data;
    }

    return c.json({
      settings: {
        teamNoticeEnabled: settings.team_notice_enabled,
        communityNoticeEnabled: settings.community_notice_enabled,
        adminAnnouncementEnabled: settings.admin_announcement_enabled,
        pushEnabled: settings.push_enabled,
        emailEnabled: settings.email_enabled,
        createdAt: settings.created_at,
        updatedAt: settings.updated_at,
      },
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Register FCM token
app.post("/make-server-3afd3c70/fcm-tokens", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: userProfile } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    const body = await c.req.json();
    const { token, deviceType, deviceId } = body;

    if (!token) {
      return c.json({ error: "Token is required" }, 400);
    }

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from("fcm_tokens")
      .select("id")
      .eq("token", token)
      .single();

    if (existingToken) {
      // Update existing token
      const { data, error: updateError } = await supabase
        .from("fcm_tokens")
        .update({
          user_id: userProfile.id,
          device_type: deviceType,
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingToken.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update FCM token error:", updateError);
        return c.json({ error: "Failed to update FCM token" }, 500);
      }

      return c.json({
        token: {
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    } else {
      // Create new token
      const { data, error: insertError } = await supabase
        .from("fcm_tokens")
        .insert({
          user_id: userProfile.id,
          token,
          device_type: deviceType,
          device_id: deviceId,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Create FCM token error:", insertError);
        return c.json({ error: "Failed to create FCM token" }, 500);
      }

      return c.json({
        token: {
          ...data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    }
  } catch (error) {
    console.error("Register FCM token error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// ======================
// ADMIN NOTIFICATION ROUTES
// ======================

// Send admin notification
app.post("/make-server-3afd3c70/admin/notifications/send", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { isAdmin } = await checkSystemAdmin(accessToken);
    if (!isAdmin) {
      return c.json(
        { error: "Forbidden: Admin access only" },
        403,
      );
    }

    const body = await c.req.json();
    const { title, content, targetAudience, targetHospitalId } = body;

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    // Get target users
    let targetUsers: any[] = [];
    if (targetAudience === "all") {
      // All users
      const { data: users } = await supabase
        .from("users")
        .select("id");
      targetUsers = users || [];
    } else if (targetAudience === "hospital" && targetHospitalId) {
      // Users in specific hospital
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("hospital_id", targetHospitalId);
      targetUsers = users || [];
    } else {
      return c.json({ error: "Invalid target audience" }, 400);
    }

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      user_id: user.id,
      notification_type: "admin_announcement",
      title,
      content,
      related_type: "system",
    }));

    const { data: createdNotifications, error: insertError } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    if (insertError) {
      console.error("Create notifications error:", insertError);
      return c.json({ error: "Failed to create notifications" }, 500);
    }

    // TODO: Send push notifications via FCM
    // This will be implemented in Step 4

    return c.json({
      success: true,
      notificationsCreated: createdNotifications?.length || 0,
    });
  } catch (error) {
    console.error("Send admin notification error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Upload avatar image
app.post("/make-server-3afd3c70/upload-avatar", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json(
        { error: "Only image files are allowed" },
        400,
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } =
      await supabase.storage
        .from("shifty-avatars")
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return c.json({ error: "Failed to upload file" }, 500);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("shifty-avatars")
      .getPublicUrl(filePath);

    // Update user's avatar_url
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Update user avatar error:", updateError);
      return c.json(
        { error: "Failed to update user avatar" },
        500,
      );
    }

    return c.json({ avatarUrl: publicUrl });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return c.json({ error: `Server error: ${error}` }, 500);
  }
});

// Start server
// Supabase Edge Function은 함수 이름을 경로에서 자동으로 제거합니다
// /functions/v1/make-server-3afd3c70/hospitals/search -> /hospitals/search
Deno.serve(app.fetch);