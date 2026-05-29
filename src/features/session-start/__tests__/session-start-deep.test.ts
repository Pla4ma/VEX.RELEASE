/**
 * Deep Session-Start Tests
 * Covers: event-validators, session-brief-schemas, difficulty-schemas,
 * navigation-schemas, events (create/serialize/deserialize), analytics (mocked),
 * stake-service (mocked), setup-helpers edge cases, hero-builder edge cases.
 */

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

// Event validators
import { validateSessionStartEvent } from "../event-validators";

// Schemas
import {
  SessionStakeSchema,
  LaneSessionBriefSchema,
} from "../session-brief-schemas";

import {
  SessionSetupNavigationParamsSchema,
  SessionStartSummarySchema,
  SessionStartHeroSchema,
  FocusModeCardSchema,
  SESSION_SETUP_SOURCE_ONBOARDING,
} from "../navigation-schemas";

import {
  SessionDifficultySchema,
  DifficultySuggestionStatsSchema,
  DifficultySuggestionSchema,
  DifficultyPreferenceSchema,
} from "../difficulty-schemas";

// Events
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

// Service
import {
  parseSessionSetupParams,
  buildSessionStartSummary,
  getOfflineSessionStartMessage,
  shouldOpenCustomizationByDefault,
  shouldAutoApplySmartSuggestion,
  createStarterSessionConfig,
} from "../setup-helpers";

import { buildSessionStartHero } from "../hero-builder";
import { buildLaneSessionBrief, buildFocusModeCards } from "../lane-builder";

import {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
  getDifficultyDisplayName,
  getDifficultyXPMultiplier,
} from "../service/adaptiveDifficulty";

// Analytics
import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
  trackDifficultyChanged,
  trackInsufficientSessionsForSuggestion,
} from "../analytics";

// ============================================================================
// event-validators
// ============================================================================

