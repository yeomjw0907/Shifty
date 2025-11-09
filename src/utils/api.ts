// ... existing code ...

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
