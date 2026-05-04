import { z } from 'zod';

import { eventBus } from '../events';
import { consumeInsurance } from '../features/economy/StreakInsurance';
import { restoreStreak } from '../features/streaks/service';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('integration:streak-insurance');

const StreakBrokenEventSchema = z.object({
  userId: z.string(),
  previousStreak: z.number().int().min(0),
});

let cleanupSubscription: (() => void) | null = null;

export function initializeStreakInsuranceIntegration(): () => void {
  if (cleanupSubscription) {
    return cleanupSubscription;
  }

  cleanupSubscription = eventBus.subscribe('streak:broken', async (rawEvent) => {
    const parsedEvent = StreakBrokenEventSchema.safeParse(rawEvent);
    if (!parsedEvent.success || parsedEvent.data.previousStreak <= 0) {
      return;
    }

    const { userId, previousStreak } = parsedEvent.data;
    const restoredDays = Math.max(0, previousStreak - 1);

    try {
      const insurance = await consumeInsurance({
        userId,
        streakToRestore: restoredDays,
      });

      if (!insurance.success || !insurance.restoredDays) {
        return;
      }

      const restored = await restoreStreak({
        userId,
        targetDays: insurance.restoredDays,
        source: 'PURCHASE',
      });

      if (!restored) {
        debug.warn('Streak insurance consumed but restore was rejected for user %s', userId);
        return;
      }

      eventBus.publish('analytics:track', {
        event: 'streak_insurance_auto_restored',
        properties: {
          userId,
          previousStreak,
          restoredDays: insurance.restoredDays,
        },
      });
    } catch (error) {
      debug.error('Failed to auto-restore streak insurance', error as Error);
    }
  });

  return () => {
    cleanupSubscription?.();
    cleanupSubscription = null;
  };
}
