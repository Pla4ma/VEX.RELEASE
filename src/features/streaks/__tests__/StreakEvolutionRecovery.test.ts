import {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from "../StreakEvolutionSystem";

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe("StreakEvolutionSystem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Recovery Plan", () => {
    const userId = "test-user-456";

    beforeEach(() => {
      clearRecoveryPlan(userId);
    });

    describe("createRecoveryPlan", () => {
      it("should create plan for lost streak < 7 days", () => {
        const plan = createRecoveryPlan(userId, 5, 1000);
        expect(plan).not.toBeNull();
        expect(plan?.userId).toBe(userId);
        expect(plan?.daysLost).toBe(5);
        expect(plan?.sessionsRequired).toBe(1);
      });

      it("should create plan for lost streak 7-14 days", () => {
        const plan = createRecoveryPlan(userId, 10, 1000);
        expect(plan?.sessionsRequired).toBe(2);
      });

      it("should create plan for lost streak > 14 days", () => {
        const plan = createRecoveryPlan(userId, 20, 5000);
        expect(plan?.sessionsRequired).toBe(3);
      });

      it("should have appropriate reward", () => {
        const plan = createRecoveryPlan(userId, 5, 1000);
        expect(plan?.reward.type).toBeDefined();
        expect(plan?.reward.value).toBeGreaterThan(0);
      });

      it("should publish event", () => {
        const { eventBus } = require("../../../events");
        createRecoveryPlan(userId, 5, 100);
        expect(eventBus.publish).toHaveBeenCalledWith(
          "streak:recovery_plan_created",
          expect.any(Object),
        );
      });
    });

    describe("getRecoveryPlan", () => {
      it("should return null when no plan exists", () => {
        const plan = getRecoveryPlan(userId);
        expect(plan).toBeNull();
      });

      it("should return plan when exists", () => {
        createRecoveryPlan(userId, 5, 100);
        const plan = getRecoveryPlan(userId);
        expect(plan).not.toBeNull();
        expect(plan?.userId).toBe(userId);
      });

      it("should return null for expired plan", () => {
        const plan = createRecoveryPlan(userId, 5, 100);
        if (plan) {
          plan.expiresAt = Date.now() - 1000;
        }
        const retrieved = getRecoveryPlan(userId);
        expect(retrieved).toBeNull();
      });
    });

    describe("progressRecovery", () => {
      it("should progress plan on session complete", () => {
        createRecoveryPlan(userId, 5, 100);
        const result = progressRecovery(userId, "session_complete");
        expect(result.progressed).toBe(true);
        expect(result.currentProgress).toBe(1);
      });

      it("should complete plan when all sessions done", () => {
        const plan = createRecoveryPlan(userId, 5, 100);
        const required = plan?.sessionsRequired || 1;
        for (let i = 0; i < required; i++) {
          progressRecovery(userId, "session_complete");
        }
        const updatedPlan = getRecoveryPlan(userId);
        expect(updatedPlan?.completed).toBe(true);
      });

      it("should return false when no plan exists", () => {
        const result = progressRecovery("no-plan-user", "session_complete");
        expect(result.progressed).toBe(false);
      });
    });

    describe("clearRecoveryPlan", () => {
      it("should clear existing plan", () => {
        createRecoveryPlan(userId, 5, 100);
        clearRecoveryPlan(userId);
        const plan = getRecoveryPlan(userId);
        expect(plan).toBeNull();
      });
    });
  });
});
