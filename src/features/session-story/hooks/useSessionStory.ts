/**
 * useSessionStory Hook
 *
 * Fetches the generated story for a completed session.
 *
 * @phase 17.2
 */

import { useQuery } from '@tanstack/react-query';
import { getStoryForSession } from '../SessionStoryEngine';
import type { SessionStory } from '../schemas';

interface UseSessionStoryResult {
  story: SessionStory | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch the cinematic story for a session
 *
 * @example
 * const { story, isLoading } = useSessionStory(sessionId, userId);
 *
 * if (story) {
 *   return <SessionStoryOverlay story={story} ... />;
 * }
 */
export function useSessionStory(
  sessionId: string | null,
  userId: string | null
): UseSessionStoryResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['session-story', sessionId, userId],
    queryFn: async () => {
      if (!sessionId || !userId) {
        return null;
      }
      return getStoryForSession(sessionId, userId);
    },
    enabled: !!sessionId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    story: data ?? null,
    isLoading,
    error: error ?? null,
  };
}
