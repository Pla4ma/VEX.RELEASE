/**
 * XP ownership proof tests.
 *
 * Verifies:
 * 1. Completed session calls ProgressionService.addXP exactly once.
 * 2. Completed session calls RewardService.grantReward for receipt only.
 * 3. RewardService failure does not block core completion.
 * 4. Reward receipt ID is recorded in ledger.
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { baseLedger, baseSummary } from "./xp-ownership-proof.fixtures";

const mockAddXP = jest.fn(async (): Promise<void> => {});
const mockGrantReward = jest.fn(async (): Promise<void> => {});
const mockCompleteSession = jest.fn(
  (): { evolved: boolean; leveledUp: boolean } => ({
    evolved: false,
    leveledUp: false,
  }),
);
const mockRecordSession = jest.fn(
  async (): Promise<{ currentStreak: number }> => ({ currentStreak: 5 }),
);
const mockCaptureException = jest.fn();
const mockAddBreadcrumb = jest.fn();

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

jest.mock("../../../progression/ProgressionService", () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock("../../../rewards/RewardService", () => ({
  getRewardService: jest.fn(() => ({ grantReward: mockGrantReward })),
}));

jest.mock("../../companion/service", () => ({
  getCompanionService: jest.fn(() => ({
    completeSession: mockCompleteSession,
  })),
}));

jest.mock("../../focus-identity/update-focus-score.helper", () => ({
  updateFocusScoreFromSessionCompletion: jest.fn(async (): Promise<void> => {}),
}));

jest.mock("../../../streaks/StreakService", () => ({
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

jest.mock("../completion-analytics", () => ({
  trackCompletionAnalytics: jest.fn(),
  trackSessionCompleted: jest.fn(),
}));

jest.mock("../../liveops-config/feature-access-store", () => ({
  setFeatureAccessMap: jest.fn(),
  getAvailabilityFor: jest.fn(() => ({ canSubscribeToEvents: true })),
}));

describe("XP ownership — ProgressionService owns XP, RewardService is receipt-only", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls ProgressionService.addXP exactly once per completion", async () => {
    const { applyCompletionSubsystems } = require("../completion-subsystems");
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
  });

  it("calls RewardService.grantReward for receipt only", async () => {
    const { applyCompletionSubsystems } = require("../completion-subsystems");
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockGrantReward).toHaveBeenCalledWith(
      "XP",
      "SESSION_COMPLETE",
      expect.objectContaining({ baseAmount: expect.any(Number) }),
      expect.objectContaining({
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
      }),
    );
  });

  it("RewardService failure does not prevent progression XP", async () => {
    mockGrantReward.mockImplementationOnce(async (): Promise<void> => {
      throw new Error("reward unavailable");
    });

    const { applyCompletionSubsystems } = require("../completion-subsystems");
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(result.degradedSystems).toContain("rewards");
  });

  it("reward receipt ID is recorded in ledger", async () => {
    const { applyCompletionSubsystems } = require("../completion-subsystems");
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result.ledger.rewardIds).toContain(
      "session-xp:550e8400-e29b-41d4-a716-446655440002",
    );
  });

  it("ProgressionService is the canonical XP mutation owner", async () => {
    const { applyCompletionSubsystems } = require("../completion-subsystems");
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledWith(
      expect.any(Number),
      "SESSION_COMPLETE",
      expect.objectContaining({
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
      }),
    );

    expect(mockGrantReward).toHaveBeenCalled();
  });
});
