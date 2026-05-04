import { eventBus } from '../events';
import { recordSession } from '../features/streaks/service';

type LegacyStreakState = {
  currentStreak: number;
};

type StreakService = {
  markFuneralShown: () => void;
  recordSession: () => Promise<LegacyStreakState>;
};

export function getStreakService(userId?: string): StreakService {
  return {
    markFuneralShown(): void {
      if (!userId) {
        return;
      }
      eventBus.publish('streak:funeral_shown', {
        userId,
        previousStreak: 0,
        diedAt: Date.now(),
      });
    },
    async recordSession(): Promise<LegacyStreakState> {
      if (!userId) {
        return { currentStreak: 0 };
      }

      const result = await recordSession({
        userId,
        sessionId: crypto.randomUUID(),
        duration: 10 * 60,
        qualityScore: 80,
        completedAt: Date.now(),
      });
      return { currentStreak: result.newStreak };
    },
  };
}
