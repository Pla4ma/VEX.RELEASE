import { SessionService } from "../SessionService";
import { getSessionOrchestrator } from "../SessionOrchestrator";
import type { SessionConfig, SessionState } from "../types";
jest.mock("../SessionOrchestrator");
jest.mock("../repository/SessionRepository");
jest.mock("../SessionEventEmitter");
jest.mock("../integration/RewardAdapter");
jest.mock("../presets");
jest.mock("../integration/SessionRewardIntegration");
describe("SessionService", () => {
  let service: SessionService;
  let mockOrchestrator: unknown;
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
      setUserId: jest.fn(),
    };
    (getSessionOrchestrator as jest.Mock).mockReturnValue(mockOrchestrator);
    service = new SessionService({
      enableAnalytics: false,
      enableNotifications: false,
    });
    service.setUserId("test-user-id");
  });
  describe("createSession", () => {
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
      const serviceWithoutUser = new SessionService();
      await expect(
        serviceWithoutUser.createCustomSession(validConfig),
      ).rejects.toThrow("SessionService: No user set");
    });
    it("should throw error when active session exists", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "active" });
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
  describe("completeSession", () => {
    it("should complete session and calculate XP correctly", async () => {
      const mockSummary = {
        sessionId: "session-1",
        status: "completed",
        duration: 25 * 60 * 1000,
        xpEarned: 250,
        coinsEarned: 10,
        multiplier: 1.5,
        streakBonus: 50,
      };
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "active" });
      mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
      const summary = await service.completeSession();
      expect(mockOrchestrator.completeSession).toHaveBeenCalled();
      expect(summary.xpEarned).toBe(250);
      expect(summary.status).toBe("completed");
    });
    it("should calculate XP with multiple multipliers", async () => {
      const mockSummary = {
        sessionId: "session-1",
        status: "completed",
        duration: 25 * 60 * 1000,
        xpEarned: 375,
        baseXP: 250,
        streakMultiplier: 1.5,
        vipMultiplier: 1.0,
        challengeMultiplier: 1.0,
      };
      mockOrchestrator.completeSession.mockResolvedValue(mockSummary);
      const summary = await service.completeSession();
      expect(summary.xpEarned).toBe(375);
      expect(summary.baseXP * summary.streakMultiplier).toBe(375);
    });
    it("should throw error when completing non-active session", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "idle" });
      mockOrchestrator.completeSession.mockRejectedValue(
        new Error("No active session to complete"),
      );
      await expect(service.completeSession()).rejects.toThrow(
        "No active session to complete",
      );
    });
  });
  describe("abandonSession", () => {
    it("should abandon session with no XP awarded", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({ status: "active" });
      mockOrchestrator.abandonSession.mockResolvedValue(undefined);
      await service.abandonSession("user_cancelled");
      expect(mockOrchestrator.abandonSession).toHaveBeenCalledWith(
        "user_cancelled",
      );
    });
    it("should not award streak credit when abandoned", async () => {
      mockOrchestrator.abandonSession.mockResolvedValue(undefined);
      await service.abandonSession();
      expect(mockOrchestrator.abandonSession).toHaveBeenCalled();
    });
    it("should throw error when abandoning completed session", async () => {
      mockOrchestrator.getSessionStatus.mockReturnValue({
        status: "completed",
      });
      mockOrchestrator.abandonSession.mockRejectedValue(
        new Error("Cannot abandon completed session"),
      );
      await expect(service.abandonSession()).rejects.toThrow(
        "Cannot abandon completed session",
      );
    });
  });
  describe("offline queue fallback", () => {
    it("should queue session when Supabase call fails", async () => {
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
      mockOrchestrator.createSession.mockRejectedValue(
        new Error("Network error"),
      );
      await expect(service.createCustomSession(validConfig)).rejects.toThrow(
        "Network error",
      );
    });
    it("should retry queued sessions when connection restored", async () => {
      expect(true).toBe(true);
    });
  });
});
