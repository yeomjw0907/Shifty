import { projectId, publicAnonKey } from './supabase/info';

// Types
export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  members?: any[];
  memberIds?: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string | Date;
  endDate?: string | Date;
  time?: string;
  category: 'work' | 'personal' | 'health' | 'other';
  shiftType?: 'day' | 'evening' | 'night' | 'off';
  assignedTo: string;
  completed: boolean;
  createdBy: string;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3afd3c70`;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper to get auth headers
function getAuthHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  return headers;
}

// =====================
// AUTH API
// =====================

export async function signUp(
  email: string, 
  password: string, 
  name: string,
  hospital?: string,
  department?: string,
  position?: string,
  phone?: string
): Promise<ApiResponse<{ user: any }>> {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        email, 
        password, 
        name,
        hospital,
        department,
        position,
        phone
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to sign up' };
    }

    return { data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: String(error) };
  }
}

// =====================
// TEAM API
// =====================

export async function createTeam(name: string, accessToken: string): Promise<ApiResponse<{ team: Team }>> {
  try {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create team' };
    }

    return { data };
  } catch (error) {
    console.error('Create team error:', error);
    return { error: String(error) };
  }
}

export async function getTeam(teamId: string, accessToken: string): Promise<ApiResponse<{ team: Team }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get team' };
    }

    return { data };
  } catch (error) {
    console.error('Get team error:', error);
    return { error: String(error) };
  }
}

export async function joinTeam(inviteCode: string, accessToken: string): Promise<ApiResponse<{ team: Team }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/join`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({ inviteCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to join team' };
    }

    return { data };
  } catch (error) {
    console.error('Join team error:', error);
    return { error: String(error) };
  }
}

export async function updateTeam(teamId: string, name: string, accessToken: string): Promise<ApiResponse<{ team: Team }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update team' };
    }

    return { data };
  } catch (error) {
    console.error('Update team error:', error);
    return { error: String(error) };
  }
}

// =====================
// MEMBER API
// =====================

export async function addMember(teamId: string, member: Partial<TeamMember>, accessToken: string): Promise<ApiResponse<{ member: TeamMember }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(member),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      return { error: 'Server returned non-JSON response. Please check server logs.' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to add member' };
    }

    return { data };
  } catch (error) {
    console.error('Add member error:', error);
    return { error: String(error) };
  }
}

export async function getMembers(teamId: string, accessToken: string): Promise<ApiResponse<{ members: TeamMember[] }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get members' };
    }

    return { data };
  } catch (error) {
    console.error('Get members error:', error);
    return { error: String(error) };
  }
}

export async function updateMember(teamId: string, memberId: string, updates: Partial<TeamMember>, accessToken: string): Promise<ApiResponse<{ member: TeamMember }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members/${memberId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update member' };
    }

    return { data };
  } catch (error) {
    console.error('Update member error:', error);
    return { error: String(error) };
  }
}

export async function deleteMember(teamId: string, memberId: string, accessToken: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete member' };
    }

    return { data };
  } catch (error) {
    console.error('Delete member error:', error);
    return { error: String(error) };
  }
}

// =====================
// TASK API
// =====================

export async function createTask(teamId: string, task: Partial<Task>, accessToken: string): Promise<ApiResponse<{ task: Task }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(task),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create task' };
    }

    return { data };
  } catch (error) {
    console.error('Create task error:', error);
    return { error: String(error) };
  }
}

export async function getTasks(teamId: string, accessToken: string): Promise<ApiResponse<{ tasks: Task[] }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get tasks' };
    }

    return { data };
  } catch (error) {
    console.error('Get tasks error:', error);
    return { error: String(error) };
  }
}

export async function updateTask(teamId: string, taskId: string, updates: Partial<Task>, accessToken: string): Promise<ApiResponse<{ task: Task }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update task' };
    }

    return { data };
  } catch (error) {
    console.error('Update task error:', error);
    return { error: String(error) };
  }
}

export async function deleteTask(teamId: string, taskId: string, accessToken: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete task' };
    }

    return { data };
  } catch (error) {
    console.error('Delete task error:', error);
    return { error: String(error) };
  }
}

// Admin APIs
export async function getAdminStats(accessToken: string): Promise<ApiResponse<{ stats: any }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get admin stats' };
    }

    return { data };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return { error: String(error) };
  }
}
