import { supabase } from '../supabase/client';
import type {
  Team,
  TeamMember,
  CreateTeamPayload,
  UpdateTeamPayload,
  ApiResponse,
  TeamWithMembers,
} from './types';

/**
 * Generate a unique 6-character invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new team
 * Automatically adds the creator as owner in team_members
 */
export async function createTeam(
  name: string,
  hospital?: string
): Promise<ApiResponse<TeamWithMembers>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('teams')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return { data: null, error: 'Failed to generate unique invite code' };
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, name, email, color, avatar_url, hospital, department, position')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return { data: null, error: 'User profile not found' };
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        invite_code: inviteCode,
        hospital: hospital || userProfile.hospital || null,
        created_by: userProfile.id,
      })
      .select()
      .single();

    if (teamError || !team) {
      console.error('Create team error:', teamError);
      return { data: null, error: teamError?.message || 'Failed to create team' };
    }

    // Add creator as owner
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userProfile.id,
        role: 'owner',
        color: userProfile.color || '#3B82F6',
      })
      .select()
      .single();

    if (memberError || !member) {
      // Rollback: delete team if member creation fails
      await supabase.from('teams').delete().eq('id', team.id);
      console.error('Create team member error:', memberError);
      return { data: null, error: memberError?.message || 'Failed to add creator to team' };
    }

    // Fetch team with members
    const teamWithMembers = await getTeamWithMembers(team.id);
    return teamWithMembers;
  } catch (error) {
    console.error('Create team exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all teams the current user is a member of
 */
export async function getMyTeams(): Promise<ApiResponse<Team[]>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return { data: null, error: 'User profile not found' };
    }

    // Get teams through team_members
    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userProfile.id);

    if (membershipError) {
      console.error('Get memberships error:', membershipError);
      return { data: null, error: membershipError.message };
    }

    if (!memberships || memberships.length === 0) {
      return { data: [], error: null };
    }

    const teamIds = memberships.map((m) => m.team_id);

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('created_at', { ascending: false });

    if (teamsError) {
      console.error('Get teams error:', teamsError);
      return { data: null, error: teamsError.message };
    }

    const formattedTeams: Team[] = (teams || []).map((team) => ({
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      hospital: team.hospital,
      department: team.department,
      description: team.description,
      createdBy: team.created_by,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
    }));

    return { data: formattedTeams, error: null };
  } catch (error) {
    console.error('Get my teams exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single team by ID with members
 */
export async function getTeam(teamId: string): Promise<ApiResponse<TeamWithMembers>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    return await getTeamWithMembers(teamId);
  } catch (error) {
    console.error('Get team exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Internal helper to get team with members
 */
async function getTeamWithMembers(teamId: string): Promise<ApiResponse<TeamWithMembers>> {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (teamError || !team) {
    console.error('Get team error:', teamError);
    return { data: null, error: teamError?.message || 'Team not found' };
  }

  // Get team members with user details
  const { data: memberships, error: membersError } = await supabase
    .from('team_members')
    .select(
      `
      id,
      role,
      color,
      joined_at,
      user_id,
      users:user_id (
        id,
        name,
        email,
        avatar_url,
        hospital,
        department,
        position
      )
    `
    )
    .eq('team_id', teamId);

  if (membersError) {
    console.error('Get team members error:', membersError);
    return { data: null, error: membersError.message };
  }

  const formattedTeam: TeamWithMembers = {
    id: team.id,
    name: team.name,
    inviteCode: team.invite_code,
    hospital: team.hospital,
    department: team.department,
    description: team.description,
    createdBy: team.created_by,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
    members: (memberships || []).map((m: any) => {
      const user = m.users;
      return {
        id: m.id,
        userId: m.user_id,
        teamId: team.id,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        role: m.role || 'member',
        color: m.color || '#3B82F6',
        avatar: user?.avatar_url || null,
        hospital: user?.hospital || null,
        department: user?.department || null,
        position: user?.position || null,
        joinedAt: m.joined_at,
      };
    }),
  };

  return { data: formattedTeam, error: null };
}

/**
 * Join a team using invite code
 */
export async function joinTeam(inviteCode: string): Promise<ApiResponse<TeamWithMembers>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Find team by invite code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (teamError || !team) {
      return { data: null, error: 'Invalid invite code' };
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, name, email, color, avatar_url, hospital, department, position')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return { data: null, error: 'User profile not found' };
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', userProfile.id)
      .single();

    if (existingMember) {
      return { data: null, error: 'Already a member of this team' };
    }

    // Add user as member
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userProfile.id,
        role: 'member',
        color: userProfile.color || '#3B82F6',
      })
      .select()
      .single();

    if (memberError || !member) {
      console.error('Join team error:', memberError);
      return { data: null, error: memberError?.message || 'Failed to join team' };
    }

    // Return team with members
    return await getTeamWithMembers(team.id);
  } catch (error) {
    console.error('Join team exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update team information
 */
export async function updateTeam(
  teamId: string,
  payload: UpdateTeamPayload
): Promise<ApiResponse<Team>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return { data: null, error: 'User profile not found' };
    }

    // Check if user is owner or admin (RLS will enforce this)
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userProfile.id)
      .single();

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return { data: null, error: 'Insufficient permissions' };
    }

    // Update team
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.hospital !== undefined) updateData.hospital = payload.hospital;
    if (payload.department !== undefined) updateData.department = payload.department;
    if (payload.description !== undefined) updateData.description = payload.description;

    const { data: team, error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (updateError || !team) {
      console.error('Update team error:', updateError);
      return { data: null, error: updateError?.message || 'Failed to update team' };
    }

    const formattedTeam: Team = {
      id: team.id,
      name: team.name,
      inviteCode: team.invite_code,
      hospital: team.hospital,
      department: team.department,
      description: team.description,
      createdBy: team.created_by,
      createdAt: team.created_at,
      updatedAt: team.updated_at,
    };

    return { data: formattedTeam, error: null };
  } catch (error) {
    console.error('Update team exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a team (only owner can delete)
 */
export async function deleteTeam(teamId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: 'Authentication required' };
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return { data: null, error: 'User profile not found' };
    }

    // Check if user is owner (RLS will enforce this)
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userProfile.id)
      .single();

    if (!membership || membership.role !== 'owner') {
      return { data: null, error: 'Only team owner can delete the team' };
    }

    // Delete team (CASCADE will handle related records)
    const { error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);

    if (deleteError) {
      console.error('Delete team error:', deleteError);
      return { data: null, error: deleteError.message };
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Delete team exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

