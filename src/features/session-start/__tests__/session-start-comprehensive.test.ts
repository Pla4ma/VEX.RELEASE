/**
 * Comprehensive tests for the session-start feature.
 *
 * Covers:
 *  - setup-helpers.ts (parseSessionSetupParams, buildSessionStartSummary,
 *    getOfflineSessionStartMessage, shouldOpenCustomizationByDefault,
 *    shouldAutoApplySmartSuggestion, createStarterSessionConfig)
 *  - hero-builder.ts (buildSessionStartHero – all source branches)
 *  - lane-builder.ts (buildLaneSessionBrief – all lanes, buildFocusModeCards)
 *  - service/adaptiveDifficulty.ts (getAdaptiveDifficultySuggestion,
 *    shouldShowSuggestion, getDifficultyDisplayName, getDifficultyXPMultiplier)
 *  - repository.ts (getDifficultyPreference, saveDifficultyPreference,
 *    updateCurrentDifficulty)
 *  - analytics.ts (all track* functions)
 *  - events.ts (create*, serialize*, deserialize*)
 *  - schemas (re-export validation)
 */

// ---------------------------------------------------------------------------
// Service: setup-helpers
// ---------------------------------------------------------------------------
import {
  parseSessionSetupParams,
  buildSessionStartSummary,
  getOfflineSessionStartMessage,
  shouldOpenCustomizationByDefault,
  shouldAutoApplySmartSuggestion,
  createStarterSessionConfig,
} from "../setup-helpers";

// ---------------------------------------------------------------------------
// Service: hero-builder
// ---------------------------------------------------------------------------
import { buildSessionStartHero } from "../hero-builder";

// ---------------------------------------------------------------------------
// Service: lane-builder
// ---------------------------------------------------------------------------
import { buildLaneSessionBrief, buildFocusModeCards } from "../lane-builder";

// ---------------------------------------------------------------------------
// Adaptive difficulty service
// ---------------------------------------------------------------------------
import {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
  getDifficultyDisplayName,
  getDifficultyXPMultiplier,
} from "../service/adaptiveDifficulty";

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
  trackDifficultyChanged,
  trackInsufficientSessionsForSuggestion,
} from "../analytics";

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Repository (mocked Supabase)
// ---------------------------------------------------------------------------
import * as repository from "../repository";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock Supabase client
const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
const mockEq = jest.fn(() => ({ single: mockSingle }));
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  upsert: mockUpsert,
  eq: mockEq,
}));

jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

// Mock analytics capture
jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));

