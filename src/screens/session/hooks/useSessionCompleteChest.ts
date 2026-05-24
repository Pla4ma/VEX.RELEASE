import { useCallback, useEffect, useRef, useState } from 'react';

import * as Sentry from '@sentry/react-native';

import {
  trackChestRevealCompleted,
  trackChestRevealStarted,
  trackChestRolled,
} from '../../../features/rewards/analytics';
import { consumeBountyLootBoost } from '../../../features/boss/bounty-loot-boost';
import { rollChest, type ChestResult } from '../../../features/rewards/chest-engine';
import { consumeWeeklyLegendaryBoost } from '../../../features/weekly-quests/service';
import type { SessionSummary } from '../../../session/types';
import { resolveIsFirstSessionToday } from '../utils';

export function useSessionCompleteChest({
  focusedDuration,
  focusPurityScore,
  sessionId,
  summary,
  userId,
}: {
  focusedDuration: number;
  focusPurityScore: number;
  sessionId: string;
  summary: SessionSummary;
  userId: string;
}) {
  const startedChestRef = useRef(false);
  const [chestResult, setChestResult] = useState<ChestResult | null>(null);
  const [chestError, setChestError] = useState<string | null>(null);
  const [revealStage, setRevealStage] = useState(0);
  const [showCtas, setShowCtas] = useState(false);

  const prepareChest = useCallback(async () => {
    setChestError(null);

    try {
      const firstSessionToday = userId
        ? await resolveIsFirstSessionToday(userId, sessionId, summary.createdAt)
        : false;
      const bountyBoost = userId ? consumeBountyLootBoost({ userId, sessionId }) : null;
      const hasWeeklyLegendaryBoost = userId
        ? await consumeWeeklyLegendaryBoost(userId, summary.createdAt)
        : false;
      const nextChest = rollChest({
        currentStreakDays: summary.streakDays ?? 0,
        focusPurityScore,
        guaranteedTier: hasWeeklyLegendaryBoost ? 'legendary' : undefined,
        isFirstSessionToday: firstSessionToday,
        lootMultiplier: bountyBoost?.lootMultiplier ?? 1,
        sessionDurationSeconds: Math.max(1, Math.round(focusedDuration / 1000)),
        userLevel: summary.userLevel ?? 1,
      });

      setChestResult(nextChest);
      if (userId) {
        trackChestRolled(userId, nextChest);
      }
    } catch (error) {
      setChestResult(null);
      setChestError('The reward chest could not be prepared yet.');
      Sentry.captureException(error, {
        tags: { feature: 'session-complete-chest' },
      });
    }
  }, [focusPurityScore, focusedDuration, sessionId, summary, userId]);

  const handleChestOpen = useCallback(() => {
    if (!startedChestRef.current && userId && chestResult) {
      startedChestRef.current = true;
      trackChestRevealStarted(userId, chestResult);
    }
  }, [chestResult, userId]);

  const handleRevealComplete = useCallback(async (onRevealComplete: () => Promise<void>) => {
    if (userId && chestResult) {
      trackChestRevealCompleted(userId, chestResult);
    }

    setRevealStage(2);
    await onRevealComplete();
  }, [chestResult, userId]);

  useEffect(() => {
    void prepareChest();
  }, [prepareChest]);

  useEffect(() => {
    const revealTimer = setTimeout(() => setRevealStage(1), 1200);
    const ctaTimer = setTimeout(() => setShowCtas(true), 3400);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(ctaTimer);
    };
  }, []);

  return {
    actions: {
      handleChestOpen,
      handleRevealComplete,
      prepareChest,
    },
    chestError,
    chestResult,
    revealStage,
    showCtas,
  };
}
