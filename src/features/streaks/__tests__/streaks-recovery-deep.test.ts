/**
 * Deep Streaks Tests — recovery
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock("../../../utils/uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock("../repository", () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("../repository-helpers", () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from "../recovery";

// ============================================================================
// recovery
// ============================================================================

describe("recovery", () => {
  beforeEach(() => {
    clearRecoveryPlan("user-r1");
    clearRecoveryPlan("user-r2");
  });

  describe("createRecoveryPlan", () => {
    it("creates a plan with correct fields", () => {
      const plan = createRecoveryPlan("user-r1", 5, 100);
      expect(plan.userId).toBe("user-r1");
      expect(plan.daysLost).toBe(5);
      expect(plan.completed).toBe(false);
      expect(plan.isRecovering).toBe(true);
      expect(plan.sessionsRequired).toBe(1);
      expect(plan.expiresAt).toBeGreaterThan(Date.now());
    });

    it("requires 2 sessions for 7-14 days lost", () => {
      const plan = createRecoveryPlan("user-r2", 10, 200);
      expect(plan.sessionsRequired).toBe(2);
    });

    it("requires 3 sessions for 15+ days lost", () => {
      const plan = createRecoveryPlan("user-r1", 20, 300);
      expect(plan.sessionsRequired).toBe(3);
    });

    it("calculates reward based on days lost", () => {
      const plan = createRecoveryPlan("user-r1", 5, 100);
      expect(plan.reward.value).toBe(Math.max(100, 5 * 50));
    });
  });

  describe("getRecoveryPlan", () => {
    it("returns null when no plan exists", () => {
      expect(getRecoveryPlan("no-plan")).toBeNull();
    });

    it("returns plan after creation", () => {
      createRecoveryPlan("user-r1", 3, 50);
      const plan = getRecoveryPlan("user-r1");
      expect(plan).not.toBeNull();
      expect(plan!.daysLost).toBe(3);
    });
  });

  describe("progressRecovery", () => {
    it("returns not progressed when no plan", () => {
      const result = progressRecovery("nobody", "session_complete");
      expect(result.progressed).toBe(false);
      expect(result.currentProgress).toBe(0);
    });

    it("increments progress", () => {
      createRecoveryPlan("user-r1", 5, 100);
      const result = progressRecovery("user-r1", "session_complete");
      expect(result.progressed).toBe(true);
      expect(result.currentProgress).toBe(1);
    });

    it("marks completed when enough sessions", () => {
      createRecoveryPlan("user-r1", 5, 100);
      progressRecovery("user-r1", "session_complete");
      const plan = getRecoveryPlan("user-r1");
      expect(plan!.completed).toBe(true);
      expect(plan!.isRecovering).toBe(false);
    });
  });

  describe("clearRecoveryPlan", () => {
    it("removes the plan", () => {
      createRecoveryPlan("user-r1", 3, 50);
      clearRecoveryPlan("user-r1");
      expect(getRecoveryPlan("user-r1")).toBeNull();
    });
  });
});