// ---------------------------------------------------------------------------
// setup-helpers tests
// ---------------------------------------------------------------------------
describe("session-start: setup-helpers", () => {
  describe("parseSessionSetupParams", () => {
    it("returns valid params with no warning when input is valid", () => {
      const result = parseSessionSetupParams({
        presetId: "pomodoro",
        goal: "Write",
        suggestedDurationSeconds: 1500,
      });
      expect(result.params.presetId).toBe("pomodoro");
      expect(result.params.goal).toBe("Write");
      expect(result.warningMessage).toBeNull();
    });

    it("returns empty params and warning for invalid input", () => {
      const result = parseSessionSetupParams({
        suggestedDurationSeconds: -1,
      });
      expect(result.params).toEqual({});
      expect(result.warningMessage).toBeTruthy();
    });

    it("handles null/undefined input gracefully", () => {
      const r1 = parseSessionSetupParams(null);
      const r2 = parseSessionSetupParams(undefined);
      // null and undefined should fall back to {} and succeed with defaults
      expect(r1.params).toBeDefined();
      expect(r2.params).toBeDefined();
    });
  });

  describe("buildSessionStartSummary", () => {
    it("builds a summary with the correct label and subtitle", () => {
      const s = buildSessionStartSummary({
        currentThemeName: "Forest",
        durationMinutes: 30,
        hasCustomizations: false,
      });
      expect(s.ctaLabel).toBe("Start 30 Min Session");
      expect(s.subtitle).toContain("30 min focus");
      expect(s.subtitle).toContain("Forest");
      expect(s.customizationLabel).toBe("Tune session");
    });

    it("uses 'Hide options' label when customizations are open", () => {
      const s = buildSessionStartSummary({
        currentThemeName: "Ocean",
        durationMinutes: 10,
        hasCustomizations: true,
      });
      expect(s.customizationLabel).toBe("Hide options");
    });
  });

  describe("getOfflineSessionStartMessage", () => {
    it("returns null when online", () => {
      expect(getOfflineSessionStartMessage(false)).toBeNull();
    });

    it("returns a helpful offline message when offline", () => {
      const msg = getOfflineSessionStartMessage(true);
      expect(msg).toBeTruthy();
      expect(msg).toContain("offline");
    });
  });

  describe("shouldOpenCustomizationByDefault", () => {
    it("returns true when presetId is 'custom'", () => {
      expect(shouldOpenCustomizationByDefault({ presetId: "custom" })).toBe(true);
    });

    it("returns false for any other presetId", () => {
      expect(shouldOpenCustomizationByDefault({ presetId: "pomodoro" })).toBe(false);
    });

    it("returns false when presetId is absent", () => {
      expect(shouldOpenCustomizationByDefault({})).toBe(false);
    });
  });

  describe("shouldAutoApplySmartSuggestion", () => {
    it("returns true when no draft, no preset, no suggested duration, and preset exists", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(true);
    });

    it("returns false when a saved draft exists", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: true,
          params: {},
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });

    it("returns false when params already have a presetId", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { presetId: "custom" },
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });

    it("returns false when smartSuggestionPresetId is null", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: {},
          smartSuggestionPresetId: null,
        }),
      ).toBe(false);
    });

    it("returns false when suggestedDurationSeconds is set", () => {
      expect(
        shouldAutoApplySmartSuggestion({
          hasSavedDraft: false,
          params: { suggestedDurationSeconds: 1500 },
          smartSuggestionPresetId: "deep",
        }),
      ).toBe(false);
    });
  });

  describe("createStarterSessionConfig", () => {
    it("produces a STARTER mode config with correct duration in seconds", () => {
      const config = createStarterSessionConfig({ durationMinutes: 10 });
      expect(config.duration).toBe(600);
      expect(config.mode).toBe("STARTER");
      expect(config.metadata.isStarterSession).toBe(true);
      expect(config.metadata.isFromOnboarding).toBe(true);
    });

    it("sets category to null when not provided", () => {
      const config = createStarterSessionConfig({ durationMinutes: 5 });
      expect(config.category).toBeNull();
    });

    it("passes category through when provided", () => {
      const config = createStarterSessionConfig({
        durationMinutes: 15,
        category: "focus",
      });
      expect(config.category).toBe("focus");
    });
  });
});

// ---------------------------------------------------------------------------
// hero-builder tests
// ---------------------------------------------------------------------------
describe("session-start: hero-builder", () => {
  it("returns rescue hero when source is 'rescue'", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 5,
      params: { source: "rescue" },
      presetName: "Quick",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Rescue Block");
    expect(hero.title).toContain("5 minutes");
  });

  it("uses rescueTaskDescription when available", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 5,
      params: { source: "rescue", rescueTaskDescription: "Just breathe." },
      presetName: "Quick",
      smartSuggestionDescription: null,
    });
    expect(hero.body).toBe("Just breathe.");
  });

  it("returns onboarding hero when source is 'onboarding_first_session'", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 15,
      params: { source: "onboarding_first_session" },
      presetName: "Quick Focus",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("First Session");
    expect(hero.title).toContain("15 minutes");
  });

  it("returns content-study hero for 'content-study' source", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 20,
      params: { source: "content-study" },
      presetName: "Deep",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Deep Work Sprint");
    expect(hero.title).toContain("focused block");
  });

  it("returns learning-execution hero with custom label", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: { source: "learning-execution", learningExecutionLabel: "Practice Lab" },
      presetName: "Study",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Practice Lab");
  });

  it("returns comeback hero when comebackMultiplier > 1", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 10,
      params: { comebackMultiplier: 2, comebackMessage: "Welcome back!" },
      presetName: "Focus",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Comeback Session");
    expect(hero.title).toBe("Welcome back!");
  });

  it("returns recommendation hero when smartSuggestionDescription is provided", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: {},
      presetName: "Pomodoro",
      smartSuggestionDescription: "Based on your recent sessions",
    });
    expect(hero.eyebrow).toBe("Recommended For Today");
    expect(hero.body).toBe("Based on your recent sessions");
  });

  it("returns default fast-start hero when no special conditions", () => {
    const hero = buildSessionStartHero({
      durationMinutes: 25,
      params: {},
      presetName: "Pomodoro",
      smartSuggestionDescription: null,
    });
    expect(hero.eyebrow).toBe("Fast Start");
    expect(hero.title).toContain("Pomodoro");
  });
});

