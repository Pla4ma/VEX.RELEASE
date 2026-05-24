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

jest.mock("../../../features/battle-pass/service", () => ({
  addBattlePassXp: jest.fn(),
}));

jest.mock("../../../features/seasons/repository", () => ({
  fetchActiveSeason: jest.fn().mockResolvedValue(null),
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

import { eventBus } from "../../../events";
import { SessionRewardIntegration } from "../SessionRewardIntegration";

const mockedEventBus = jest.mocked(eventBus);

const ALL_DISABLED = {
  autoGrantRewards: false,
  autoUpdateStreak: false,
  autoAddXP: false,
  autoCreateSocialActivity: false,
  enableSeasonChallengeProgress: false,
  autoUpdateAnalytics: false,
  enableAchievementChecks: false,
  enableMilestoneTracking: false,
  autoHandleRecoveryRewards: false,
  autoHandleAbandonmentPartialCredit: false,
};

const COMPLETION_ONLY = {
  autoGrantRewards: true,
  autoUpdateStreak: true,
  autoAddXP: true,
  autoCreateSocialActivity: false,
  enableSeasonChallengeProgress: false,
  autoUpdateAnalytics: false,
  enableAchievementChecks: false,
  enableMilestoneTracking: false,
  autoHandleRecoveryRewards: false,
  autoHandleAbandonmentPartialCredit: false,
};

const RECOVERY_ONLY = {
  ...ALL_DISABLED,
  autoHandleRecoveryRewards: true,
};

const ABANDONMENT_ONLY = {
  ...ALL_DISABLED,
  autoHandleAbandonmentPartialCredit: true,
};

describe("SessionRewardIntegration — subscription gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fully disabled integration has zero subscriptions", () => {
    new SessionRewardIntegration(ALL_DISABLED);
    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it("completion-only enabled subscribes only to session:completed", () => {
    new SessionRewardIntegration(COMPLETION_ONLY);

    const subscribedEvents = mockedEventBus.subscribe.mock.calls.map(
      (call) => call[0],
    );
    expect(subscribedEvents).toContain("session:completed");
    expect(subscribedEvents).not.toContain("session:recovery:successful");
    expect(subscribedEvents).not.toContain("session:abandoned");
    expect(subscribedEvents).toHaveLength(1);
  });

  it("recovery-only enabled subscribes only to recovery", () => {
    new SessionRewardIntegration(RECOVERY_ONLY);

    const subscribedEvents = mockedEventBus.subscribe.mock.calls.map(
      (call) => call[0],
    );
    expect(subscribedEvents).toContain("session:recovery:successful");
    expect(subscribedEvents).not.toContain("session:completed");
    expect(subscribedEvents).not.toContain("session:abandoned");
    expect(subscribedEvents).toHaveLength(1);
  });

  it("abandonment-only enabled subscribes only to abandoned", () => {
    new SessionRewardIntegration(ABANDONMENT_ONLY);

    const subscribedEvents = mockedEventBus.subscribe.mock.calls.map(
      (call) => call[0],
    );
    expect(subscribedEvents).toContain("session:abandoned");
    expect(subscribedEvents).not.toContain("session:completed");
    expect(subscribedEvents).not.toContain("session:recovery:successful");
    expect(subscribedEvents).toHaveLength(1);
  });

  it("final release config has zero legacy subscriptions", () => {
    new SessionRewardIntegration(ALL_DISABLED);
    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it("recovery + abandonment enabled subscribes to both but not completion", () => {
    new SessionRewardIntegration({
      ...ALL_DISABLED,
      autoHandleRecoveryRewards: true,
      autoHandleAbandonmentPartialCredit: true,
    });

    const subscribedEvents = mockedEventBus.subscribe.mock.calls.map(
      (call) => call[0],
    );
    expect(subscribedEvents).toContain("session:recovery:successful");
    expect(subscribedEvents).toContain("session:abandoned");
    expect(subscribedEvents).not.toContain("session:completed");
    expect(subscribedEvents).toHaveLength(2);
  });
});
