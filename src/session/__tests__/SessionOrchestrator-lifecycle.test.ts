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

  describe("Session Creation", () => {
    it("should create a session with valid config", async () => {
      const session = await orchestrator.createSession(mockConfig);
      expect(session).toBeDefined();
      expect(session.userId).toBe("test-user-123");
      expect(session.status).toBe("PREPARING");
      expect(session.config.duration).toBe(mockConfig.duration);
    });

    it("should generate unique session IDs", async () => {
      const session1 = await orchestrator.createSession(mockConfig);
      const session2 = await orchestrator.createSession(mockConfig);
      expect(session1.id).not.toBe(session2.id);
    });

    it("should initialize with correct timing values", async () => {
      const session = await orchestrator.createSession(mockConfig);
      expect(session.remainingTime).toBe(mockConfig.duration * 1000);
      expect(session.totalDuration).toBe(mockConfig.duration * 1000);
      expect(session.elapsedTime).toBe(0);
      expect(session.pausedTime).toBe(0);
    });

    it("should track session in state", async () => {
      await orchestrator.createSession(mockConfig);
      const currentSession = orchestrator.getSession();
      expect(currentSession).not.toBeNull();
      expect(currentSession?.userId).toBe("test-user-123");
    });
  });

  describe("Session Start", () => {
    it("should start session after countdown", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      const session = orchestrator.getSession();
      expect(session?.status).toBe("ACTIVE");
      expect(session?.startedAt).toBeDefined();
    });

    it("should initialize timer on start", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      const timerState = orchestrator.getTimerState();
      expect(timerState).not.toBeNull();
      expect(timerState?.isRunning).toBe(true);
    });

    it("should set session phase to FOCUS on start", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      const session = orchestrator.getSession();
      expect(session?.phase).toBe("FOCUS");
    });
  });

  describe("Pause and Resume", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it("should pause active session", async () => {
      await orchestrator.pauseSession("test pause");
      const session = orchestrator.getSession();
      expect(session?.status).toBe("PAUSED");
      expect(session?.pausedAt).toBeDefined();
    });

    it("should track pause count", async () => {
      await orchestrator.pauseSession();
      await orchestrator.resumeSession();
      await orchestrator.pauseSession();
      const session = orchestrator.getSession();
      expect(session?.pauses).toBe(2);
    });

    it("should resume paused session", async () => {
      await orchestrator.pauseSession();
      await orchestrator.resumeSession();
      const session = orchestrator.getSession();
      expect(session?.status).toBe("ACTIVE");
      expect(session?.resumedAt).toBeDefined();
    });

    it("should track paused time", async () => {
      await orchestrator.pauseSession();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await orchestrator.resumeSession();
      const session = orchestrator.getSession();
      expect(session?.pausedTime).toBeGreaterThan(0);
    });

    it("should not pause already paused session", async () => {
      await orchestrator.pauseSession();
      const pausedAt = orchestrator.getSession()?.pausedAt;
      await orchestrator.pauseSession();
      expect(orchestrator.getSession()?.pausedAt).toBe(pausedAt);
    });
  });

  describe("Background and Foreground", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });

    it("should handle backgrounding", async () => {
      await orchestrator.backgroundSession();
      const session = orchestrator.getSession();
      expect(session?.status).toBe("BACKGROUNDED");
    });

    it("should handle foregrounding", async () => {
      await orchestrator.backgroundSession();
      await orchestrator.foregroundSession();
      const session = orchestrator.getSession();
      expect(session?.backgroundTime).toBeGreaterThanOrEqual(0);
    });

    it("should track background time", async () => {
      await orchestrator.backgroundSession();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await orchestrator.foregroundSession();
      const session = orchestrator.getSession();
      expect(session?.backgroundTime).toBeGreaterThanOrEqual(100);
    });
  });
});