describe("event-validators", () => {
  const baseEvent = {
    id: "evt-1",
    userId: "user-1",
    sessionId: "sess-1",
    timestamp: new Date(),
    metadata: { source: "test", version: "1.0.0", platform: "test" },
  };

  describe("validateSessionStartEvent", () => {
    it("rejects event missing id", () => {
      const event = {
        ...baseEvent,
        id: "",
        type: "session_initiated" as const,
        data: {},
      };
      expect(validateSessionStartEvent(event as any)).toBe(false);
    });

    it("rejects event missing userId", () => {
      const event = {
        ...baseEvent,
        userId: "",
        type: "session_initiated" as const,
        data: {},
      };
      expect(validateSessionStartEvent(event as any)).toBe(false);
    });

    it("rejects event missing data", () => {
      const event = {
        ...baseEvent,
        type: "session_initiated" as const,
        data: null,
      };
      expect(validateSessionStartEvent(event as any)).toBe(false);
    });

    it("validates session_initiated with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_initiated" as const,
        data: {
          initiationType: "user_initiated" as const,
          initiatedAt: new Date(),
          trigger: "button_tap" as const,
          intent: "focus" as const,
          context: { source: "home" },
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("validates session_preparation_started with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_preparation_started" as const,
        data: {
          preparationType: "full" as const,
          preparationSteps: ["check_env"],
          environment: { noise: "quiet" },
          user: { mood: "focused" },
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("validates session_readiness_assessed with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_readiness_assessed" as const,
        data: {
          assessmentType: "initial" as const,
          readinessScore: 85,
          readinessLevel: "high" as const,
          factors: [],
          trends: [],
          recommendations: [],
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("validates session_goals_set with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_goals_set" as const,
        data: {
          goalType: "task" as const,
          goals: [],
          alignment: {},
          planning: {},
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("validates session_mood_assessed with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_mood_assessed" as const,
        data: {
          assessmentType: "initial" as const,
          moodProfile: {},
          moodState: "neutral" as const,
          influences: [],
          recommendations: [],
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("validates session_context_established with complete data", () => {
      const event = {
        ...baseEvent,
        type: "session_context_established" as const,
        data: {
          contextType: "environment" as const,
          contextData: {},
          adaptations: [],
        },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });

    it("returns true for unknown event types (default case)", () => {
      const event = {
        ...baseEvent,
        type: "unknown_event" as any,
        data: { anything: true },
      };
      expect(validateSessionStartEvent(event as any)).toBe(true);
    });
  });
});

// ============================================================================
// difficulty-schemas
// ============================================================================

describe("difficulty-schemas", () => {
  describe("SessionDifficultySchema", () => {
    it("accepts CASUAL", () => {
      expect(SessionDifficultySchema.parse("CASUAL")).toBe("CASUAL");
    });

    it("accepts FOCUSED", () => {
      expect(SessionDifficultySchema.parse("FOCUSED")).toBe("FOCUSED");
    });

    it("accepts INTENSE", () => {
      expect(SessionDifficultySchema.parse("INTENSE")).toBe("INTENSE");
    });

    it("rejects invalid value", () => {
      expect(() => SessionDifficultySchema.parse("EASY")).toThrow();
    });
  });

  describe("DifficultySuggestionStatsSchema", () => {
    it("parses valid stats", () => {
      const result = DifficultySuggestionStatsSchema.parse({
        sessionsAnalyzed: 5,
        averageGrade: 4.0,
        averagePurity: 80,
      });
      expect(result.sessionsAnalyzed).toBe(5);
    });

    it("rejects negative sessionsAnalyzed", () => {
      expect(() =>
        DifficultySuggestionStatsSchema.parse({
          sessionsAnalyzed: -1,
          averageGrade: 4.0,
          averagePurity: 80,
        }),
      ).toThrow();
    });
  });

  describe("DifficultyPreferenceSchema", () => {
    it("parses valid preference with defaults", () => {
      const result = DifficultyPreferenceSchema.parse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        currentDifficulty: "CASUAL",
        suggestedDifficulty: null,
      });
      expect(result.timesShown).toBe(0);
      expect(result.timesAccepted).toBe(0);
    });
  });
});

// ============================================================================
// navigation-schemas
// ============================================================================

describe("navigation-schemas", () => {
  describe("SessionSetupNavigationParamsSchema", () => {
    it("parses empty object", () => {
      const result = SessionSetupNavigationParamsSchema.parse({});
      expect(result).toEqual({});
    });

    it("parses presetId and presetDuration", () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        presetId: "sprint-15",
        presetDuration: 900,
      });
      expect(result.presetId).toBe("sprint-15");
      expect(result.presetDuration).toBe(900);
    });

    it("accepts valid presetMode", () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        presetMode: "SPRINT",
      });
      expect(result.presetMode).toBe("SPRINT");
    });

    it("rejects invalid presetMode", () => {
      expect(() =>
        SessionSetupNavigationParamsSchema.parse({
          presetMode: "INVALID",
        }),
      ).toThrow();
    });

    it("accepts comeback fields", () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        comebackMultiplier: 2.0,
        comebackMessage: "Welcome back!",
      });
      expect(result.comebackMultiplier).toBe(2.0);
    });

    it("accepts source field", () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        source: "rescue",
      });
      expect(result.source).toBe("rescue");
    });
  });

  describe("SESSION_SETUP_SOURCE_ONBOARDING", () => {
    it("equals onboarding_first_session", () => {
      expect(SESSION_SETUP_SOURCE_ONBOARDING).toBe("onboarding_first_session");
    });
  });

  describe("SessionStartSummarySchema", () => {
    it("parses valid summary", () => {
      const result = SessionStartSummarySchema.parse({
        ctaLabel: "Start 25 Min Session",
        customizationLabel: "Tune session",
        subtitle: "25 min focus - calm theme",
      });
      expect(result.ctaLabel).toContain("25");
    });
  });

  describe("SessionStartHeroSchema", () => {
    it("parses valid hero", () => {
      const result = SessionStartHeroSchema.parse({
        eyebrow: "Fast Start",
        title: "Focus ready to launch",
        body: "Start a 25-minute session.",
      });
      expect(result.eyebrow).toBe("Fast Start");
    });
  });

  describe("FocusModeCardSchema", () => {
    it("parses valid card", () => {
      const result = FocusModeCardSchema.parse({
        accessibilityHint: "Opens sprint preset",
        accessibilityLabel: "Start 15 minute sprint session",
        body: "Fastest path to a completion.",
        ctaLabel: "Start sprint",
        durationSeconds: 900,
        id: "sprint-15",
        mode: "SPRINT",
        title: "Sprint",
      });
      expect(result.durationSeconds).toBe(900);
    });

    it("rejects duration below 60s", () => {
      expect(() =>
        FocusModeCardSchema.parse({
          accessibilityHint: "hint",
          accessibilityLabel: "label",
          body: "body text",
          ctaLabel: "cta",
          durationSeconds: 30,
          id: "id",
          mode: "SPRINT",
          title: "title",
        }),
      ).toThrow();
    });
  });
});

