import { eventBus } from "../events";
import { recordSession } from "../features/streaks/service";
import { v4 } from "../utils/uuid";

type LegacyStreakState = {
  currentStreak: number;
  longestStreak: number;
  lastStreakDiedAt: number | null;
  streakFuneralShown: boolean;
};

type StreakService = {
  getState: () => LegacyStreakState;
  markFuneralShown: () => void;
  recordSession: () => Promise<LegacyStreakState>;
};

const EMPTY_STREAK_STATE: LegacyStreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastStreakDiedAt: null,
  streakFuneralShown: false,
};

export function getStreakService(userId?: string): StreakService {
  return {
    getState(): LegacyStreakState {
      return EMPTY_STREAK_STATE;
    },
    markFuneralShown(): void {
      if (!userId) {
        return;
      }
      eventBus.publish("streak:funeral_shown", {
        userId,
        previousStreak: 0,
        diedAt: Date.now(),
      });
    },
    async recordSession(): Promise<LegacyStreakState> {
      if (!userId) {
        return EMPTY_STREAK_STATE;
      }

      const result = await recordSession({
        userId,
        sessionId: v4(),
        duration: 10 * 60,
        qualityScore: 80,
        completedAt: Date.now(),
      });
      return {
        ...EMPTY_STREAK_STATE,
        currentStreak: result.newStreak,
        longestStreak: result.newStreak,
      };
    },
  };
}
