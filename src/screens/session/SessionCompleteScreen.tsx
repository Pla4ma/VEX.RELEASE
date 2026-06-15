import React from 'react';

import { useSessionCompletionRouteState } from '../../features/session-completion/route';
import {
  useRecoveredSessionCompletion,
  useSessionCompletionConsequences,
} from '../../features/session-completion/hooks';
import { SessionCompleteContent } from './components/SessionCompleteContent';
import { SessionCompleteSkeleton } from './components/SessionCompleteSkeleton';
import { SessionSummaryUnavailable } from './components/SessionSummaryUnavailable';
import { useAuthStore } from '../../store';
import type { SessionCompletionNavigationParams } from '../../features/session-completion/schemas';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

export const SessionCompleteScreen = withScreenErrorBoundary(
  function SessionCompleteScreen(): React.JSX.Element {
    const { navigation, parsedRoute } = useSessionCompletionRouteState();
    const recoveredCompletion = useRecoveredSessionCompletion(
      parsedRoute.recoverySessionId,
    );

    if (!parsedRoute.params) {
      if (recoveredCompletion.isPending && parsedRoute.recoverySessionId) {
        return <SessionCompleteSkeleton />;
      }
      if (recoveredCompletion.data) {
        return <SessionCompleteResolved params={recoveredCompletion.data} />;
      }

      return (
        <SessionSummaryUnavailable
          message={
            recoveredCompletion.isPending && parsedRoute.recoverySessionId
              ? 'VEX is rebuilding this win from your saved completion record.'
              : (parsedRoute.warningMessage ?? undefined)
          }
          onDone={() => navigation.navigate({ name: 'Main', params: {} })}
          onRetry={
            parsedRoute.recoverySessionId && recoveredCompletion.isError
              ? () => {
                  recoveredCompletion.refetch();
                }
              : undefined
          }
        />
      );
    }

    return <SessionCompleteResolved params={parsedRoute.params} />;
  },
  'Session Complete',
);

function SessionCompleteResolved({
  params,
}: {
  params: SessionCompletionNavigationParams;
}): React.ReactNode {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const consequences = useSessionCompletionConsequences({
    summary: params.summary,
    userId,
  });

  return (
    <SessionCompleteContent
      sessionId={params.sessionId}
      summary={params.summary}
      consequences={consequences}
    />
  );
}

export default SessionCompleteScreen;
