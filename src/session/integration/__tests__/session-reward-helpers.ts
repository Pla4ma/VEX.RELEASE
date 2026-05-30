import { eventBus } from "../../../events";
import type { SessionSummary } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockSummary(
  overrides: Partial<SessionSummary> = {},
): any {
  return {
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
  };
}

export function setupMockEventBus() {
  // Restore any previous spies to avoid nesting
  jest.restoreAllMocks();

  const publish = jest
    .spyOn(eventBus, "publish")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation((() => {}) as any);
  const subscribe = jest
    .spyOn(eventBus, "subscribe")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation((() => () => {}) as any);

  return { publish, subscribe };
}