// ---------------------------------------------------------------------------
// lane-builder tests
// ---------------------------------------------------------------------------
describe("session-start: lane-builder", () => {
  describe("buildLaneSessionBrief", () => {
    it("builds a student lane brief", () => {
      const brief = buildLaneSessionBrief({ lane: "student" });
      expect(brief.lane).toBe("student");
      expect(brief.userFacingModeName).toBe("Study");
      expect(brief.title).toContain("Study");
    });

    it("builds a game_like lane brief", () => {
      const brief = buildLaneSessionBrief({ lane: "game_like" });
      expect(brief.lane).toBe("game_like");
      expect(brief.userFacingModeName).toBe("Run");
    });

    it("builds a deep_creative lane brief", () => {
      const brief = buildLaneSessionBrief({ lane: "deep_creative" });
      expect(brief.lane).toBe("deep_creative");
      expect(brief.userFacingModeName).toBe("Project");
    });

    it("builds a minimal_normal lane brief (default)", () => {
      const brief = buildLaneSessionBrief({});
      expect(brief.lane).toBe("minimal_normal");
      expect(brief.userFacingModeName).toBe("Clean");
    });

    it("uses laneProfile primaryLane when provided", () => {
      const brief = buildLaneSessionBrief({
        laneProfile: { primaryLane: "student" } as any,
      });
      expect(brief.lane).toBe("student");
    });

    it("caps rescue duration between 5 and 12 minutes", () => {
      const short = buildLaneSessionBrief({ isRescue: true, durationSeconds: 60 });
      expect(short.suggestedDurationSeconds).toBe(300); // 5 min minimum

      const long = buildLaneSessionBrief({ isRescue: true, durationSeconds: 60 * 60 });
      expect(long.suggestedDurationSeconds).toBe(720); // 12 min max
    });

    it("clamps normal duration between 15 and 90 minutes", () => {
      const short = buildLaneSessionBrief({ durationSeconds: 120 });
      expect(short.suggestedDurationSeconds).toBe(900); // 15 min minimum

      const long = buildLaneSessionBrief({ durationSeconds: 120 * 60 });
      expect(long.suggestedDurationSeconds).toBe(5400); // 90 min max
    });

    it("sets risk and friction for rescue sessions", () => {
      const brief = buildLaneSessionBrief({ isRescue: true, lane: "student" });
      expect(brief.risk).not.toBeNull();
      expect(brief.risk?.type).toBe("avoidance");
      expect(brief.friction).not.toBeNull();
      expect(brief.friction?.level).toBe("soft");
    });

    it("sets risk and friction to null for normal sessions", () => {
      const brief = buildLaneSessionBrief({ lane: "student" });
      expect(brief.risk).toBeNull();
      expect(brief.friction).toBeNull();
    });

    it("includes offlineMessage when offline", () => {
      const brief = buildLaneSessionBrief({ isOffline: true });
      expect(brief.offlineMessage).toBeTruthy();
    });

    it("sets offlineMessage to null when online", () => {
      const brief = buildLaneSessionBrief({ isOffline: false });
      expect(brief.offlineMessage).toBeNull();
    });
  });

  describe("buildFocusModeCards", () => {
    it("returns 4 cards for sprint, light-focus, study, recovery", () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      expect(cards).toHaveLength(4);
      expect(cards.map((c) => c.mode)).toEqual([
        "SPRINT",
        "LIGHT_FOCUS",
        "STUDY",
        "RECOVERY",
      ]);
    });

    it("includes streak-aware copy when streakDays > 0", () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      const lightFocus = cards.find((c) => c.mode === "LIGHT_FOCUS");
      expect(lightFocus?.body).toContain("5");
    });

    it("includes day-zero copy when streakDays is 0", () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      const lightFocus = cards.find((c) => c.mode === "LIGHT_FOCUS");
      expect(lightFocus?.body).toContain("first real proof");
    });

    it("every card has a valid durationSeconds", () => {
      const cards = buildFocusModeCards({ streakDays: 3 });
      for (const card of cards) {
        expect(card.durationSeconds).toBeGreaterThanOrEqual(60);
        expect(card.durationSeconds).toBeLessThanOrEqual(3600);
      }
    });

    it("every card has accessibility labels", () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      for (const card of cards) {
        expect(card.accessibilityLabel.length).toBeGreaterThan(0);
        expect(card.accessibilityHint.length).toBeGreaterThan(0);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Adaptive difficulty service tests
// ---------------------------------------------------------------------------
describe("session-start: adaptiveDifficulty service", () => {
  const makeSessions = (grades: string[], purity = 90) =>
    grades.map((grade, i) => ({
      id: `s${i}`,
      grade,
      purityScore: purity,
    }));

  describe("getAdaptiveDifficultySuggestion", () => {
    it("returns null suggestion when fewer than 5 sessions", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["A", "A", "A"]),
        "CASUAL",
      );
      expect(result.suggestion).toBeNull();
      expect(result.confidence).toBe("low");
      expect(result.stats.sessionsAnalyzed).toBe(3);
    });

    it("suggests upgrade from CASUAL to FOCUSED when grades are high", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "A", "S", "S"], 90),
        "CASUAL",
      );
      expect(result.suggestion).toBe("FOCUSED");
      expect(result.stats.averageGrade).toBeGreaterThanOrEqual(4.5);
    });

    it("suggests downgrade from FOCUSED to CASUAL when grades are low", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["D", "D", "C", "D", "D"], 40),
        "FOCUSED",
      );
      expect(result.suggestion).toBe("CASUAL");
    });

    it("suggests upgrade from FOCUSED to INTENSE when grades are high", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "S", "A", "S"], 92),
        "FOCUSED",
      );
      expect(result.suggestion).toBe("INTENSE");
    });

    it("suggests downgrade from INTENSE to FOCUSED when grades are low", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["D", "D", "C", "D", "D"], 35),
        "INTENSE",
      );
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("returns null suggestion with encouragement when performance is mid-range", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["B", "B", "B", "B", "B"], 70),
        "FOCUSED",
      );
      expect(result.suggestion).toBeNull();
      expect(result.reason).toBeTruthy();
    });

    it("ignores sessions without a valid grade", () => {
      const sessions = [
        { id: "s1", grade: undefined, purityScore: 90 },
        { id: "s2", grade: "A", purityScore: 90 },
        { id: "s3", grade: "A", purityScore: 90 },
        { id: "s4", grade: "A", purityScore: 90 },
        { id: "s5", grade: "A", purityScore: 90 },
      ];
      const result = getAdaptiveDifficultySuggestion(sessions, "CASUAL");
      // Only 4 valid sessions → still insufficient
      expect(result.suggestion).toBeNull();
    });

    it("high confidence when grade >= 4.8 on CASUAL upgrade", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "S", "S", "S"], 95),
        "CASUAL",
      );
      expect(result.confidence).toBe("high");
    });
  });

  describe("shouldShowSuggestion", () => {
    it("returns true when never shown before", () => {
      expect(shouldShowSuggestion(null)).toBe(true);
    });

    it("returns false when shown recently", () => {
      expect(shouldShowSuggestion(Date.now() - 1000)).toBe(false);
    });

    it("returns true when enough time has passed", () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      expect(shouldShowSuggestion(twoDaysAgo)).toBe(true);
    });

    it("respects custom minIntervalMs", () => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      expect(shouldShowSuggestion(fiveMinAgo, 10 * 60 * 1000)).toBe(false);
      expect(shouldShowSuggestion(fiveMinAgo, 1 * 60 * 1000)).toBe(true);
    });
  });

  describe("getDifficultyDisplayName", () => {
    it("returns correct display names", () => {
      expect(getDifficultyDisplayName("CASUAL")).toBe("Casual");
      expect(getDifficultyDisplayName("FOCUSED")).toBe("Focused");
      expect(getDifficultyDisplayName("INTENSE")).toBe("Intense");
    });
  });

  describe("getDifficultyXPMultiplier", () => {
    it("returns correct XP multipliers", () => {
      expect(getDifficultyXPMultiplier("CASUAL")).toBe(1);
      expect(getDifficultyXPMultiplier("FOCUSED")).toBe(2);
      expect(getDifficultyXPMultiplier("INTENSE")).toBe(3);
    });
  });
});

