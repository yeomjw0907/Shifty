export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          name: string;
          hospital: string | null;
          department: string | null;
          position: string | null;
          phone: string | null;
          avatar_url: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          email: string;
          name: string;
          hospital?: string | null;
          department?: string | null;
          position?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          email?: string;
          name?: string;
          hospital?: string | null;
          department?: string | null;
          position?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          hospital: string | null;
          department: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          hospital?: string | null;
          department?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          hospital?: string | null;
          department?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string | null;
          color: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: string | null;
          color?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: string | null;
          color?: string | null;
          joined_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          title: string;
          description: string | null;
          shift_type: string | null;
          date: string;
          start_time: string | null;
          end_time: string | null;
          end_date: string | null;
          is_all_day: boolean | null;
          completed: boolean | null;
          category: string | null;
          color: string | null;
          location: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          shift_type?: string | null;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          end_date?: string | null;
          is_all_day?: boolean | null;
          completed?: boolean | null;
          category?: string | null;
          color?: string | null;
          location?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          shift_type?: string | null;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          end_date?: string | null;
          is_all_day?: boolean | null;
          completed?: boolean | null;
          category?: string | null;
          color?: string | null;
          location?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      board_posts: {
        Row: {
          id: string;
          team_id: string;
          author_id: string;
          content: string;
          type: string;
          is_pinned: boolean | null;
          view_count: number | null;
          like_count: number | null;
          comment_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          author_id: string;
          content: string;
          type: string;
          is_pinned?: boolean | null;
          view_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          author_id?: string;
          content?: string;
          type?: string;
          is_pinned?: boolean | null;
          view_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_posts: {
        Row: {
          id: string;
          hospital_id: string | null;
          author_id: string;
          title: string;
          content: string;
          post_type: string;
          menu_date: string | null;
          meal_type: string | null;
          view_count: number | null;
          like_count: number | null;
          comment_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hospital_id?: string | null;
          author_id: string;
          title: string;
          content: string;
          post_type: string;
          menu_date?: string | null;
          meal_type?: string | null;
          view_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hospital_id?: string | null;
          author_id?: string;
          title?: string;
          content?: string;
          post_type?: string;
          menu_date?: string | null;
          meal_type?: string | null;
          view_count?: number | null;
          like_count?: number | null;
          comment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      privacy_consents: {
        Row: {
          id: string;
          user_id: string;
          consent_version: string;
          consented_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_version: string;
          consented_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_version?: string;
          consented_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
    };
  };
}

