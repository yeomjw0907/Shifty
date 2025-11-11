import { useState, useEffect, useCallback } from 'react';
import * as teamsApi from '../lib/api/teams';
import type { Team, TeamWithMembers, ApiResponse } from '../lib/api/types';

interface UseMyTeamsReturn {
  teams: Team[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user's teams
 */
export function useMyTeams(): UseMyTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Team[]> = await teamsApi.getMyTeams();

      if (response.error) {
        setError(response.error);
        setTeams([]);
      } else {
        setTeams(response.data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams';
      setError(errorMessage);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
  };
}

interface UseTeamReturn {
  team: TeamWithMembers | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single team by ID
 */
export function useTeam(teamId: string | null): UseTeamReturn {
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async (): Promise<void> => {
    if (!teamId) {
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<TeamWithMembers> = await teamsApi.getTeam(teamId);

      if (response.error) {
        setError(response.error);
        setTeam(null);
      } else {
        setTeam(response.data || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team';
      setError(errorMessage);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
  };
}

