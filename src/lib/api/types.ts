// Team types
export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  hospital?: string | null;
  department?: string | null;
  description?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  avatar?: string | null;
  hospital?: string | null;
  department?: string | null;
  position?: string | null;
  userId: string;
  teamId: string;
  joinedAt: string;
}

export interface CreateTeamPayload {
  name: string;
  hospital?: string;
  department?: string;
  description?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  hospital?: string;
  department?: string;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

