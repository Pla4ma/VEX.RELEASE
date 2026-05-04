/**
 * useSquadLivePresence Hook
 *
 * Real-time squad presence via Supabase realtime subscriptions.
 * Returns list of squad members currently in active sessions with their progress %.
 *
 * @phase 11.1
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseClient } from '../../../config/supabase';
import { eventBus } from '../../../events';

export interface SquadMemberPresence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isFocusing: boolean;
  sessionId?: string;
  progressPercent: number;
  elapsedSeconds: number;
  sessionDuration: number;
  startedAt: number;
}

export interface SquadPresenceState {
  members: SquadMemberPresence[];
  focusingCount: number;
  isLoading: boolean;
  error: Error | null;
}

interface RawSessionData {
  id: string;
  user_id: string;
  status: string;
  elapsed_seconds: number;
  config?: {
    duration?: number;
  };
  started_at: string;
  users?: Array<{
    id: string;
    display_name: string;
    avatar_url?: string;
  }>;
}

/**
 * Hook for real-time squad presence
 *
 * @param squadId - The squad ID to monitor
 * @param excludeUserId - Optional user ID to exclude from results (current user)
 * @returns SquadPresenceState with live member presence data
 */
export function useSquadLivePresence(
  squadId: string | undefined,
  excludeUserId?: string
): SquadPresenceState {
  const [members, setMembers] = useState<SquadMemberPresence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null>(null);
  const supabase = getSupabaseClient();

  const fetchSquadPresence = useCallback(async () => {
    if (!squadId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get squad member IDs
      const { data: memberData, error: memberError } = await supabase
        .from('squad_members')
        .select('user_id')
        .eq('squad_id', squadId)
        .eq('is_active', true);

      if (memberError) {throw memberError;}

      const memberIds = (memberData || [])
        .map((row: { user_id: string }) => row.user_id)
        .filter((id: string) => id !== excludeUserId);

      if (memberIds.length === 0) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      // Get active sessions for squad members
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          user_id,
          status,
          elapsed_seconds,
          config,
          started_at,
          users:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .in('user_id', memberIds)
        .eq('status', 'ACTIVE');

      if (sessionError) {throw sessionError;}

      // Transform to presence data
      const presenceData: SquadMemberPresence[] = (sessionData || []).map((row: RawSessionData) => {
        const duration = row.config?.duration || 1800; // Default 30 min
        const progressPercent = Math.min(100, Math.round((row.elapsed_seconds / duration) * 100));
        const userInfo = row.users?.[0]; // Supabase returns array from join

        return {
          userId: row.user_id,
          displayName: userInfo?.display_name || 'Unknown',
          avatarUrl: userInfo?.avatar_url,
          isFocusing: true,
          sessionId: row.id,
          progressPercent,
          elapsedSeconds: row.elapsed_seconds,
          sessionDuration: duration,
          startedAt: new Date(row.started_at).getTime(),
        };
      });

      setMembers(presenceData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      eventBus.publish('analytics:track', {
        event: 'squad_presence_fetch_error',
        properties: { squadId, error: error.message },
      });
    } finally {
      setIsLoading(false);
    }
  }, [squadId, excludeUserId, supabase]);

  useEffect(() => {
    if (!squadId) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchSquadPresence();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`squad_presence:${squadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          // Refetch presence data when sessions change
          fetchSquadPresence();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          eventBus.publish('analytics:track', {
            event: 'squad_presence_subscribed',
            properties: { squadId },
          });
        }
      });

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [squadId, fetchSquadPresence, supabase]);

  const focusingCount = members.filter((m) => m.isFocusing).length;

  return {
    members,
    focusingCount,
    isLoading,
    error,
  };
}

export default useSquadLivePresence;