// ============================================================================
// events (create, serialize, deserialize)
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

// ============================================================================
// analytics (mocked)
// ============================================================================

describe("session-start analytics", () => {
  it("trackDifficultySuggestionShown calls capture", () => {
    trackDifficultySuggestionShown("u1", "CASUAL", "FOCUSED", "high");
    const { capture } = require("../../../shared/analytics/analytics-service");
    expect(capture).toHaveBeenCalledWith(
      "difficulty_suggestion_shown",
      expect.objectContaining({
        user_id: "u1",
        current_difficulty: "CASUAL",
        suggested_difficulty: "FOCUSED",
      }),
    );
  });

  it("trackDifficultySuggestionAccepted calls capture", () => {
    trackDifficultySuggestionAccepted("u1", "CASUAL", "FOCUSED", {
      sessionsAnalyzed: 5,
      averageGrade: 4.5,
      averagePurity: 90,
    });
    const { capture } = require("../../../shared/analytics/analytics-service");
    expect(capture).toHaveBeenCalledWith(
      "difficulty_suggestion_accepted",
      expect.objectContaining({ user_id: "u1" }),
    );
  });

  it("trackDifficultySuggestionDismissed calls capture", () => {
    trackDifficultySuggestionDismissed("u1", "FOCUSED");
    const { capture } = require("../../../shared/analytics/analytics-service");
    expect(capture).toHaveBeenCalledWith(
      "difficulty_suggestion_dismissed",
      expect.objectContaining({ user_id: "u1" }),
    );
  });

  it("trackDifficultyChanged calls capture", () => {
    trackDifficultyChanged("u1", "CASUAL", "FOCUSED", "manual");
    const { capture } = require("../../../shared/analytics/analytics-service");
    expect(capture).toHaveBeenCalledWith(
      "difficulty_changed",
      expect.objectContaining({ source: "manual" }),
    );
  });

  it("trackInsufficientSessionsForSuggestion calls capture", () => {
    trackInsufficientSessionsForSuggestion("u1", 2, 5);
    const { capture } = require("../../../shared/analytics/analytics-service");
    expect(capture).toHaveBeenCalledWith(
      "difficulty_suggestion_insufficient_sessions",
      expect.objectContaining({ sessions_count: 2, required_count: 5 }),
    );
  });
});

// ============================================================================
// adaptiveDifficulty
// ============================================================================

describe("adaptiveDifficulty", () => {
  describe("getAdaptiveDifficultySuggestion", () => {
    it("returns null suggestion when not enough sessions", () => {
      const result = getAdaptiveDifficultySuggestion(
        [
          { id: "1", grade: "A", purityScore: 80 },
          { id: "2", grade: "B", purityScore: 70 },
        ],
        "CASUAL",
      );
      expect(result.suggestion).toBeNull();
      expect(result.confidence).toBe("low");
    });

    it("suggests upgrade from CASUAL when performing well", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "S",
        purityScore: 90,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "CASUAL");
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("suggests downgrade from FOCUSED when struggling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "D",
        purityScore: 40,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBe("CASUAL");
    });

    it("suggests upgrade from FOCUSED when excelling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "S",
        purityScore: 95,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBe("INTENSE");
    });

    it("suggests downgrade from INTENSE when struggling", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "D",
        purityScore: 30,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "INTENSE");
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("returns no suggestion when performing at expected level", () => {
      const sessions = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        grade: "B",
        purityScore: 75,
      }));
      const result = getAdaptiveDifficultySuggestion(sessions, "FOCUSED");
      expect(result.suggestion).toBeNull();
      expect(result.stats.sessionsAnalyzed).toBe(5);
    });
  });

  describe("shouldShowSuggestion", () => {
    it("returns true when never shown", () => {
      expect(shouldShowSuggestion(null)).toBe(true);
    });

    it("returns true when shown long ago", () => {
      expect(
        shouldShowSuggestion(Date.now() - 48 * 60 * 60 * 1000),
      ).toBe(true);
    });

    it("returns false when shown recently", () => {
      expect(shouldShowSuggestion(Date.now() - 1000)).toBe(false);
    });

    it("respects custom minIntervalMs", () => {
      expect(
        shouldShowSuggestion(Date.now() - 5000, 10000),
      ).toBe(false);
      expect(
        shouldShowSuggestion(Date.now() - 15000, 10000),
      ).toBe(true);
    });
  });

  describe("getDifficultyDisplayName", () => {
    it("returns display names for all difficulties", () => {
      expect(getDifficultyDisplayName("CASUAL")).toBe("Casual");
      expect(getDifficultyDisplayName("FOCUSED")).toBe("Focused");
      expect(getDifficultyDisplayName("INTENSE")).toBe("Intense");
    });
  });

  describe("getDifficultyXPMultiplier", () => {
    it("returns correct multipliers", () => {
      expect(getDifficultyXPMultiplier("CASUAL")).toBe(1);
      expect(getDifficultyXPMultiplier("FOCUSED")).toBe(2);
      expect(getDifficultyXPMultiplier("INTENSE")).toBe(3);
    });
  });
});

