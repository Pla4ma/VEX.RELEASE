import {
  createService,
  getSessionOrchestrator,
  type SessionConfig,
  type SessionState,
} from "./SessionService.helpers";

describe("SessionService", () => {
  let service: ReturnType<typeof createService>;
  let mockOrchestrator: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOrchestrator = {
      createSession: jest.fn(),
      startSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      abandonSession: jest.fn(),
      completeSession: jest.fn(),
      getSessionStatus: jest.fn(),
      isSessionActive: jest.fn().mockReturnValue(false),
      setUserId: jest.fn(),
      backgroundSession: jest.fn(),
      foregroundSession: jest.fn(),
      applyStudyQuizBonus: jest.fn(),
      attemptRecovery: jest.fn(),
      destroy: jest.fn(),
    };
    (getSessionOrchestrator as jest.Mock).mockReturnValue(mockOrchestrator);
    service = createService();
    service.setUserId("test-user-id");
  });

  const validConfig: SessionConfig = {
    duration: 25 * 60 * 1000,
    breakDuration: 5 * 60 * 1000,
    longBreakDuration: 15 * 60 * 1000,
    intervals: 4,
    longBreakInterval: 4,
    soundEnabled: true,
    vibrationEnabled: true,
    dndEnabled: false,
    strictMode: false,
    autoStartBreaks: false,
    autoStartNextInterval: false,
    category: "focus",
    tags: ["work"],
  };

  describe("createSession", () => {
    it("should create session with valid config", async () => {
      const mockSession: SessionState = {
        id: "session-1",
        status: "created",
        config: validConfig,
        progress: {
          elapsed: 0,
          remaining: validConfig.duration,
          percentage: 0,
        },
        createdAt: Date.now(),
      };
      mockOrchestrator.createSession.mockResolvedValue(mockSession);
      const session = await service.createCustomSession(validConfig);
      expect(mockOrchestrator.createSession).toHaveBeenCalledWith(validConfig);
      expect(session).toEqual(mockSession);
    });

    it("should throw error when no user is set", async () => {
      const serviceWithoutUser =
        new (require("./SessionService.helpers").SessionService)();
      await expect(
        serviceWithoutUser.createCustomSession(validConfig),
      ).rejects.toThrow("SessionService: No user set");
    });

    it("should throw error when active session exists", async () => {
      mockOrchestrator.isSessionActive.mockReturnValue(true);
      // Access the mocked repository to make getActiveSession return a session
      const { getSessionRepository } = require("../repository/SessionRepository");
      const repo = getSessionRepository();
      repo.getActiveSession.mockResolvedValue({ id: "existing-session" });
      await expect(service.createCustomSession(validConfig)).rejects.toThrow(
        "Cannot create new session: one is already active",
      );
    });

    it("should throw error for invalid duration (zero)", async () => {
      const invalidConfig = { ...validConfig, duration: 0 };
      await expect(
        service.createCustomSession(invalidConfig),
      ).rejects.toThrow();
    });

    it("should throw error for invalid duration (negative)", async () => {
      const invalidConfig = { ...validConfig, duration: -1000 };
      await expect(
        service.createCustomSession(invalidConfig),
      ).rejects.toThrow();
    });
  });

  describe("pauseSession", () => {
    it("should pause active session", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "active" });
      mockOrchestrator.pauseSession.mockResolvedValue(undefined);
      await service.pauseSession("user_request");
      expect(mockOrchestrator.pauseSession).toHaveBeenCalledWith(
        "user_request",
      );
    });

    it("should throw error when pausing already paused session", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "paused" });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error("Session already paused"),
      );
      await expect(service.pauseSession()).rejects.toThrow(
        "Session already paused",
      );
    });

    it("should throw error when pausing in strict mode", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({
        status: "active",
        isStrictMode: true,
      });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error("Cannot pause in strict mode"),
      );
      await expect(service.pauseSession()).rejects.toThrow(
        "Cannot pause in strict mode",
      );
    });

    it("should throw error when no active session", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "idle" });
      mockOrchestrator.pauseSession.mockRejectedValue(
        new Error("No active session"),
      );
      await expect(service.pauseSession()).rejects.toThrow("No active session");
    });
  });
});
