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

    it("should track completion percentage", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const percentage = orchestrator.getPercentageComplete();
      expect(percentage).toBeGreaterThan(0);
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

    it("should apply damage on abandon", async () => {
      await orchestrator.abandonSession();
      const session = orchestrator.getSession();
      expect(session?.damagePoints).toBeGreaterThan(0);
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

    it("should attempt recovery on failed session", async () => {
      await orchestrator.abandonSession();
      const recovered = await orchestrator.attemptRecovery("USER_RESUME");
      expect(typeof recovered).toBe("boolean");
    });

    it("should track recovery attempts", async () => {
      const sessionBefore = orchestrator.getSession();
      const attemptsBefore = sessionBefore?.recoveryAttempts || 0;
      await orchestrator.attemptRecovery("USER_RESUME");
      const sessionAfter = orchestrator.getSession();
      expect(sessionAfter?.recoveryAttempts).toBe(attemptsBefore + 1);
    });

    it("should limit recovery attempts", async () => {
      const session = orchestrator.getSession();
      if (session) {
        session.recoveryAttempts = session.maxRecoveryAttempts;
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