// ============================================================================
// setup-helpers
// ============================================================================

describe("setup-helpers", () => {
  describe("parseSessionSetupParams", () => {
    it("returns params for valid input", () => {
      const result = parseSessionSetupParams({ presetId: "sprint-15" });
      expect(result.params.presetId).toBe("sprint-15");
      expect(result.warningMessage).toBeNull();
    });

    it("handles null input gracefully", () => {
      const result = parseSessionSetupParams(null);
      expect(result.params).toEqual({});
      expect(result.warningMessage).toBeNull();
    });

    it("handles undefined input gracefully", () => {
      const result = parseSessionSetupParams(undefined);
      expect(result.params).toEqual({});
    });
  });

  describe("buildSessionStartSummary", () => {
    it("builds correct summary", () => {
      const result = buildSessionStartSummary({
        currentThemeName: "calm",
        durationMinutes: 25,
        hasCustomizations: false,
      });
      expect(result.ctaLabel).toContain("25");
      expect(result.subtitle).toContain("calm");
      expect(result.customizationLabel).toBe("Tune session");
    });

    it("shows hide options when customizations active", () => {
      const result = buildSessionStartSummary({
        currentThemeName: "focus",
        durationMinutes: 15,
        hasCustomizations: true,
      });
      expect(result.customizationLabel).toBe("Hide options");
    });
  });

  describe("getOfflineSessionStartMessage", () => {
    it("returns message when offline", () => {
      expect(getOfflineSessionStartMessage(true)).toBeTruthy();
    });

    it("returns null when online", () => {
      expect(getOfflineSessionStartMessage(false)).toBeNull();
    });
  });

  describe("shouldOpenCustomizationByDefault", () => {
    it("returns true for custom preset", () => {
      expect(
        shouldOpenCustomizationByDefault({ presetId: "custom" }),
      ).toBe(true);
    });

    it("returns false for non-custom preset", () => {
      expect(
        shouldOpenCustomizationByDefault({ presetId: "sprint-15" }),
      ).toBe(false);
    });

    it("returns false when no presetId", () => {
      expect(shouldOpenCustomizationByDefault({})).toBe(false);
    });
  });

  describe("shouldAutoApplySmartSuggestion", () => {
    it("returns true when all conditions met", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(true);
    });

    it("returns false when has saved draft", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: true,
          params: {},
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(false);
    });

    it("returns false when no suggestion available", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: null,
        }),
      ).toBe(false);
    });

    it("returns false when params have presetId", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { presetId: "custom" },
          smartSuggestionPresetId: "sprint-15",
        }),
      ).toBe(false);
    });
  });

  describe("createStarterSessionConfig", () => {
    it("creates config with correct duration", () => {
      const config = createStarterSessionConfig({ durationMinutes: 15 });
      expect(config.duration).toBe(900);
      expect(config.mode).toBe("STARTER");
    });

    it("includes metadata flags", () => {
      const config = createStarterSessionConfig({ durationMinutes: 25 });
      expect(config.metadata.isFromOnboarding).toBe(true);
      expect(config.metadata.isStarterSession).toBe(true);
    });

    it("sets category to null when not provided", () => {
      const config = createStarterSessionConfig({ durationMinutes: 15 });
      expect(config.category).toBeNull();
    });

    it("preserves category when provided", () => {
      const config = createStarterSessionConfig({
        durationMinutes: 15,
        category: "WORK",
      });
      expect(config.category).toBe("WORK");
    });
  });
});

// ============================================================================
// hero-builder
// ============================================================================

