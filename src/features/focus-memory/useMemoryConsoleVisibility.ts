import { useQuery } from '@tanstack/react-query';

import { countCompletedSessions } from '../session-history/repository';

const MEMORY_CONSOLE_MIN_SESSIONS = 3;

export function useMemoryConsoleVisibility(
  userId: string | null,
):
  | { isVisible: false; isLoading: true; error: null }
  | { isVisible: false; isLoading: false; error: Error }
  | { isVisible: boolean; isLoading: false; error: null } {
  const query = useQuery({
    queryKey: ['memory-console-visible', userId],
    queryFn: async () => {
      if (!userId) {return false;}
      const count = await countCompletedSessions(userId);
      return count >= MEMORY_CONSOLE_MIN_SESSIONS;
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  if (query.isPending) {
    return { isVisible: false, isLoading: true, error: null };
  }
  if (query.isError) {
    return { isVisible: false, isLoading: false, error: query.error as Error };
  }
  return {
    isVisible: query.data ?? false,
    isLoading: false,
    error: null,
  };
}
