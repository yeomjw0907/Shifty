import { projectId } from './supabase/info';

// API Base URL
const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

// Helper: Get auth headers
function getAuthHeaders(accessToken: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
}

// API Response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// =====================
// ADMIN API
// =====================

export interface AdminPost {
  id: string;
  title: string;
  content: string;
  postType: 'notice' | 'menu';
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export async function getAdminPosts(
  hospitalId: string,
  postType: 'notice' | 'menu',
  accessToken: string
): Promise<ApiResponse<{ posts: AdminPost[] }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/hospitals/${hospitalId}/posts?type=${postType}`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get admin posts' };
    }

    return { data };
  } catch (error) {
    console.error('Get admin posts error:', error);
    return { error: String(error) };
  }
}

export async function createAdminPost(
  hospitalId: string,
  post: {
    title: string;
    content: string;
    postType: 'notice' | 'menu';
    menuDate?: string;
    mealType?: 'breakfast' | 'lunch' | 'dinner';
  },
  accessToken: string
): Promise<ApiResponse<{ post: AdminPost }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/hospitals/${hospitalId}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(post),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to create admin post' };
    }

    return { data };
  } catch (error) {
    console.error('Create admin post error:', error);
    return { error: String(error) };
  }
}

export async function updateAdminPost(
  hospitalId: string,
  postId: string,
  updates: {
    title?: string;
    content?: string;
  },
  accessToken: string
): Promise<ApiResponse<{ post: AdminPost }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/hospitals/${hospitalId}/posts/${postId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update admin post' };
    }

    return { data };
  } catch (error) {
    console.error('Update admin post error:', error);
    return { error: String(error) };
  }
}

export async function deleteAdminPost(
  hospitalId: string,
  postId: string,
  accessToken: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/hospitals/${hospitalId}/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete admin post' };
    }

    return { data };
  } catch (error) {
    console.error('Delete admin post error:', error);
    return { error: String(error) };
  }
}

export async function checkAdminStatus(
  hospitalId: string,
  accessToken: string
): Promise<ApiResponse<{ isAdmin: boolean; role?: string }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/hospitals/${hospitalId}/status`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to check admin status' };
    }

    return { data };
  } catch (error) {
    console.error('Check admin status error:', error);
    return { error: String(error) };
  }
}

// =====================
// USER MANAGEMENT API
// =====================

export interface AdminUser {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  hospital?: string;
  department?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  hospital_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails {
  user: AdminUser;
  teams: Array<{
    team_id: string;
    role: string;
    color?: string;
    joined_at: string;
    teams: {
      id: string;
      name: string;
      invite_code: string;
      hospital?: string;
      department?: string;
      created_at: string;
    };
  }>;
  createdTeams: Array<{
    id: string;
    name: string;
    invite_code: string;
    hospital?: string;
    department?: string;
    created_at: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    shift_type?: string;
    date: string;
    team_id: string;
    teams: {
      id: string;
      name: string;
    };
  }>;
  posts: Array<{
    id: string;
    title: string;
    post_type: string;
    is_anonymous: boolean;
    view_count: number;
    like_count: number;
    created_at: string;
    hospital_communities: {
      id: string;
      name: string;
      hospitals: {
        id: string;
        name: string;
        name_kr?: string;
      };
    };
  }>;
  comments: Array<{
    id: string;
    content: string;
    is_anonymous: boolean;
    created_at: string;
    community_posts: {
      id: string;
      title: string;
      post_type: string;
    };
  }>;
}

export async function getAdminUsers(
  page: number = 1,
  limit: number = 50,
  search?: string,
  accessToken: string
): Promise<ApiResponse<{ users: AdminUser[]; total: number; page: number; limit: number }>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get users' };
    }

    return { data };
  } catch (error) {
    console.error('Get admin users error:', error);
    return { error: String(error) };
  }
}

export async function getAdminUserDetails(
  userId: string,
  accessToken: string
): Promise<ApiResponse<UserDetails>> {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get user details' };
    }

    return { data };
  } catch (error) {
    console.error('Get admin user details error:', error);
    return { error: String(error) };
  }
}

export async function updateAdminUser(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    hospital?: string;
    department?: string;
    position?: string;
    phone?: string;
    hospital_id?: string;
  },
  accessToken: string
): Promise<ApiResponse<{ user: AdminUser }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to update user' };
    }

    return { data };
  } catch (error) {
    console.error('Update admin user error:', error);
    return { error: String(error) };
  }
}

export async function deleteAdminUser(
  userId: string,
  accessToken: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to delete user' };
    }

    return { data };
  } catch (error) {
    console.error('Delete admin user error:', error);
    return { error: String(error) };
  }
}

// =====================
// AUTH API
// =====================

export async function signUp(
  email: string,
  password: string,
  name: string,
  hospital?: string,
  hospitalId?: string,
  hospitalAuthCode?: string,
  department?: string,
  position?: string,
  phone?: string
): Promise<ApiResponse<{ user: any; team: any }>> {
  try {
    const authApiBase = API_BASE.replace('/server', '/make-server-3afd3c70');
    const response = await fetch(`${authApiBase}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        hospital,
        hospital_id: hospitalId,
        hospital_auth_code: hospitalAuthCode,
        department,
        position,
        phone,
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
// HOSPITAL API
// =====================

export interface Hospital {
  id: string;
  name: string;
  name_kr?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  type?: string;
  beds?: number;
  latitude?: number;
  longitude?: number;
}

export async function searchHospitals(
  query: string,
  limit: number = 10,
  city?: string
): Promise<ApiResponse<{ hospitals: Hospital[] }>> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });
    if (city) {
      params.append('city', city);
    }

    // Server endpoint uses /make-server-3afd3c70/hospitals/search
    const hospitalApiBase = API_BASE.replace('/server', '/make-server-3afd3c70');
    const url = `${hospitalApiBase}/hospitals/search?${params.toString()}`;
    console.log('🌐 API 호출:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 API 응답 상태:', response.status, response.statusText);
    const data = await response.json();
    console.log('📦 API 응답 데이터:', data);

    if (!response.ok) {
      console.error('❌ API 오류:', data);
      return { error: data.error || 'Failed to search hospitals' };
    }

    return { data };
  } catch (error) {
    console.error('❌ Search hospitals error:', error);
    return { error: String(error) };
  }
}

export async function getHospital(
  hospitalId: string
): Promise<ApiResponse<{ hospital: Hospital }>> {
  try {
    // Server endpoint uses /make-server-3afd3c70/hospitals/:id
    const hospitalApiBase = API_BASE.replace('/server', '/make-server-3afd3c70');
    const response = await fetch(`${hospitalApiBase}/hospitals/${hospitalId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to get hospital' };
    }

    return { data };
  } catch (error) {
    console.error('Get hospital error:', error);
    return { error: String(error) };
  }
}
