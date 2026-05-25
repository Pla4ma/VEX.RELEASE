import { useMemo } from 'react';

import { createUnlockDecision } from './service';
import type { UnlockDecision, UnlockExplainerInput } from './types';

export function useUnlockDecision(input: UnlockExplainerInput): UnlockDecision {
  return useMemo(
    () => createUnlockDecision(input),
    [
      input.featureKey,
      input.laneProfile,
      input.sessionCount,
      input.isPremium,
      input.hasRelatedBehavior,
      input.manualOverride,
    ],
  );
}