describe("hero-builder", () => {
  describe("buildSessionStartHero", () => {
    it("returns rescue hero for rescue source", () => {
      const result = buildSessionStartHero({
        durationMinutes: 10,
        params: { source: "rescue", rescueTaskDescription: "Just 5 minutes" },
        presetName: "Recovery",
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe("Rescue Block");
      expect(result.body).toContain("Just 5 minutes");
    });

    it("returns first session hero for onboarding source", () => {
      const result = buildSessionStartHero({
        durationMinutes: 15,
        params: { source: "onboarding_first_session" },
        presetName: "Sprint",
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe("First Session");
      expect(result.title).toContain("15");
    });

    it("returns content-study hero for study source", () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: { source: "content-study" },
        presetName: "Study",
        smartSuggestionDescription: null,
      });
      expect(result.title).toContain("focused block");
    });

    it("returns comeback hero when comebackMultiplier > 1", () => {
      const result = buildSessionStartHero({
        durationMinutes: 15,
        params: { comebackMultiplier: 2.0, comebackMessage: "Back again!" },
        presetName: "Sprint",
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe("Comeback Session");
      expect(result.title).toBe("Back again!");
    });

    it("returns smart suggestion hero when description provided", () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: {},
        presetName: "Study",
        smartSuggestionDescription: "Perfect for your morning focus.",
      });
      expect(result.eyebrow).toBe("Recommended For Today");
    });

    it("returns default fast start hero", () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: {},
        presetName: "Focus",
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe("Fast Start");
    });
  });
});

// ============================================================================
// lane-builder
// ============================================================================

describe("lane-builder", () => {
  describe("buildLaneSessionBrief", () => {
    it("builds brief for student lane", () => {
      const brief = buildLaneSessionBrief({
        lane: "student",
        durationSeconds: 25 * 60,
      });
      expect(brief.lane).toBe("student");
      expect(brief.userFacingModeName).toBe("Study");
    });

    it("builds brief for game_like lane", () => {
      const brief = buildLaneSessionBrief({
        lane: "game_like",
        durationSeconds: 15 * 60,
      });
      expect(brief.lane).toBe("game_like");
      expect(brief.userFacingModeName).toBe("Run");
    });

    it("builds brief for deep_creative lane", () => {
      const brief = buildLaneSessionBrief({
        lane: "deep_creative",
        durationSeconds: 45 * 60,
      });
      expect(brief.lane).toBe("deep_creative");
      expect(brief.userFacingModeName).toBe("Project");
    });

    it("builds brief for minimal_normal lane", () => {
      const brief = buildLaneSessionBrief({
        lane: "minimal_normal",
        durationSeconds: 15 * 60,
      });
      expect(brief.lane).toBe("minimal_normal");
      expect(brief.userFacingModeName).toBe("Clean");
    });

    it("uses rescue duration when isRescue is true", () => {
      const brief = buildLaneSessionBrief({
        lane: "student",
        isRescue: true,
        durationSeconds: 5 * 60,
      });
      expect(brief.friction).not.toBeNull();
      expect(brief.friction!.level).toBe("soft");
    });

    it("includes offline message when offline", () => {
      const brief = buildLaneSessionBrief({
        lane: "student",
        isOffline: true,
      });
      expect(brief.offlineMessage).toBeTruthy();
    });

    it("offline message is null when online", () => {
      const brief = buildLaneSessionBrief({
        lane: "student",
        isOffline: false,
      });
      expect(brief.offlineMessage).toBeNull();
    });
  });

  describe("buildFocusModeCards", () => {
    it("returns 4 cards", () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      expect(cards).toHaveLength(4);
    });

    it("each card has required fields", () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      for (const card of cards) {
        expect(card.id).toBeTruthy();
        expect(card.title).toBeTruthy();
        expect(card.body).toBeTruthy();
        expect(card.ctaLabel).toBeTruthy();
        expect(card.durationSeconds).toBeGreaterThanOrEqual(60);
        expect(card.accessibilityHint).toBeTruthy();
        expect(card.accessibilityLabel).toBeTruthy();
      }
    });

    it("includes streak-specific copy when streak active", () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      const lightFocus = cards.find((c) => c.mode === "LIGHT_FOCUS");
      expect(lightFocus!.body).toContain("Protect day 5");
    });

    it("uses default copy when no streak", () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      const lightFocus = cards.find((c) => c.mode === "LIGHT_FOCUS");
      expect(lightFocus!.body).toContain("first real proof");
    });
  });
});
