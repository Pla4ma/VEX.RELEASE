import { useMemo } from 'react';

import {
  useInitialLane,
  type Lane,
  type LaneProfile,
  type ResolveInitialLaneInput,
} from '../../../features/lane-engine';
import type { MotivationStyle } from '../../../features/personalization/schemas';

function normalizeGoal(goal: string): ResolveInitialLaneInput['primaryGoal'] {
  switch (goal) {
    case 'focus':
    case 'study':
    case 'work':
    case 'creative':
    case 'personal':
    case 'learning':
      return goal;
    default:
      return null;
  }
}

export function useHomeLaneProfile(input: {
  chosenLane: Lane | null;
  motivationStyle: MotivationStyle;
  preferredSessionMode:
    | ResolveInitialLaneInput['sessionMode']
    | null
    | undefined;
  primaryGoal: string;
}): LaneProfile {
  const laneInput = useMemo<ResolveInitialLaneInput>(
    () => ({
      primaryGoal: normalizeGoal(input.primaryGoal),
      motivationStyle: input.motivationStyle,
      manualOverride: input.chosenLane,
      observedAt: Date.now(),
      sessionMode: input.preferredSessionMode ?? undefined,
    }),
    [
      input.primaryGoal,
      input.motivationStyle,
      input.chosenLane,
      input.preferredSessionMode,
    ],
  );

  return useInitialLane(laneInput);
}
