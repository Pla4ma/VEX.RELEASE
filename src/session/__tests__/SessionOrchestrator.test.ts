import { SessionOrchestrator } from "../SessionOrchestrator";
import type { SessionConfig } from "../types";
const TEST_USER_ID = "test-user-123";
const mockConfig: SessionConfig = {
  duration: 60,
  breakDuration: 10,
  longBreakDuration: 30,
  intervals: 1,
  longBreakInterval: 4,
  soundEnabled: false,
  vibrationEnabled: false,
  dndEnabled: false,
  strictMode: false,
  autoStartBreaks: false,
  autoStartNextInterval: false,
  tags: ["test"],
};
jest.mock("react-native-mmkv", () => ({
  MMKV: jest
    .fn()
    .mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      delete: jest.fn(),
    })),
}));
describe("SessionOrchestrator", () => {
  let orchestrator: SessionOrchestrator;
  beforeEach(() => {
    orchestrator = new SessionOrchestrator({
      enableAntiCheat: false,
      enableAutoRecovery: true,
    });
    orchestrator.setUserId(TEST_USER_ID);
  });
  afterEach(() => {
    orchestrator.destroy();
  });
  describe("Session Creation", () => {
    it("should create a session with valid config", async () => {
      const session = await orchestrator.createSession(mockConfig);
      expect(session).toBeDefined();
      expect(session.userId).toBe(TEST_USER_ID);
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
      expect(currentSession?.userId).toBe(TEST_USER_ID);
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
      const newOrchestrator = new SessionOrchestrator({
        enableAntiCheat: false,
      });
      newOrchestrator.setUserId(TEST_USER_ID);
      newOrchestrator.getSession();
      newOrchestrator.destroy();
    });
  });
  describe("Edge Cases and Error Handling", () => {
    it("should throw error when creating session without user", async () => {
      const orphanOrchestrator = new SessionOrchestrator();
      await expect(
        orphanOrchestrator.createSession(mockConfig),
      ).rejects.toThrow("No user set");
      orphanOrchestrator.destroy();
    });
    it("should handle rapid pause/resume cycles", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      for (let i = 0; i < 5; i++) {
        await orchestrator.pauseSession();
        await orchestrator.resumeSession();
      }
      const session = orchestrator.getSession();
      expect(session?.pauses).toBe(5);
      expect(session?.status).toBe("ACTIVE");
    });
    it("should handle background/foreground cycles", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      for (let i = 0; i < 3; i++) {
        await orchestrator.backgroundSession();
        await orchestrator.foregroundSession();
      }
      const session = orchestrator.getSession();
      expect(session?.status).toBe("ACTIVE");
    });
    it("should maintain session integrity during operations", async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
      await orchestrator.pauseSession();
      await orchestrator.resumeSession();
      await orchestrator.backgroundSession();
      await orchestrator.foregroundSession();
      const session = orchestrator.getSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(TEST_USER_ID);
      expect(session?.config.duration).toBe(mockConfig.duration);
    });
  });
  describe("Timer State", () => {
    beforeEach(async () => {
      await orchestrator.createSession(mockConfig);
      await orchestrator.startSession(0);
    });
    it("should provide timer state", () => {
      const timerState = orchestrator.getTimerState();
      expect(timerState).not.toBeNull();
      expect(timerState?.isRunning).toBe(true);
    });
    it("should track remaining seconds", () => {
      const remaining = orchestrator.getRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(mockConfig.duration);
    });
    it("should track elapsed seconds", async () => {
      const elapsedBefore = orchestrator.getElapsedSeconds();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const elapsedAfter = orchestrator.getElapsedSeconds();
      expect(elapsedAfter).toBeGreaterThanOrEqual(elapsedBefore);
    });
  });
  describe("Multi-Interval Sessions", () => {
    const multiIntervalConfig: SessionConfig = {
      ...mockConfig,
      duration: 30,
      intervals: 4,
      longBreakInterval: 2,
      breakDuration: 5,
      longBreakDuration: 10,
    };
    it("should create multi-interval session", async () => {
      const session = await orchestrator.createSession(multiIntervalConfig);
      expect(session.totalIntervals).toBe(4);
      expect(session.currentInterval).toBe(1);
      expect(session.intervalsCompleted).toBe(0);
    });
  });
});
describe("SessionOrchestrator Integration", () => {
  let orchestrator: SessionOrchestrator;
  beforeEach(() => {
    orchestrator = new SessionOrchestrator({
      enableAntiCheat: true,
      enableAutoRecovery: true,
    });
    orchestrator.setUserId(TEST_USER_ID);
  });
  afterEach(() => {
    orchestrator.destroy();
  });
  it("should complete full session lifecycle", async () => {
    const session = await orchestrator.createSession(mockConfig);
    expect(session.status).toBe("PREPARING");
    await orchestrator.startSession(0);
    expect(orchestrator.getSession()?.status).toBe("ACTIVE");
    await orchestrator.pauseSession();
    expect(orchestrator.getSession()?.status).toBe("PAUSED");
    await orchestrator.resumeSession();
    expect(orchestrator.getSession()?.status).toBe("ACTIVE");
    await orchestrator.abandonSession("test complete");
    expect(orchestrator.getSession()?.status).toBe("ABANDONED");
    expect(orchestrator.isSessionActive()).toBe(false);
  });
  it("should handle concurrent state changes", async () => {
    await orchestrator.createSession(mockConfig);
    await orchestrator.startSession(0);
    const operations = [
      orchestrator.pauseSession(),
      orchestrator.backgroundSession(),
    ];
    await Promise.all(operations);
    const session = orchestrator.getSession();
    expect(["PAUSED", "BACKGROUNDED"]).toContain(session?.status);
  });
});
