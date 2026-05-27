import { SessionRewardIntegration } from "../SessionRewardIntegration";
import { eventBus } from "../../../events";

jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));

jest.mock("../../../features/streaks/service", () => ({
  getStreakSummary: jest.fn().mockResolvedValue({ currentDays: 3 }),
  restoreStreak: jest.fn(),
}));

jest.mock("../../../features/streaks/restore-quest", () => ({
  clearStreakRestoreQuest: jest.fn(),
  markStreakRestoreUsed: jest.fn(),
  recordStreakRestoreSession: jest
    .fn()
    .mockResolvedValue({ shouldRestore: false, streakBefore: null }),
}));

jest.mock("../session-reward-helpers", () => ({
  calculateRewards: jest.fn().mockReturnValue({
    totalXP: 100,
    totalCoins: 10,
    totalGems: 1,
    streakMultiplier: 1,
    achievementsUnlocked: [],
    modeMultiplier: 1,
    qualityMultiplier: 1,
    difficultyMultiplier: 1,
    dailyModifier: 1,
  }),
  grantRewards: jest.fn(),
  publishAchievements: jest.fn(),
  publishAnalytics: jest.fn(),
  publishChallengeProgress: jest.fn(),
  publishMilestones: jest.fn(),
  publishSocialActivity: jest.fn(),
  publishXp: jest.fn(),
  recordSquadWarDamageIfNeeded: jest.fn().mockResolvedValue(undefined),
  updateStreak: jest.fn(),
}));

export { SessionRewardIntegration, eventBus };

export const createMockSummary = () => ({
  sessionId: "test-session-id",
  userId: "test-user-id",
  sessionMode: "standard" as const,
  plannedDuration: 1500000,
  actualDuration: 1500000,
  effectiveDuration: 1500000,
  completionPercentage: 100,
  focusQuality: 95,
  focusPurityScore: 95,
  interruptions: 0,
  pauses: 0,
  pausedTime: 0,
  streakMaintained: true,
  modeBonus: 0,
  baseScore: 100,
  createdAt: Date.now(),
  status: "COMPLETED" as const,
});
