// Deep Session-Start Tests – session-start events
// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
jest.mock("../../boss/repository", () => ({
  fetchBossTemplate: jest.fn(() => Promise.resolve(null)),
  fetchActiveEncounter: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("../../challenges/repository", () => ({
  fetchActiveChallengeDetails: jest.fn(() => Promise.resolve([])),
}));
jest.mock("../../streaks/repository", () => ({
  fetchStreak: jest.fn(() => Promise.resolve(null)),
}));
jest.mock("../../../session/modes", () => {
  const { z } = require("zod");
  return {
    SessionMode: {
      STUDY: "STUDY",
      SPRINT: "SPRINT",
      CREATIVE: "CREATIVE",
      LIGHT_FOCUS: "LIGHT_FOCUS",
      RECOVERY: "RECOVERY",
    },
    SessionModeSchema: z.enum(["STUDY", "SPRINT", "CREATIVE", "LIGHT_FOCUS", "RECOVERY"]),
  };
});
jest.mock("../../lane-engine/schemas", () => {
  const { z } = require("zod");
  return {
    LaneSchema: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]),
  };
});

// ── Imports ────────────────────────────────────────────────────────────────
import {
  createSessionInitiatedEvent,
  createSessionPreparationStartedEvent,
  createSessionReadinessAssessedEvent,
  createSessionGoalsSetEvent,
  createSessionMoodAssessedEvent,
  createSessionContextEstablishedEvent,
  serializeSessionStartEvent,
  deserializeSessionStartEvent,
} from "../events";

// ============================================================================

describe("session-start events", () => {
  describe("createSessionInitiatedEvent", () => {
    it("creates event with correct type and data", () => {
      const event = createSessionInitiatedEvent(
        "u1",
        "s1",
        "user_initiated",
        "button_tap",
        "focus",
        { source: "home" },
      );
      expect(event.type).toBe("session_initiated");
      expect(event.userId).toBe("u1");
      expect(event.sessionId).toBe("s1");
      expect(event.data.initiationType).toBe("user_initiated");
      expect(event.id).toBeTruthy();
    });
  });

  describe("createSessionReadinessAssessedEvent", () => {
    it("creates event with readiness data", () => {
      const event = createSessionReadinessAssessedEvent(
        "u1",
        "s1",
        "initial",
        85,
        "high",
        [],
        [],
        [],
      );
      expect(event.type).toBe("session_readiness_assessed");
      expect(event.data.readinessScore).toBe(85);
    });
  });

  describe("createSessionGoalsSetEvent", () => {
    it("creates event with goal data", () => {
      const event = createSessionGoalsSetEvent(
        "u1",
        "s1",
        "task",
        [],
        {},
        {},
      );
      expect(event.type).toBe("session_goals_set");
    });
  });

  describe("createSessionMoodAssessedEvent", () => {
    it("creates event with mood data", () => {
      const event = createSessionMoodAssessedEvent(
        "u1",
        "s1",
        "initial",
        {},
        "neutral",
        [],
        [],
      );
      expect(event.type).toBe("session_mood_assessed");
    });
  });

  describe("createSessionContextEstablishedEvent", () => {
    it("creates event with context data", () => {
      const event = createSessionContextEstablishedEvent(
        "u1",
        "s1",
        "environment",
        {},
        [],
      );
      expect(event.type).toBe("session_context_established");
    });
  });

  describe("createSessionPreparationStartedEvent", () => {
    it("creates event with preparation data", () => {
      const event = createSessionPreparationStartedEvent(
        "u1",
        "s1",
        "full",
        ["check_env"],
        {},
        {},
      );
      expect(event.type).toBe("session_preparation_started");
    });
  });

  describe("serialize/deserialize", () => {
    it("round-trips an event through serialize and deserialize", () => {
      const event = createSessionInitiatedEvent(
        "u1",
        "s1",
        "user_initiated",
        "button_tap",
        "focus",
        { source: "home" },
      );
      const serialized = serializeSessionStartEvent(event);
      const deserialized = deserializeSessionStartEvent(serialized);
      expect(deserialized.type).toBe("session_initiated");
      expect(deserialized.userId).toBe("u1");
    });
  });
});
