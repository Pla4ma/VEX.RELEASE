import { useCallback, useEffect, useRef, useState } from 'react';
import { MasteryService } from '../../../features/mastery/service';
import {
  calculateTechniqueXp,
  getMasteryRankDisplay,
  type MasteryState,
} from '../../../features/mastery';

type ToastFn = (input: {
  type: 'success';
  title: string;
  message: string;
  duration: number;
}) => void;

type ApplySessionMasteryInput = {
  focusPurityScore: number;
  focusedDuration: number;
  interruptions: number;
  streakDays: number;
  isMounted: boolean;
};

export function useSessionMastery(userId: string, showToast: ToastFn) {
  const hasAppliedMasteryRef = useRef(false);
  const [masteryState, setMasteryState] = useState<MasteryState | null>(() =>
    userId ? MasteryService.getOrCreateMasteryState(userId) : null,
  );

  useEffect(() => {
    setMasteryState(
      userId ? MasteryService.getOrCreateMasteryState(userId) : null,
    );
    hasAppliedMasteryRef.current = false;
  }, [userId]);

  const applySessionMastery = useCallback(
    ({
      focusPurityScore,
      focusedDuration,
      interruptions,
      streakDays,
      isMounted,
    }: ApplySessionMasteryInput) => {
      if (!userId || hasAppliedMasteryRef.current) {
        return null;
      }
      const masteryResult = MasteryService.applySessionXp(
        userId,
        calculateTechniqueXp(
          focusedDuration / 60,
          focusPurityScore,
          interruptions > 0,
          streakDays,
          false,
          100,
        ),
      );
      hasAppliedMasteryRef.current = true;
      if (isMounted) {
        setMasteryState(masteryResult.updatedState);
      }
      if (masteryResult.rankChanged && masteryResult.newRank) {
        showToast({
          type: 'success',
          title: '🎖️ Mastery Rank Up!',
          message: `You've reached ${getMasteryRankDisplay(masteryResult.newRank).title}`,
          duration: 4000,
        });
      }
      return masteryResult;
    },
    [showToast, userId],
  );

  return { masteryState, setMasteryState, applySessionMastery };
}
