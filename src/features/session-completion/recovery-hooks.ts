import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';

import { useAuthStore } from '../../store';
import type { SessionCompletionNavigationParams } from './schemas';
import { recoverSessionCompletion } from './recovery-service';

export function useRecoveredSessionCompletion(
  sessionId?: string | null,
): {
  data: SessionCompletionNavigationParams | undefined;
  error: Error | null;
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
} {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useQuery({
    queryKey: ['session-completion-recovery', userId, sessionId],
    queryFn: async (): Promise<SessionCompletionNavigationParams> => {
      try {
        return await recoverSessionCompletion(sessionId ?? '', userId ?? '');
      } catch (error: unknown) {
        Sentry.captureException(error, {
          tags: { feature: 'session-completion-recovery' },
        });
        throw error;
      }
    },
    enabled: Boolean(sessionId && userId),
    retry: 1,
  });

  return {
    data: query.data,
    error: query.error instanceof Error ? query.error : null,
    isError: query.isError,
    isPending: query.isPending,
    refetch: () => {
      void query.refetch();
    },
  };
}
