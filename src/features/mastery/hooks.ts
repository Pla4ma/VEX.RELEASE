import { useCallback } from 'react';
import { MasteryService } from './service';
import type { MasteryState } from './types';

export function useMasteryActions() {
  const claimChallenge = useCallback(
    (userId: string, challengeId: string): MasteryState | null => {
      if (!userId) { return null; }
      const success = MasteryService.claimChallenge(userId, challengeId);
      if (!success) { return null; }
      return MasteryService.getOrCreateMasteryState(userId);
    },
    [],
  );

  const getMasteryState = useCallback(
    (userId: string): MasteryState | null => {
      if (!userId) { return null; }
      return MasteryService.getOrCreateMasteryState(userId);
    },
    [],
  );

  return { claimChallenge, getMasteryState };
}
