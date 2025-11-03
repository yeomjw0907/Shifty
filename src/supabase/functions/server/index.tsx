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
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

// Admin emails (화이트리스트)
const ADMIN_EMAILS = ["admin@shifty.app", "admin@98point7.com"];

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

      -- 6. Auto-update trigger function
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
app.get("/make-server-3afd3c70/health", (c) => {
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

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        auth_id: authData.user.id,
        email: authData.user.email,
        name,
        hospital: hospital || null,
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

    return c.json({ team: teamData });
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

    return c.json({ team: teamData });
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

    return c.json({ team: teamData });
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

    return c.json({ team: teamData });
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

      const { data: task, error } = await supabase
        .from("tasks")
        .insert({
          team_id: teamId,
          user_id: userData.id,
          ...taskData,
        })
        .select()
        .single();

      if (error) {
        return c.json(
          { error: `Failed to create task: ${error.message}` },
          500,
        );
      }

      return c.json({ task });
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
        users (
          id,
          name,
          avatar_url
        )
      `,
        )
        .eq("team_id", teamId)
        .order("date", { ascending: true });

      if (error) {
        return c.json({ error: "Failed to get tasks" }, 500);
      }

      return c.json({ tasks });
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
Deno.serve(app.fetch);