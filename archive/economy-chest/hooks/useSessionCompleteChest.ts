/**
 * useSessionCompleteChest Hook — Archived Economy System
 *
 * Manages the session completion reward chest mechanism.
 * Prepares and rolls the chest on session complete.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../../../store';
import { eventBus } from '../../../events';

type ChestState = 'idle' | 'preparing' | 'ready' | 'rolling' | 'complete' | 'error';

interface ChestReward {
  id: string;
  type: 'xp' | 'coins' | 'gems' | 'item';
  amount: number;
  label: string;
}

interface UseSessionCompleteChestReturn {
  chestState: ChestState;
  chestRewards: ChestReward[];
  error: string | null;
  prepareChest: () => Promise<void>;
  rollChest: () => Promise<ChestReward[]>;
}

const RETRY_DELAYS_MS = [500, 1000, 2000];

export function useSessionCompleteChest(
  sessionId: string,
): UseSessionCompleteChestReturn {
  const userId = useAuthStore((state) => state.user?.id);
  const [chestState, setChestState] = useState<ChestState>('idle');
  const [chestRewards, setChestRewards] = useState<ChestReward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const attemptRef = useRef(0);

  // Prepare the chest on mount when session completes
  useEffect(() => {
    if (!userId || !sessionId) return;

    // Prepare chest immediately on mount for session completion
    void prepareChest();

    // Listen for session completion event
    const handleSessionComplete = async (data: { sessionId: string }) => {
      if (data.sessionId === sessionId) {
        await prepareChest();
      }
    };

    eventBus.subscribe('session:complete', handleSessionComplete);

    return () => {
      eventBus.unsubscribe('session:complete', handleSessionComplete);
      isMountedRef.current = false;
    };
  }, [userId, sessionId]);

  const prepareChest = useCallback(async (): Promise<void> => {
    if (!userId || chestState !== 'idle') return;

    setChestState('preparing');
    setError(null);

    try {
      // Simulate chest preparation - determine rewards based on session
      // In production this would call a Supabase RPC or edge function
      const preparedRewards: ChestReward[] = [
        { id: 'xp-base', type: 'xp', amount: 50, label: 'Base XP' },
        { id: 'coins-bonus', type: 'coins', amount: 25, label: 'Focus Bonus' },
      ];

      if (isMountedRef.current) {
        setChestRewards(preparedRewards);
        setChestState('ready');
        // Auto-roll after preparation
        void rollChest();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setChestState('error');
        setError('Failed to prepare reward chest');
        Sentry.captureException(err, {
          tags: { feature: 'economy-chest', operation: 'prepareChest' },
        });
      }
    }
  }, [userId, chestState]);

  const rollChest = useCallback(async (): Promise<ChestReward[]> => {
    if (!userId || (chestState !== 'ready' && chestState !== 'rolling')) {
      return chestRewards;
    }

    setChestState('rolling');
    attemptRef.current = 0;

    const attemptRoll = async (): Promise<ChestReward[]> => {
      try {
        // Simulate chest roll with retry logic
        // In production this would call the actual reward crediting API
        const result = await creditSessionRewards(userId, chestRewards);

        if (isMountedRef.current) {
          setChestState('complete');
          return result;
        }
        throw new Error('Component unmounted');
      } catch (err) {
        attemptRef.current += 1;

        if (attemptRef.current < RETRY_DELAYS_MS.length) {
          // Wait for retry delay
          await new Promise((resolve) =>
            setTimeout(resolve, RETRY_DELAYS_MS[attemptRef.current - 1]),
          );
          return attemptRoll();
        }

        // All retries exhausted
        if (isMountedRef.current) {
          setChestState('error');
          setError('Reward chest could not be opened after 3 attempts');
          Sentry.captureException(err, {
            tags: { feature: 'economy-chest', operation: 'rollChest' },
          });
        }
        throw err;
      }
    };

    return attemptRoll();
  }, [userId, chestState, chestRewards]);

  return {
    chestState,
    chestRewards,
    error,
    prepareChest,
    rollChest,
  };
}

async function creditSessionRewards(
  userId: string,
  rewards: ChestReward[],
): Promise<ChestReward[]> {
  // In the archived economy system, this would call the progression service
  // For now, return the rewards as-is to indicate they would be credited
  return rewards.map((r) => ({ ...r, id: `${r.id}-credited` }));
}