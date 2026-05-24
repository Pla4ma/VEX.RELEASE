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

const createMockSummary = () => ({
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

describe("SessionRewardIntegration - disabled (all flags false)", () => {
  const mockedEventBus = jest.mocked(eventBus);
  const helpers = jest.requireMock("../session-reward-helpers");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it("should NOT subscribe to any event when fully disabled", () => {
    new SessionRewardIntegration({
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
    });

    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it("should deduplicate via in-memory Set when enabled", async () => {
    new SessionRewardIntegration({
      autoGrantRewards: true,
      autoUpdateStreak: true,
      autoAddXP: true,
      autoCreateSocialActivity: true,
      enableSeasonChallengeProgress: true,
      autoUpdateAnalytics: true,
      enableAchievementChecks: true,
      enableMilestoneTracking: true,
    });

    const handler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:completed",
    )?.[1];

    const event = {
      sessionId: "test-session-id",
      userId: "test-user-id",
      summary: createMockSummary(),
    };

    await handler?.(event);

    const firstCallCount = helpers.calculateRewards.mock.calls.length;

    await handler?.(event);

    expect(helpers.calculateRewards).toHaveBeenCalledTimes(firstCallCount);
  });
});

describe("SessionRewardIntegration recovery/abandonment gating", () => {
  const mockedEventBus = jest.mocked(eventBus);
  const helpers = jest.requireMock("../session-reward-helpers");

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it("should NOT publish XP for recovery when autoHandleRecoveryRewards is false (default)", async () => {
    new SessionRewardIntegration({});

    const recoveryHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:recovery:successful",
    )?.[1];

    await recoveryHandler?.({
      sessionId: "s1",
      userId: "u1",
      recoveredTime: 600,
    });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });

  it("should NOT publish XP for abandonment when autoHandleAbandonmentPartialCredit is false (default)", async () => {
    new SessionRewardIntegration({});

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 600 });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });

  it("should publish XP for recovery when autoHandleRecoveryRewards is true", async () => {
    new SessionRewardIntegration({ autoHandleRecoveryRewards: true });

    const recoveryHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:recovery:successful",
    )?.[1];

    await recoveryHandler?.({
      sessionId: "s1",
      userId: "u1",
      recoveredTime: 600,
    });

    expect(helpers.publishXp).toHaveBeenCalledWith(
      "u1",
      50,
      "session_recovery",
    );
  });

  it("should publish XP for abandonment when autoHandleAbandonmentPartialCredit is true and time >= 300s", async () => {
    new SessionRewardIntegration({ autoHandleAbandonmentPartialCredit: true });

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 600 });

    expect(helpers.publishXp).toHaveBeenCalledWith(
      "u1",
      30,
      "session_partial_abandon",
    );
  });

  it("should NOT publish XP for short abandonment (<300s) even when enabled", async () => {
    new SessionRewardIntegration({ autoHandleAbandonmentPartialCredit: true });

    const abandonHandler = mockedEventBus.subscribe.mock.calls.find(
      (call) => call[0] === "session:abandoned",
    )?.[1];

    await abandonHandler?.({ sessionId: "s1", userId: "u1", elapsedTime: 120 });

    expect(helpers.publishXp).not.toHaveBeenCalled();
  });
});