// ---------------------------------------------------------------------------
// Repository tests
// ---------------------------------------------------------------------------
describe("session-start: repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getDifficultyPreference", () => {
    it("returns mapped preference on success", async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          user_id: "u1",
          current_difficulty: "FOCUSED",
          suggested_difficulty: null,
          last_suggestion_at: null,
          suggestion_dismissed_at: null,
          times_shown: 0,
          times_accepted: 0,
        },
        error: null,
      });

      const result = await repository.getDifficultyPreference("u1");
      expect(result).not.toBeNull();
      expect(result?.userId).toBe("u1");
      expect(result?.currentDifficulty).toBe("FOCUSED");
    });

    it("returns null when no row found (PGRST116)", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116", message: "not found" },
      });

      const result = await repository.getDifficultyPreference("u1");
      expect(result).toBeNull();
    });

    it("returns null and captures exception on other errors", async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST500", message: "server error" },
      });

      const result = await repository.getDifficultyPreference("u1");
      expect(result).toBeNull();
    });
  });

  describe("saveDifficultyPreference", () => {
    it("calls upsert with the correct mapped fields", async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      await repository.saveDifficultyPreference({
        userId: "u1",
        currentDifficulty: "FOCUSED",
        suggestedDifficulty: null,
        timesShown: 5,
        timesAccepted: 2,
      });

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      const call = mockUpsert.mock.calls[0][0];
      expect(call.user_id).toBe("u1");
      expect(call.current_difficulty).toBe("FOCUSED");
      expect(call.times_shown).toBe(5);
    });

    it("throws when upsert returns an error", async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: "duplicate" },
      });

      await expect(
        repository.saveDifficultyPreference({
          userId: "u1",
          currentDifficulty: "CASUAL",
          suggestedDifficulty: null,
          timesShown: 0,
          timesAccepted: 0,
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateCurrentDifficulty", () => {
    it("upserts the current difficulty", async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      await repository.updateCurrentDifficulty("u1", "INTENSE");
      expect(mockUpsert).toHaveBeenCalledTimes(1);
      expect(mockUpsert.mock.calls[0][0].current_difficulty).toBe("INTENSE");
    });

    it("throws on error", async () => {
      mockUpsert.mockResolvedValueOnce({
        error: { message: "fail" },
      });

      await expect(
        repository.updateCurrentDifficulty("u1", "CASUAL"),
      ).rejects.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Analytics tests
// ---------------------------------------------------------------------------
describe("session-start: analytics", () => {
  let captureMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    captureMock = require("../../../shared/analytics/analytics-service").capture;
  });

  it("trackDifficultySuggestionShown calls capture with correct event name", () => {
    trackDifficultySuggestionShown("u1", "CASUAL", "FOCUSED", "high");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_shown",
      expect.objectContaining({
        user_id: "u1",
        current_difficulty: "CASUAL",
        suggested_difficulty: "FOCUSED",
        confidence: "high",
      }),
    );
  });

  it("trackDifficultySuggestionAccepted includes stats", () => {
    trackDifficultySuggestionAccepted("u1", "CASUAL", "FOCUSED", {
      sessionsAnalyzed: 10,
      averageGrade: 4.5,
      averagePurity: 88,
    });
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_accepted",
      expect.objectContaining({ sessions_analyzed: 10 }),
    );
  });

  it("trackDifficultySuggestionDismissed captures event", () => {
    trackDifficultySuggestionDismissed("u1", "FOCUSED");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_dismissed",
      expect.objectContaining({ suggested_difficulty: "FOCUSED" }),
    );
  });

  it("trackDifficultyChanged captures source", () => {
    trackDifficultyChanged("u1", "CASUAL", "FOCUSED", "manual");
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_changed",
      expect.objectContaining({ source: "manual" }),
    );
  });

  it("trackInsufficientSessionsForSuggestion captures counts", () => {
    trackInsufficientSessionsForSuggestion("u1", 2, 5);
    expect(captureMock).toHaveBeenCalledWith(
      "difficulty_suggestion_insufficient_sessions",
      expect.objectContaining({ sessions_count: 2, required_count: 5 }),
    );
  });
});

