import React from 'react';

import { useSessionCompletionRouteState } from '../../features/session-completion/route';
import {
  usePostSessionStoryViewModel,
  useSessionCompletionConsequences,
} from '../../features/session-completion/hooks';
import { SessionCompleteContent } from './components/SessionCompleteContent';
import { SessionCompleteSkeleton } from './components/SessionCompleteSkeleton';
import { SessionCompleteState } from './components/SessionCompleteState';
import { SessionSummaryUnavailable } from './components/SessionSummaryUnavailable';
import { useAuthStore } from '../../store';
import type { SessionCompletionNavigationParams } from '../../features/session-completion/schemas';

export const SessionCompleteScreen: React.FC = () => {
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
};

function SessionCompleteResolved({
  params,
}: {
  params: SessionCompletionNavigationParams;
}): JSX.Element {
  const { navigation } = useSessionCompletionRouteState();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const story = usePostSessionStoryViewModel({
    sessionId: params.sessionId,
    summary: params.summary,
    userId,
  });
  const consequences = useSessionCompletionConsequences({
    summary: params.summary,
    userId,
  });

  if (story.isPending) {
    return <SessionCompleteSkeleton />;
  }

  if (story.isError) {
    return (
      <SessionCompleteState
        body="The session is safe, but the result screen needs one more refresh."
        ctaLabel="Retry result"
        onPress={() => void story.refetch()}
        title="Your finish is still syncing"
        variant="error"
      />
    );
  }

  if (!story.data) {
    return (
      <SessionCompleteState
        body="The completed session exists, but its ledger has not arrived on this device yet."
        ctaLabel="Return home"
        onPress={() => navigation.navigate({ name: 'Main', params: {} })}
        title="Result receipt is not ready"
        variant={story.isOffline ? 'offline' : 'empty'}
      />
    );
  }

  return (
    <SessionCompleteContent
      sessionId={params.sessionId}
      summary={params.summary}
      consequences={consequences}
    />
  );
}

export default SessionCompleteScreen;
