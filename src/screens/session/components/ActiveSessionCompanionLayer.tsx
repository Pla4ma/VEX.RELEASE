import React from 'react';
import { CompanionSessionLayer } from '../../../session/components/CompanionSessionLayer';
import { SessionMode } from '../../../session/modes';
import {
  ENABLE_SESSION_COMPANION_LAYER,
  type ActiveSessionContentProps,
} from '../ActiveSessionContent.types';

type Controller = ActiveSessionContentProps['controller'];

export function ActiveSessionCompanionLayer({
  companion,
  currentMode,
  displayPolicy,
  sessionQuery,
  activeSession,
  purityScore,
}: {
  companion: Controller['companion'];
  currentMode: ActiveSessionContentProps['currentMode'];
  displayPolicy: ActiveSessionContentProps['displayPolicy'];
  sessionQuery: Controller['sessionQuery'];
  activeSession: NonNullable<Controller['sessionQuery']['session']>;
  purityScore: number;
}): React.ReactElement | null {
  if (
    !ENABLE_SESSION_COMPANION_LAYER ||
    !displayPolicy.showCompanionLayer ||
    !companion.state ||
    currentMode === SessionMode.DEEP_WORK
  ) {
    return null;
  }

  return (
    <CompanionSessionLayer
      companionState={companion.state}
      elapsedSeconds={sessionQuery.elapsedSeconds}
      eventLabel={companion.eventLabel}
      isPaused={sessionQuery.isPaused}
      purityScore={purityScore}
      sessionProgress={companion.sessionProgress}
      totalSeconds={Math.max(
        activeSession.config.duration,
        sessionQuery.elapsedSeconds + sessionQuery.remainingSeconds,
        1,
      )}
    />
  );
}
