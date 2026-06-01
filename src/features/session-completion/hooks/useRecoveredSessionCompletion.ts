import { useQuery } from '@tanstack/react-query';

import { recoverSessionCompletionParams } from '../service';
import type { SessionCompletionNavigationParams } from '../schemas';

const recoveredCompletionKeys = {
  detail: (sessionId: string | null) => [
    'session-completion',
    'recovered',
    sessionId ?? 'none',
  ],
};

export function useRecoveredSessionCompletion(sessionId: string | null): {
  data: SessionCompletionNavigationParams | null;
  error: Error | null;
  isError: boolean;
  isPending: boolean;
  refetch: () => Promise<unknown>;
} {
  const query = useQuery({
    enabled: Boolean(sessionId),
    queryFn: async () => {
      if (!sessionId) {
        return null;
      }
      return recoverSessionCompletionParams(sessionId);
    },
    queryKey: recoveredCompletionKeys.detail(sessionId),
    retry: 1,
    staleTime: 60 * 1000,
  });

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error : null,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
