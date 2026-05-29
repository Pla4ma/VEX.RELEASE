import { SessionPersistence, mockSession } from "./persistence.helpers";

describe("SessionPersistence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("persist", () => {
    it("should persist valid session state", () => {
      expect(() => SessionPersistence.persist(mockSession)).not.toThrow();
    });

    it("should throw for invalid session state", () => {
      const invalidSession = { ...mockSession, sessionId: "invalid-uuid" };
      expect(() =>
        SessionPersistence.persist(invalidSession as typeof mockSession),
      ).toThrow();
    });

    it("should create backup on persist", () => {
      SessionPersistence.persist(mockSession);
    });

    it("should track analytics event on persist", () => {
      const realEvents = jest.requireActual("../../events") as {
        eventBus: { publish: (...args: unknown[]) => void };
      };
      const publishSpy = jest.spyOn(realEvents.eventBus, "publish");
      SessionPersistence.persist(mockSession);
      expect(publishSpy).toHaveBeenCalledWith("analytics:track", {
        event: "session_persisted",
        properties: expect.any(Object),
      });
      publishSpy.mockRestore();
    });
  });

  describe("load", () => {
    it("should return null when no session exists", () => {
      const { MMKV } = require("react-native-mmkv");
      const mockStorage = new MMKV();
      mockStorage.getString.mockReset();
      mockStorage.getAllKeys.mockReturnValue([]);
      const result = SessionPersistence.load();
      expect(result).toBeNull();
    });

    it("should load valid persisted session", () => {
      const { MMKV } = require("react-native-mmkv");
      const mockStorage = new MMKV();
      mockStorage.getString.mockReturnValue(JSON.stringify(mockSession));
      const result = SessionPersistence.load();
      expect(result).not.toBeNull();
    });

    it("should recover from backup on corruption", () => {
      const { MMKV } = require("react-native-mmkv");
      const mockStorage = new MMKV();
      mockStorage.getString
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(JSON.stringify(mockSession));
      mockStorage.getAllKeys.mockReturnValue(["session:backup:123456"]);
      const result = SessionPersistence.load();
      expect(result).not.toBeNull();
    });
  });

  describe("clear", () => {
    it("should clear persisted session", () => {
      expect(() => SessionPersistence.clear()).not.toThrow();
    });
  });

  describe("hasSession", () => {
    it("should return false when no session", () => {
      const result = SessionPersistence.hasSession();
      expect(result).toBe(false);
    });
  });

  describe("session history", () => {
    it("should add entry to history", () => {
      const entry = {
        sessionId: "test-123",
        startedAt: Date.now(),
        endedAt: Date.now(),
        status: "COMPLETED" as const,
        progress: 100,
      };
      expect(() => SessionPersistence.addToHistory(entry)).not.toThrow();
    });

    it("should retrieve session history", () => {
      const history = SessionPersistence.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("recovery tracking", () => {
    it("should record recovery attempt", () => {
      const attempt = {
        timestamp: Date.now(),
        reason: "app_killed",
        success: true,
      };
      expect(() =>
        SessionPersistence.recordRecoveryAttempt(attempt),
      ).not.toThrow();
    });

    it("should calculate recovery success rate", () => {
      const rate = SessionPersistence.getRecoverySuccessRate();
      expect(typeof rate).toBe("number");
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  });
});
