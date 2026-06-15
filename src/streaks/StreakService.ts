import { eventBus } from '../events/EventBus';
import { getOrCreateStreak, recordSession } from '../features/streaks/service';
import { v4 } from '../utils/uuid';

type LegacyStreakState = {
  currentStreak: number;
  longestStreak: number;
  lastStreakDiedAt: number | null;
  streakFuneralShown: boolean;
};

type StreakService = {
  getState: () => Promise<LegacyStreakState>;
  markFuneralShown: () => void;
  recordSession: (options?: {
    sessionId?: string;
    completedAt?: number;
    duration?: number;
    qualityScore?: number;
    idempotencyKey?: string;
  }) => Promise<LegacyStreakState>;
};

const EMPTY_STREAK_STATE: LegacyStreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDiedAt: null,
  streakFuneralShown: false,
};

export function getStreakService(userId?: string): StreakService {
  return {
    async getState(): Promise<LegacyStreakState> {
      if (!userId) {
        return EMPTY_STREAK_STATE;
      }
      try {
        const streak = await getOrCreateStreak(userId);
        return {
          currentStreak: streak.currentDays,
          longestStreak: streak.longestDays,
          lastStreakDiedAt: streak.lastQualifyingSessionAt,
          streakFuneralShown: false,
        };
      } catch {
        return EMPTY_STREAK_STATE;
      }
    },
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
    async recordSession(options): Promise<LegacyStreakState> {
      if (!userId) {
        return EMPTY_STREAK_STATE;
      }

      const result = await recordSession({
        userId,
        sessionId: options?.sessionId ?? v4(),
        duration: options?.duration ?? 10 * 60,
        qualityScore: options?.qualityScore ?? 80,
        completedAt: options?.completedAt ?? Date.now(),
      });
      return {
        ...EMPTY_STREAK_STATE,
        currentStreak: result.newStreak,
        longestStreak: result.newStreak,
      };
    },
  };
}
