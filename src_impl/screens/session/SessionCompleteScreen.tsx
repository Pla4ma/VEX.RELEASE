import React, { useMemo } from 'react';

import { useSessionCompletionRouteState } from '../../features/session-completion/route';
import {
  usePostSessionStoryViewModel,
  useSessionCompletionConsequences,
} from '../../features/session-completion/hooks';
import { SessionCompleteContent } from './components/SessionCompleteContent';
import { SessionSummaryUnavailable } from './components/SessionSummaryUnavailable';
import { useAuthStore } from '../../store';
import type { SessionCompletionNavigationParams } from '../../features/session-completion/schemas';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

export const SessionCompleteScreen = withScreenErrorBoundary(
  function _SessionCompleteScreen(): React.JSX.Element {
    const { navigation, parsedRoute } = useSessionCompletionRouteState();

    if (!parsedRoute.params) {
      return (
        <SessionSummaryUnavailable
          message={parsedRoute.warningMessage ?? undefined}
          onDone={() => navigation.navigate({ name: 'Main', params: {} })}
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
}): JSX.Element {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;

  const shouldWarmDeepSystems = useMemo(
    () =>
      (params.summary.actualDuration ??
        params.summary.effectiveDuration ??
        0) >=
      10 * 60,
    [params.summary.actualDuration, params.summary.effectiveDuration],
  );

  // Keep deep systems warm in background for meaningful sessions only.
  // Short sessions stay focused on instant completion feedback.
  usePostSessionStoryViewModel({
    enabled: shouldWarmDeepSystems,
    sessionId: params.sessionId,
    summary: params.summary,
    userId,
  });

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
