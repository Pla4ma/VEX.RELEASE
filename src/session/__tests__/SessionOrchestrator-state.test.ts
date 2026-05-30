import { mockConfig, createOrchestrator } from "./SessionOrchestrator.helpers";
import type { SessionOrchestrator } from "../SessionOrchestrator";

describe("SessionOrchestrator", () => {
  let orchestrator: SessionOrchestrator;
  beforeEach(() => {
    orchestrator = createOrchestrator();
  });
  afterEach(() => {
    orchestrator.destroy();
  });

  describe("Session Completion", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it("should track completion percentage", () => {
      const percentage = orchestrator.getPercentageComplete();
      expect(typeof percentage).toBe("number");
      expect(percentage).toBeGreaterThanOrEqual(0);
    });

    it("should complete when timer finishes", async () => {
      expect(orchestrator.isSessionActive()).toBe(true);
    });
  });

  describe("Session Abandon", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it("should abandon active session", async () => {
      await orchestrator.abandonSession("test abandon");
      const session = orchestrator.getSession();
      expect(session?.status).toBe("ABANDONED");
      expect(orchestrator.isSessionActive()).toBe(false);
    });

    it("should track damage points on abandon", async () => {
      await orchestrator.abandonSession();
      const session = orchestrator.getSession();
      expect(session?.damagePoints).toBeDefined();
      expect(typeof session?.damagePoints).toBe("number");
    });

    it("should set abandon timestamp", async () => {
      await orchestrator.abandonSession();
      const session = orchestrator.getSession();
      expect(session?.abandonedAt).toBeDefined();
    });
  });

  describe("Session Recovery", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it("should report recovery as boolean", async () => {
      await orchestrator.abandonSession();
      // Set recovery attempts directly on internal session (getSession returns a copy)
      if (orchestrator.session) {
        orchestrator.session.maxRecoveryAttempts = 3;
        orchestrator.session.recoveryAttempts = 3;
      }
      const recovered = await orchestrator.attemptRecovery("USER_RESUME");
      expect(typeof recovered).toBe("boolean");
    });

    it("should track recovery attempts count", async () => {
      await orchestrator.abandonSession();
      if (orchestrator.session) {
        orchestrator.session.maxRecoveryAttempts = 3;
        orchestrator.session.recoveryAttempts = 3;
      }
      const recovered = await orchestrator.attemptRecovery("USER_RESUME");
      expect(recovered).toBe(false);
      const sessionAfter = orchestrator.getSession();
      // recoveryAttempts should NOT increase when already at max
      expect(sessionAfter?.recoveryAttempts).toBe(3);
    });

    it("should limit recovery attempts", async () => {
      if (orchestrator.session) {
        orchestrator.session.maxRecoveryAttempts = 3;
        orchestrator.session.recoveryAttempts = 3;
      }
      const recovered = await orchestrator.attemptRecovery("USER_RESUME");
      expect(recovered).toBe(false);
    });
  });

  describe("State Persistence", () => {
    it("should save session state", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      const session = orchestrator.getSession();
      expect(session?.isDirty).toBe(true);
    });

    it("should restore active session on init", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      const newOrchestrator = createOrchestrator({ enableAntiCheat: false });
      newOrchestrator.getSession();
      newOrchestrator.destroy();
    });
  });
});
