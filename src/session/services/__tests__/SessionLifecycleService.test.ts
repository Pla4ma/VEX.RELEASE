import { SessionLifecycleService } from "../SessionLifecycleService";
import { getSessionRepository } from "../../repository/SessionRepository";
import { eventBus } from "../../../events";
import type { SessionState, SessionConfig } from "../../types";
jest.mock("../../repository/SessionRepository");
jest.mock("../../../events");
describe("SessionLifecycleService", () => {
  let service: SessionLifecycleService;
  let mockRepository: jest.Mocked<ReturnType<typeof getSessionRepository>>;
  let mockEventBus: jest.Mocked<typeof eventBus>;
  const createMockConfig = (): SessionConfig => ({
    duration: 1500,
    breakDuration: 300,
    longBreakDuration: 900,
    intervals: 4,
    longBreakInterval: 4,
    soundEnabled: false,
    vibrationEnabled: false,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  });
  const createMockSession = (
    overrides: Partial<SessionState> = {},
  ): SessionState => ({
    id: "test-session-123",
    userId: "test-user",
    status: "PREPARING",
    phase: "PREPARATION",
    config: createMockConfig(),
    currentInterval: 1,
    totalIntervals: 4,
    totalDuration: 1500,
    elapsedTime: 0,
    remainingTime: 1500,
    effectiveTime: 0,
    pausedTime: 0,
    completionPercentage: 0,
    interruptions: 0,
    pauses: 0,
    intervalsCompleted: 0,
    backgroundTime: 0,
    baseScore: 0,
    timeBonus: 0,
    streakBonus: 0,
    focusQuality: 100,
    damagePoints: 0,
    penaltyMultiplier: 1,
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    deviceId: "test-device",
    appVersion: "1.0.0",
    osVersion: "ios-16",
    antiCheatStatus: "CLEAN",
    antiCheatFlags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDirty: true,
    conflictStatus: "NONE",
    storageStatus: "HEALTHY",
    totalBackgroundTime: 0,
    totalPausedTime: 0,
    canRecover: false,
    ...overrides,
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      saveActiveSession: jest.fn().mockResolvedValue(undefined),
      getActiveSession: jest.fn().mockResolvedValue(null),
      clearActiveSession: jest.fn().mockResolvedValue(undefined),
      setUserId: jest.fn(),
    } as any;
    (getSessionRepository as jest.Mock).mockReturnValue(mockRepository);
    mockEventBus = { publish: jest.fn(), subscribe: jest.fn() } as any;
    (eventBus.publish as jest.Mock) = mockEventBus.publish;
    service = new SessionLifecycleService({
      autoSaveOnTransition: true,
      emitEvents: true,
      validateOnTransition: true,
      maxPausesAllowed: 100,
      maxInterruptionsAllowed: 50,
    });
  });
  describe("createSession", () => {
    it("should create session with valid config", async () => {
      const config = createMockConfig();
      const result = await service.createSession("user-123", config, {
        source: "test",
      });
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session?.status).toBe("PREPARING");
      expect(result.session?.config.duration).toBe(1500);
      expect(mockRepository.saveActiveSession).toHaveBeenCalled();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:created",
        expect.any(Object),
      );
    });
    it("should fail with invalid duration", async () => {
      const config = { ...createMockConfig(), duration: 30 };
      const result = await service.createSession("user-123", config);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation");
    });
    it("should fail with duration exceeding max", async () => {
      const config = { ...createMockConfig(), duration: 90000 };
      const result = await service.createSession("user-123", config);
      expect(result.success).toBe(false);
    });
    it("should handle repository save failure", async () => {
      mockRepository.saveActiveSession.mockRejectedValue(
        new Error("Storage full"),
      );
      const config = createMockConfig();
      await expect(service.createSession("user-123", config)).rejects.toThrow(
        "Storage full",
      );
    });
    it("should generate unique session IDs", async () => {
      const config = createMockConfig();
      const result1 = await service.createSession("user-123", config);
      const result2 = await service.createSession("user-123", config);
      expect(result1.session?.id).not.toBe(result2.session?.id);
    });
    it("should include metadata in created session", async () => {
      const config = createMockConfig();
      const metadata = { goal: "Complete project", tags: ["focus", "work"] };
      const result = await service.createSession("user-123", config, metadata);
      expect(result.session?.metadata).toEqual(metadata);
    });
  });
  describe("startSession", () => {
    it("should transition from PREPARING to ACTIVE", async () => {
      const session = createMockSession({ status: "PREPARING" });
      const result = await service.startSession(session);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("ACTIVE");
      expect(result.session.phase).toBe("FOCUS");
      expect(result.session.startedAt).toBeDefined();
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:started",
        expect.any(Object),
      );
    });
    it("should fail to start from invalid states", async () => {
      const invalidStates: Array<SessionState["status"]> = [
        "ACTIVE",
        "COMPLETED",
        "ABANDONED",
      ];
      for (const status of invalidStates) {
        const session = createMockSession({ status });
        const result = await service.startSession(session);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Cannot start");
      }
    });
    it("should emit correct event payload", async () => {
      const session = createMockSession({
        status: "PREPARING",
        id: "test-123",
      });
      await service.startSession(session);
      const eventCall = (mockEventBus.publish as jest.Mock).mock.calls.find(
        (call) => call[0] === "session:started",
      );
      expect(eventCall).toBeDefined();
      expect(eventCall[1]).toMatchObject({
        sessionId: "test-123",
        phase: "FOCUS",
      });
    });
  });
  describe("pauseSession", () => {
    it("should pause active session", async () => {
      const session = createMockSession({ status: "ACTIVE", pauses: 0 });
      const result = await service.pauseSession(session, "User requested");
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("PAUSED");
      expect(result.session.pauses).toBe(1);
      expect(result.session.lastPauseReason).toBe("User requested");
    });
    it("should enforce max pause limit", async () => {
      const session = createMockSession({ status: "ACTIVE", pauses: 100 });
      const result = await service.pauseSession(session);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Maximum pauses");
    });
    it("should not pause already paused session", async () => {
      const session = createMockSession({ status: "PAUSED" });
      const result = await service.pauseSession(session);
      expect(result.success).toBe(false);
    });
    it("should track pause start time", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const beforePause = Date.now();
      await service.pauseSession(session);
      expect(session.pauseStartTime).toBeGreaterThanOrEqual(beforePause);
    });
  });
  describe("resumeSession", () => {
    it("should resume paused session", async () => {
      const pauseStart = Date.now() - 5000;
      const session = createMockSession({
        status: "PAUSED",
        pauseStartTime: pauseStart,
        totalPausedTime: 0,
      });
      const result = await service.resumeSession(session);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("ACTIVE");
      expect(result.session.totalPausedTime).toBeGreaterThan(0);
    });
    it("should calculate correct paused duration", async () => {
      const pauseDuration = 10;
      const pauseStart = Date.now() - pauseDuration * 1000;
      const session = createMockSession({
        status: "PAUSED",
        pauseStartTime: pauseStart,
        totalPausedTime: 0,
      });
      await service.resumeSession(session);
      expect(session.totalPausedTime).toBeGreaterThanOrEqual(9);
      expect(session.totalPausedTime).toBeLessThanOrEqual(12);
    });
    it("should clear pauseStartTime on resume", async () => {
      const session = createMockSession({
        status: "PAUSED",
        pauseStartTime: Date.now(),
      });
      await service.resumeSession(session);
      expect(session.pauseStartTime).toBeUndefined();
    });
  });
  describe("completeSession", () => {
    it("should complete active session", async () => {
      const session = createMockSession({
        status: "ACTIVE",
        elapsedTime: 1500,
      });
      const result = await service.completeSession(session);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("COMPLETED");
      expect(result.session.completionPercentage).toBe(100);
      expect(result.session.endTime).toBeDefined();
    });
    it("should emit completion event with summary", async () => {
      const session = createMockSession({
        status: "ACTIVE",
        id: "complete-test",
      });
      await service.completeSession(session);
      const eventCall = (mockEventBus.publish as jest.Mock).mock.calls.find(
        (call) => call[0] === "session:completed",
      );
      expect(eventCall[1]).toHaveProperty("summary");
      expect(eventCall[1].sessionId).toBe("complete-test");
    });
    it("should not complete from invalid states", async () => {
      const session = createMockSession({ status: "PREPARING" });
      const result = await service.completeSession(session);
      expect(result.success).toBe(false);
    });
  });
  describe("abandonSession", () => {
    it("should abandon session with reason", async () => {
      const session = createMockSession({ status: "ACTIVE", elapsedTime: 500 });
      const result = await service.abandonSession(session, "Emergency");
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("ABANDONED");
      expect(result.session.abandonReason).toBe("Emergency");
      expect(result.session.abandonedAt).toBeDefined();
    });
    it("should preserve elapsed time on abandon", async () => {
      const session = createMockSession({ status: "ACTIVE", elapsedTime: 750 });
      await service.abandonSession(session, "Test");
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:abandoned",
        expect.objectContaining({ elapsedTime: 750 }),
      );
    });
  });
  describe("failSession", () => {
    it("should fail session with error", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const result = await service.failSession(
        session,
        "Timer malfunction",
        true,
      );
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("FAILED");
      expect(result.session.error).toBe("Timer malfunction");
      expect(result.session.canRecover).toBe(true);
    });
    it("should mark as non-recoverable when specified", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      await service.failSession(session, "Fatal error", false);
      expect(session.canRecover).toBe(false);
    });
    it("should fail from any non-terminal state", async () => {
      const states: Array<SessionState["status"]> = [
        "PREPARING",
        "ACTIVE",
        "PAUSED",
        "BACKGROUNDED",
      ];
      for (const status of states) {
        const session = createMockSession({ status });
        const result = await service.failSession(session, "Test error");
        expect(result.success).toBe(true);
        expect(result.session.status).toBe("FAILED");
      }
    });
  });
  describe("backgroundSession", () => {
    it("should background active session", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const result = await service.backgroundSession(session);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("BACKGROUNDED");
      expect(result.session.backgroundedAt).toBeDefined();
    });
    it("should fail to background non-active session", async () => {
      const session = createMockSession({ status: "PAUSED" });
      const result = await service.backgroundSession(session);
      expect(result.success).toBe(false);
      expect(result.error).toContain("only background active");
    });
  });
  describe("foregroundSession", () => {
    it("should foreground backgrounded session", async () => {
      const backgroundTime = Date.now() - 10000;
      const session = createMockSession({
        status: "BACKGROUNDED",
        backgroundedAt: backgroundTime,
        totalBackgroundTime: 0,
      });
      const result = await service.foregroundSession(session);
      expect(result.success).toBe(true);
      expect(result.session.status).toBe("ACTIVE");
      expect(result.session.totalBackgroundTime).toBeGreaterThanOrEqual(9);
    });
    it("should clear backgroundedAt on foreground", async () => {
      const session = createMockSession({
        status: "BACKGROUNDED",
        backgroundedAt: Date.now(),
      });
      await service.foregroundSession(session);
      expect(session.backgroundedAt).toBeUndefined();
    });
    it("should fail if session not backgrounded", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const result = await service.foregroundSession(session);
      expect(result.success).toBe(false);
    });
  });
  describe("concurrency handling", () => {
    it("should handle rapid state transitions", async () => {
      const session = createMockSession({ status: "PREPARING" });
      await service.startSession(session);
      await service.pauseSession(session, "1");
      await service.resumeSession(session);
      await service.pauseSession(session, "2");
      await service.resumeSession(session);
      expect(session.status).toBe("ACTIVE");
      expect(session.pauses).toBe(2);
    });
    it("should handle concurrent operations gracefully", async () => {
      const session = createMockSession({ status: "PREPARING" });
      const promises = [
        service.startSession(session),
        service.startSession(session),
      ];
      const results = await Promise.all(promises);
      const successes = results.filter((r) => r.success).length;
      expect(successes).toBe(1);
    });
    it("should maintain consistent state during repository failures", async () => {
      mockRepository.saveActiveSession
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Network error"));
      const session = createMockSession({ status: "PREPARING" });
      await service.startSession(session);
      expect(session.status).toBe("ACTIVE");
    });
  });
  describe("edge cases", () => {
    it("should handle session with zero duration", async () => {
      const config = { ...createMockConfig(), duration: 0 };
      const result = await service.createSession("user", config);
      expect(result.success).toBe(false);
    });
    it("should handle extremely long sessions", async () => {
      const config = { ...createMockConfig(), duration: 28800 };
      const result = await service.createSession("user", config);
      expect(result.success).toBe(true);
    });
    it("should handle special characters in abandon reason", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const reason = 'Test <script>alert("xss")</script> & more';
      const result = await service.abandonSession(session, reason);
      expect(result.success).toBe(true);
      expect(session.abandonReason).toBe(reason);
    });
    it("should handle empty reason for abandon", async () => {
      const session = createMockSession({ status: "ACTIVE" });
      const result = await service.abandonSession(session, "");
      expect(result.success).toBe(true);
      expect(session.abandonReason).toBe("");
    });
    it("should handle null metadata", async () => {
      const config = createMockConfig();
      const result = await service.createSession("user", config, undefined);
      expect(result.success).toBe(true);
    });
  });
  describe("full session lifecycle", () => {
    it("should complete full successful session flow", async () => {
      const createResult = await service.createSession(
        "user",
        createMockConfig(),
      );
      expect(createResult.success).toBe(true);
      const session = createResult.session!;
      const startResult = await service.startSession(session);
      expect(startResult.success).toBe(true);
      await service.pauseSession(session, "Break");
      await service.resumeSession(session);
      await service.backgroundSession(session);
      await service.foregroundSession(session);
      const completeResult = await service.completeSession(session);
      expect(completeResult.success).toBe(true);
      expect(completeResult.session.status).toBe("COMPLETED");
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:created",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:started",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:paused",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:resumed",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:backgrounded",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:foregrounded",
        expect.any(Object),
      );
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:completed",
        expect.any(Object),
      );
    });
    it("should handle abandoned session flow", async () => {
      const createResult = await service.createSession(
        "user",
        createMockConfig(),
      );
      const session = createResult.session!;
      await service.startSession(session);
      await service.pauseSession(session, "Interruption");
      const abandonResult = await service.abandonSession(
        session,
        "Too difficult",
      );
      expect(abandonResult.success).toBe(true);
      expect(abandonResult.session.status).toBe("ABANDONED");
    });
    it("should handle failed session flow", async () => {
      const createResult = await service.createSession(
        "user",
        createMockConfig(),
      );
      const session = createResult.session!;
      await service.startSession(session);
      const failResult = await service.failSession(
        session,
        "System crash",
        true,
      );
      expect(failResult.success).toBe(true);
      expect(failResult.session.status).toBe("FAILED");
      expect(failResult.session.canRecover).toBe(true);
    });
  });
});