// ---------------------------------------------------------------------------
// Events tests
// ---------------------------------------------------------------------------
describe("session-start: events", () => {
  const userId = "user-123";
  const sessionId = "session-456";

  it("createSessionInitiatedEvent returns correct structure", () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      "manual",
      "user_tap",
      "focus",
      {},
    );
    expect(event.type).toBe("session_initiated");
    expect(event.userId).toBe(userId);
    expect(event.sessionId).toBe(sessionId);
    expect(event.id).toMatch(/^evt_/);
    expect(event.data.initiationType).toBe("manual");
  });

  it("createSessionPreparationStartedEvent returns correct structure", () => {
    const event = createSessionPreparationStartedEvent(
      userId,
      sessionId,
      "quick",
      [],
      {},
      {},
    );
    expect(event.type).toBe("session_preparation_started");
    expect(event.metadata.source).toBe("session-start");
  });

  it("createSessionReadinessAssessedEvent returns correct structure", () => {
    const event = createSessionReadinessAssessedEvent(
      userId,
      sessionId,
      "auto",
      85,
      "ready",
      {},
      {},
      [],
    );
    expect(event.type).toBe("session_readiness_assessed");
    expect(event.data.readinessScore).toBe(85);
  });

  it("createSessionGoalsSetEvent returns correct structure", () => {
    const event = createSessionGoalsSetEvent(
      userId,
      sessionId,
      "user_defined",
      [],
      {},
      {},
    );
    expect(event.type).toBe("session_goals_set");
  });

  it("createSessionMoodAssessedEvent returns correct structure", () => {
    const event = createSessionMoodAssessedEvent(
      userId,
      sessionId,
      "self_report",
      {},
      {},
      {},
      [],
    );
    expect(event.type).toBe("session_mood_assessed");
  });

  it("createSessionContextEstablishedEvent returns correct structure", () => {
    const event = createSessionContextEstablishedEvent(
      userId,
      sessionId,
      "environment",
      {},
      {},
    );
    expect(event.type).toBe("session_context_established");
  });

  it("serializeSessionStartEvent produces valid JSON with ISO timestamp", () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      "manual",
      "user_tap",
      "focus",
      {},
    );
    const serialized = serializeSessionStartEvent(event);
    const parsed = JSON.parse(serialized);
    expect(typeof parsed.timestamp).toBe("string");
    expect(parsed.type).toBe("session_initiated");
  });

  it("deserializeSessionStartEvent restores timestamp as Date", () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      "manual",
      "user_tap",
      "focus",
      {},
    );
    const serialized = serializeSessionStartEvent(event);
    const deserialized = deserializeSessionStartEvent(serialized);
    expect(deserialized.timestamp).toBeInstanceOf(Date);
    expect(deserialized.type).toBe("session_initiated");
  });

  it("round-trips serialize → deserialize correctly", () => {
    const event = createSessionGoalsSetEvent(
      userId,
      sessionId,
      "system_suggested",
      [],
      {},
      {},
    );
    const roundTrip = deserializeSessionStartEvent(
      serializeSessionStartEvent(event),
    );
    expect(roundTrip.id).toBe(event.id);
    expect(roundTrip.userId).toBe(userId);
  });
});

