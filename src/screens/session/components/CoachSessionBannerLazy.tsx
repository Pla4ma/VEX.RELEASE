import React from 'react';
import { CoachSessionBanner, type CoachPersonaStyle } from '../../../features/ai-coach/components/CoachSessionBanner';
import { useCoachState } from '../../../features/ai-coach/hooks';

type CoachSessionBannerLazyProps = {
  userId: string | undefined;
  showCoachBanner: boolean;
  elapsedSeconds: number;
  isPaused: boolean;
};

export function CoachSessionBannerLazy({
  userId,
  showCoachBanner,
  elapsedSeconds,
  isPaused,
}: CoachSessionBannerLazyProps): React.JSX.Element | null {
  if (!showCoachBanner || !userId) {
    return null;
  }
  return <CoachBannerInternal userId={userId} elapsedSeconds={elapsedSeconds} isPaused={isPaused} />;
}

function CoachBannerInternal({
  userId,
  elapsedSeconds,
  isPaused,
}: {
  userId: string;
  elapsedSeconds: number;
  isPaused: boolean;
}): React.JSX.Element | null {
  const { data: coachState } = useCoachState(userId);
  if (!coachState) {
    return null;
  }
  const personaStyle: CoachPersonaStyle =
    coachState.currentState === 'OVERLOAD_PROTECTION' ? 'DRILL_SERGEANT' : 'MENTOR';
  return (
    <CoachSessionBanner
      coachName="Coach"
      personaStyle={personaStyle}
      elapsedSeconds={elapsedSeconds}
      isPaused={isPaused}
    />
  );
}
