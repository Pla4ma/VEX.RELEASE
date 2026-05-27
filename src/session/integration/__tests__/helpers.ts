import { SessionRewardIntegration } from "../SessionRewardIntegration";
import { eventBus } from "../../../events";
import type { SessionSummary } from "../../types";

jest.mock("../../../events");

const createMockSummary = (
  overrides: Partial<SessionSummary> = {},
): SessionSummary => ({
  sessionId: "test-session",
  userId: "test-user",
  status: "COMPLETED",
  plannedDuration: 1500,
  actualDuration: 1500,
  effectiveDuration: 1500,
  pausedDuration: 0,
  completionPercentage: 100,
  focusQuality: 95,
  interruptions: 0,
  pauses: 0,
  baseScore: 250,
  timeBonus: 0,
  streakBonus: 0,
  finalScore: 250,
  xpEarned: 250,
  coinsEarned: 25,
  gemsEarned: 1,
  streakMaintained: true,
  streakIncreased: true,
  completedAt: Date.now(),
  ...overrides,
});

export { SessionRewardIntegration, eventBus, createMockSummary };