// ---------------------------------------------------------------------------
// Schema re-exports validation
// ---------------------------------------------------------------------------
describe("session-start: schemas (re-exported)", () => {
  const schemas = require("../schemas");

  it("exports SessionStakeSchema", () => {
    expect(schemas.SessionStakeSchema).toBeDefined();
  });

  it("exports LaneSessionBriefSchema", () => {
    expect(schemas.LaneSessionBriefSchema).toBeDefined();
  });

  it("exports SessionSetupNavigationParamsSchema", () => {
    expect(schemas.SessionSetupNavigationParamsSchema).toBeDefined();
  });

  it("exports SessionStartSummarySchema", () => {
    expect(schemas.SessionStartSummarySchema).toBeDefined();
  });

  it("exports SessionStartHeroSchema", () => {
    expect(schemas.SessionStartHeroSchema).toBeDefined();
  });

  it("exports FocusModeCardSchema", () => {
    expect(schemas.FocusModeCardSchema).toBeDefined();
  });

  it("exports SessionDifficultySchema", () => {
    expect(schemas.SessionDifficultySchema).toBeDefined();
  });

  it("exports DifficultySuggestionSchema", () => {
    expect(schemas.DifficultySuggestionSchema).toBeDefined();
  });

  it("exports DifficultyPreferenceSchema", () => {
    expect(schemas.DifficultyPreferenceSchema).toBeDefined();
  });

  it("SessionDifficultySchema validates correct enum values", () => {
    expect(schemas.SessionDifficultySchema.safeParse("CASUAL").success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse("FOCUSED").success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse("INTENSE").success).toBe(true);
    expect(schemas.SessionDifficultySchema.safeParse("INVALID").success).toBe(false);
  });

  it("FocusModeCardSchema rejects invalid duration", () => {
    const result = schemas.FocusModeCardSchema.safeParse({
      accessibilityHint: "hint",
      accessibilityLabel: "label",
      body: "body",
      ctaLabel: "cta",
      durationSeconds: 30, // below 60 minimum
      id: "card-1",
      mode: "SPRINT",
      title: "title",
    });
    expect(result.success).toBe(false);
  });
});
