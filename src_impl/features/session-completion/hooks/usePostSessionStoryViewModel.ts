import { useQuery } from '@tanstack/react-query';

import { useNetInfo } from '../../../network';
import type { SessionSummary } from '../../../session/types';
import { getCompletionLedgerBySessionId } from '../repository';
import {
  buildPostSessionStoryViewModel,
  type PostSessionStoryViewModel,
} from '../story-view-model-service';

export function usePostSessionStoryViewModel(input: {
  enabled?: boolean;
  sessionId: string;
  summary: SessionSummary;
  userId: string | null;
}) {
  const { isOnline } = useNetInfo();
  const { enabled = true, sessionId, summary, userId } = input;

  const query = useQuery<PostSessionStoryViewModel | null, Error>({
    enabled: enabled && Boolean(sessionId),
    queryFn: async () => {
      const ledger = await getCompletionLedgerBySessionId(sessionId);
      if (!ledger) {
        return null;
      }
      return buildPostSessionStoryViewModel({
        degradedWarnings: ledger.degradedSystems,
        ledger,
        summary,
      });
    },
    queryKey: ['session-completion', 'story-view-model', userId, sessionId],
    staleTime: 30_000,
  });

  return {
    data: query.data ?? null,
    error: query.error,
    isError: query.isError,
    isOffline: !isOnline,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}
