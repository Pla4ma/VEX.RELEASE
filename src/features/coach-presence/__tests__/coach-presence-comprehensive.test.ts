/**
 * Coach Presence Feature — Comprehensive Tests
 *
 * Covers: service-helpers, visibility-policy, day-retention, copy, message-library,
 * comeback-message, copy-service, completion-presence, schemas, service
 */

// ─── service-helpers ──────────────────────────────────────────────────────────

import {
  styleForLane,
  goalForLane,
  getActionReason,
  getTone,
  getVisualState,
} from "../service-helpers";

// ─── visibility-policy ────────────────────────────────────────────────────────

import { decideCoachVisibility } from "../visibility-policy";

// ─── day-retention ────────────────────────────────────────────────────────────

import { coachMomentFromJourneyState, shouldShowRetentionMoment } from "../day-retention";

// ─── copy ─────────────────────────────────────────────────────────────────────

import {
  BANNED_COACH_PHRASES,
  ACTION_LABELS,
  STYLE_ADAPTATION,
  FALLBACK_HOME_MESSAGES,
  PROGRESS_REACTIONS,
  getCompletionMessage,
} from "../copy";

// ─── message-library ──────────────────────────────────────────────────────────

import { getCoachPresenceMessage as getLibraryMessage, COACH_PRESENCE_MESSAGE_CONTEXTS } from "../message-library";

// ─── comeback-message ─────────────────────────────────────────────────────────

import { getCoachComebackMessage } from "../comeback-message";

// ─── copy-service ─────────────────────────────────────────────────────────────

import { getCoachMemoryConfidence, getCoachPresenceMessage } from "../copy-service";

// ─── service ──────────────────────────────────────────────────────────────────

import {
  buildCoachPresence,
  resolveCoachActionIntent,
} from "../service";

// ─── schemas ──────────────────────────────────────────────────────────────────

import {
  CoachPresenceMotivationStyleSchema,
  CoachActionIntentSchema,
  CoachPresenceSurfaceSchema,
  CoachPresenceToneSchema,
  CoachPresenceVisualStateSchema,
  CoachPresenceMemorySummarySchema,
  CoachPresenceActionSchema,
  CoachPresenceSchema,
  CoachPresenceProgressInputSchema,
  CompletionPresenceSummarySchema,
  CoachVisibilitySurfaceSchema,
  CoachVisibilityDecisionSchema,
} from "../schemas";

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const unlockedAvailability = {
  canNavigate: true,
  canQuery: true,
  canRegisterRoute: true,
  canRenderEntryPoint: true,
  canShowNotification: true,
  canSubscribeToEvents: true,
  canUseBackend: true,
  reason: "Ready",
  state: "unlocked" as const,
};

const lockedAvailability = {
  ...unlockedAvailability,
  canNavigate: false,
  canQuery: false,
  canRegisterRoute: false,
  canRenderEntryPoint: false,
  canUseBackend: false,
  reason: "Locked",
  state: "locked" as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE-HELPERS TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("service-helpers", () => {
  test("styleForLane returns STUDY_FOCUSED for student lane", () => {
    expect(styleForLane({ primaryLane: "student" } as any, "CALM")).toBe("STUDY_FOCUSED");
  });

  test("styleForLane returns GAME_LIKE for game_like lane", () => {
    expect(styleForLane({ primaryLane: "game_like" } as any, "CALM")).toBe("GAME_LIKE");
  });

  test("styleForLane returns COACH_LED for deep_creative lane", () => {
    expect(styleForLane({ primaryLane: "deep_creative" } as any, "CALM")).toBe("COACH_LED");
  });

  test("styleForLane returns CALM for minimal_normal lane", () => {
    expect(styleForLane({ primaryLane: "minimal_normal" } as any, "FRIENDLY")).toBe("CALM");
  });

  test("styleForLane returns fallback when profile is null", () => {
    expect(styleForLane(null, "INTENSE")).toBe("INTENSE");
    expect(styleForLane(undefined, "FRIENDLY")).toBe("FRIENDLY");
  });

  test("goalForLane returns correct goals per lane", () => {
    expect(goalForLane({ primaryLane: "student" } as any, "focus")).toBe("study");
    expect(goalForLane({ primaryLane: "deep_creative" } as any, "focus")).toBe("creative");
    expect(goalForLane({ primaryLane: "minimal_normal" } as any, "focus")).toBe("personal");
    expect(goalForLane({ primaryLane: "game_like" } as any, "focus")).toBe("focus");
    expect(goalForLane(null, "study")).toBe("study");
  });

  test("getActionReason returns correct reason for START_STUDY_SESSION", () => {
    expect(getActionReason("START_STUDY_SESSION", "CALM")).toContain("study");
  });

  test("getActionReason returns correct reason for REVIEW_PROGRESS", () => {
    expect(getActionReason("REVIEW_PROGRESS", "CALM")).toContain("Progress");
  });

  test("getTone returns correct tone for each motivation style", () => {
    expect(getTone("CALM").personality).toBe("steady");
    expect(getTone("CALM").intensity).toBe("low");
    expect(getTone("INTENSE").personality).toBe("sharp");
    expect(getTone("INTENSE").intensity).toBe("high");
    expect(getTone("STUDY_FOCUSED").personality).toBe("studious");
    expect(getTone("GAME_LIKE").personality).toBe("playful");
  });

  test("getVisualState returns correct reaction per style", () => {
    expect(getVisualState(null, "INTENSE").reaction).toBe("ready");
    expect(getVisualState(null, "GAME_LIKE").reaction).toBe("celebrating");
    expect(getVisualState(null, "FRIENDLY").reaction).toBe("focused");
    expect(getVisualState(null, "CALM").reaction).toBe("steady");
  });

  test("getVisualState uses companion data when provided", () => {
    const companion = { element: "WAVE", level: 5, currentMood: "HAPPY", phase: "MATURE" };
    const state = getVisualState(companion as any, "CALM");
    expect(state.element).toBe("WAVE");
    expect(state.level).toBe(5);
    expect(state.mood).toBe("HAPPY");
    expect(state.phase).toBe("MATURE");
  });

  test("getVisualState uses defaults when companion is null", () => {
    const state = getVisualState(null, "CALM");
    expect(state.element).toBe("LUMINA");
    expect(state.level).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VISIBILITY POLICY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("decideCoachVisibility", () => {
  test("ACTIVE_SESSION is always HIDDEN for all lanes", () => {
    for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
      const policy = decideCoachVisibility({ lane, surface: "ACTIVE_SESSION" });
      expect(policy.decision).toBe("HIDDEN");
    }
  });

  test("COMPLETION is always VISIBLE for all lanes", () => {
    for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
      const policy = decideCoachVisibility({ lane, surface: "COMPLETION" });
      expect(policy.decision).toBe("VISIBLE");
    }
  });

  test("SESSION_SETUP is HIDDEN for minimal_normal lane", () => {
    const policy = decideCoachVisibility({ lane: "minimal_normal", surface: "SESSION_SETUP" });
    expect(policy.decision).toBe("HIDDEN");
    expect(policy.maxMessageLength).toBe(0);
  });

  test("SESSION_SETUP is SUBTLE_ONE_LINE for non-minimal lanes", () => {
    const policy = decideCoachVisibility({ lane: "student", surface: "SESSION_SETUP" });
    expect(policy.decision).toBe("SUBTLE_ONE_LINE");
    expect(policy.maxMessageLength).toBe(48);
  });

  test("ONBOARDING is SUBTLE_ONE_LINE for all lanes", () => {
    for (const lane of ["student", "game_like", "deep_creative", "minimal_normal"] as const) {
      const policy = decideCoachVisibility({ lane, surface: "ONBOARDING" });
      expect(policy.decision).toBe("SUBTLE_ONE_LINE");
    }
  });

  test("maxMessageLength is 96 for VISIBLE decisions", () => {
    const policy = decideCoachVisibility({ lane: "student", surface: "DAY_0_HOME" });
    expect(policy.decision).toBe("VISIBLE");
    expect(policy.maxMessageLength).toBe(96);
  });

  test("always includes a reason string", () => {
    const policy = decideCoachVisibility({ lane: "student", surface: "COMPLETION" });
    expect(policy.reason).toBeTruthy();
    expect(typeof policy.reason).toBe("string");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DAY-RETENTION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("day-retention", () => {
  test("shouldShowRetentionMoment returns null for day 0", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 0, lastRetentionShownDay: null })).toBeNull();
  });

  test("shouldShowRetentionMoment returns day_1 for day 1", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 1, lastRetentionShownDay: null })).toBe("day_1");
  });

  test("shouldShowRetentionMoment returns day_3 for day 3", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 3, lastRetentionShownDay: null })).toBe("day_3");
  });

  test("shouldShowRetentionMoment returns day_7 for day 7", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 7, lastRetentionShownDay: null })).toBe("day_7");
  });

  test("shouldShowRetentionMoment returns null for non-milestone day", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 5, lastRetentionShownDay: null })).toBeNull();
  });

  test("shouldShowRetentionMoment returns null when already shown on that day", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 3, lastRetentionShownDay: 3 })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COPY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("coach copy constants", () => {
  test("BANNED_COACH_PHRASES contains expected phrases", () => {
    expect(BANNED_COACH_PHRASES).toContain("Great job");
    expect(BANNED_COACH_PHRASES).toContain("Keep going");
    expect(BANNED_COACH_PHRASES.length).toBeGreaterThan(0);
  });

  test("ACTION_LABELS has a label for each intent", () => {
    expect(Object.keys(ACTION_LABELS)).toHaveLength(6);
    expect(ACTION_LABELS.START_SESSION).toBeTruthy();
    expect(ACTION_LABELS.TAKE_BREAK).toBeTruthy();
  });

  test("STYLE_ADAPTATION has an entry for each motivation style", () => {
    expect(Object.keys(STYLE_ADAPTATION)).toHaveLength(6);
    for (const style of ["CALM", "FRIENDLY", "COACH_LED", "GAME_LIKE", "INTENSE", "STUDY_FOCUSED"]) {
      expect(STYLE_ADAPTATION[style as keyof typeof STYLE_ADAPTATION]).toBeTruthy();
    }
  });

  test("FALLBACK_HOME_MESSAGES has entries for all styles", () => {
    expect(Object.keys(FALLBACK_HOME_MESSAGES)).toHaveLength(6);
  });

  test("PROGRESS_REACTIONS has entries for all styles", () => {
    expect(Object.keys(PROGRESS_REACTIONS)).toHaveLength(6);
  });

  test("no copy constant contains banned phrases", () => {
    const allMessages = [
      ...Object.values(FALLBACK_HOME_MESSAGES),
      ...Object.values(PROGRESS_REACTIONS),
      ...Object.values(STYLE_ADAPTATION),
    ];
    for (const msg of allMessages) {
      for (const banned of BANNED_COACH_PHRASES) {
        expect(msg).not.toContain(banned);
      }
    }
  });
});

describe("getCompletionMessage", () => {
  const baseSummary = {
    durationMinutes: 30,
    focusPurityScore: 80,
    isComeback: false,
    isFirstSession: false,
    isHighFocusStreak: false,
    isLowEnergyDay: false,
    isStreakRecovery: false,
    sessionMode: "FOCUS",
    streakDays: 5,
  };

  test("returns first session message for first session", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, isFirstSession: true });
    expect(msg).toContain("First");
  });

  test("returns comeback message for comeback sessions", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, isComeback: true });
    expect(msg).toContain("return");
  });

  test("returns high focus streak message", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, isHighFocusStreak: true });
    expect(msg).toContain("rhythm");
  });

  test("returns low energy day message", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, isLowEnergyDay: true });
    expect(msg).toContain("Low-energy");
  });

  test("returns short session message for < 15 minutes", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, durationMinutes: 10 });
    expect(msg).toContain("Short");
  });

  test("returns long session message for >= 45 minutes", () => {
    const msg = getCompletionMessage("CALM", { ...baseSummary, durationMinutes: 60 });
    expect(msg).toContain("Long");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE LIBRARY TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("message-library", () => {
  test("COACH_PRESENCE_MESSAGE_CONTEXTS has expected contexts", () => {
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("day_0_after_motivation");
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("comeback_session");
    expect(COACH_PRESENCE_MESSAGE_CONTEXTS).toContain("strong_streak");
  });

  test("getCoachPresenceMessage returns a message for every context+style combination", () => {
    const contexts: Array<"day_0_after_motivation" | "first_session_start" | "comeback_session" | "calm_user_completion"> = [
      "day_0_after_motivation",
      "first_session_start",
      "comeback_session",
      "calm_user_completion",
    ];
    const styles: Array<"calm" | "friendly" | "coach_led" | "game_like" | "intense" | "study_focused"> = [
      "calm", "friendly", "coach_led", "game_like", "intense", "study_focused",
    ];
    for (const context of contexts) {
      for (const style of styles) {
        const msg = getLibraryMessage({ context, style });
        expect(msg).toBeTruthy();
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    }
  });

  test("messages are within 96 character limit", () => {
    const contexts: Array<"day_0_after_motivation" | "first_session_start" | "comeback_session"> = [
      "day_0_after_motivation", "first_session_start", "comeback_session",
    ];
    for (const context of contexts) {
      const msg = getLibraryMessage({ context, style: "calm" });
      expect(msg.length).toBeLessThanOrEqual(96);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COMEBACK MESSAGE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("getCoachComebackMessage", () => {
  test("returns calm style message", () => {
    const msg = getCoachComebackMessage({ motivationStyle: "CALM", daysSinceLastSession: 3 });
    expect(msg).toContain("3 days");
    expect(msg).toContain("no pressure");
  });

  test("returns intense style message", () => {
    const msg = getCoachComebackMessage({ motivationStyle: "INTENSE", daysSinceLastSession: 2 });
    expect(msg).toContain("2");
    expect(msg).toContain("Prove it");
  });

  test("returns game_like style message", () => {
    const msg = getCoachComebackMessage({ motivationStyle: "GAME_LIKE", daysSinceLastSession: 5 });
    expect(msg).toContain("5 days off");
  });

  test("returns calm style message for unknown style (fallback)", () => {
    const msg = getCoachComebackMessage({ motivationStyle: "UNKNOWN", daysSinceLastSession: 1 });
    expect(msg).toContain("Welcome back");
    expect(msg).toContain("no pressure");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// COPY-SERVICE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("getCoachMemoryConfidence", () => {
  test("returns none when sync is unavailable", () => {
    expect(getCoachMemoryConfidence(10, false)).toBe("none");
  });

  test("returns none for 0 sessions", () => {
    expect(getCoachMemoryConfidence(0, true)).toBe("none");
  });

  test("returns weak for 1-2 sessions", () => {
    expect(getCoachMemoryConfidence(1, true)).toBe("weak");
    expect(getCoachMemoryConfidence(2, true)).toBe("weak");
  });

  test("returns medium for 3-4 sessions", () => {
    expect(getCoachMemoryConfidence(3, true)).toBe("medium");
    expect(getCoachMemoryConfidence(4, true)).toBe("medium");
  });

  test("returns strong for 5+ sessions", () => {
    expect(getCoachMemoryConfidence(5, true)).toBe("strong");
    expect(getCoachMemoryConfidence(100, true)).toBe("strong");
  });
});

describe("getCoachPresenceMessage (copy-service)", () => {
  test("returns message for day-0 user with CALM style", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: "day_0",
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.message).toBeTruthy();
    expect(result.tone).toBe("calm");
    expect(result.safeIntent).toBe("START_SESSION");
  });

  test("returns TAKE_BREAK intent for low_energy completion", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: "low_energy",
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.safeIntent).toBe("TAKE_BREAK");
  });

  test("returns START_STUDY_SESSION intent for study goal", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "STUDY_FOCUSED",
      primaryGoal: "study",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "none",
      sessionMode: "inactive",
      comebackState: null,
      studyLayerLabel: "Study",
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.safeIntent).toBe("START_STUDY_SESSION");
  });

  test("returns intervention display mode for active_risk", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "medium",
      sessionMode: "active_risk",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.displayMode).toBe("intervention");
  });

  test("returns quiet display mode for active_focus with CALM style", () => {
    const result = getCoachPresenceMessage({
      motivationStyle: "CALM",
      primaryGoal: "focus",
      firstWeekStage: null,
      latestSession: null,
      memoryConfidence: "strong",
      sessionMode: "active_focus",
      comebackState: null,
      studyLayerLabel: null,
      bossIntensity: null,
      completionContext: null,
      premiumMoment: null,
      aiAvailable: true,
    });
    expect(result.displayMode).toBe("quiet");
    expect(result.shouldShow).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVE COACH ACTION INTENT
// ─────────────────────────────────────────────────────────────────────────────

describe("resolveCoachActionIntent", () => {
  test("keeps START_STUDY_SESSION when study is available", () => {
    const intent = resolveCoachActionIntent({
      requestedIntent: "START_STUDY_SESSION",
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
    });
    expect(intent).toBe("START_STUDY_SESSION");
  });

  test("falls back to START_SESSION when study is locked", () => {
    const intent = resolveCoachActionIntent({
      requestedIntent: "START_STUDY_SESSION",
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: lockedAvailability },
    });
    expect(intent).toBe("START_SESSION");
  });

  test("keeps TAKE_BREAK when requested", () => {
    const intent = resolveCoachActionIntent({
      requestedIntent: "TAKE_BREAK",
      featureAvailability: { focus: lockedAvailability, progress: lockedAvailability, study: lockedAvailability },
    });
    expect(intent).toBe("TAKE_BREAK");
  });

  test("falls back to TAKE_BREAK when focus is locked and nothing available", () => {
    const intent = resolveCoachActionIntent({
      requestedIntent: "START_SESSION",
      featureAvailability: { focus: lockedAvailability, progress: lockedAvailability, study: lockedAvailability },
    });
    expect(intent).toBe("TAKE_BREAK");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUILD COACH PRESENCE (integration)
// ─────────────────────────────────────────────────────────────────────────────

describe("buildCoachPresence", () => {
  test("produces a valid CoachPresence object", () => {
    const presence = buildCoachPresence({
      companion: { element: "WAVE", level: 3, currentMood: "CONTENT", phase: "YOUNG" },
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      memorySummary: {
        companionMemoryCount: 1,
        coachMemoryCount: 2,
        latestMemory: "Clean starts work best.",
        syncAvailable: true,
      },
      motivationStyle: "CALM",
      progress: { currentStreakDays: 4, highFocusStreak: 2, totalSessions: 8 },
      surface: "HOME",
    });

    expect(presence.id).toContain("coach-presence:");
    expect(presence.tone.personality).toBe("steady");
    expect(presence.memoryConfidence).toBe("strong");
    expect(presence.message).toBeTruthy();
    expect(presence.nextAction).toBeDefined();
    expect(presence.nextAction.label).toBeTruthy();
    expect(presence.visualCompanionState).toBeDefined();
  });

  test("uses fallback style when no lane profile", () => {
    const presence = buildCoachPresence({
      companion: null,
      featureAvailability: { focus: unlockedAvailability, progress: unlockedAvailability, study: unlockedAvailability },
      laneProfile: null,
      memorySummary: {
        companionMemoryCount: 0,
        coachMemoryCount: 0,
        latestMemory: null,
        syncAvailable: true,
      },
      motivationStyle: "INTENSE",
      progress: { currentStreakDays: 0, highFocusStreak: 0, totalSessions: 2 },
      surface: "HOME",
    });
    expect(presence.tone.personality).toBe("sharp");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA VALIDATION TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe("coach-presence schemas", () => {
  test("CoachPresenceMotivationStyleSchema accepts all valid styles", () => {
    for (const style of ["CALM", "FRIENDLY", "STUDY_FOCUSED", "GAME_LIKE", "COACH_LED", "INTENSE"]) {
      expect(() => CoachPresenceMotivationStyleSchema.parse(style)).not.toThrow();
    }
    expect(() => CoachPresenceMotivationStyleSchema.parse("INVALID")).toThrow();
  });

  test("CoachActionIntentSchema accepts all valid intents", () => {
    for (const intent of ["START_SESSION", "START_STUDY_SESSION", "REVIEW_PROGRESS", "TAKE_BREAK", "CONTINUE_PLAN", "REFLECT"]) {
      expect(() => CoachActionIntentSchema.parse(intent)).not.toThrow();
    }
  });

  test("CoachPresenceSurfaceSchema accepts all valid surfaces", () => {
    for (const surface of ["HOME", "SESSION_SETUP", "SESSION_COMPLETION", "CHAT", "RESCUE", "PREMIUM"]) {
      expect(() => CoachPresenceSurfaceSchema.parse(surface)).not.toThrow();
    }
  });

  test("CoachPresenceToneSchema validates complete tone", () => {
    const valid = { motivationStyle: "CALM", personality: "steady", intensity: "low" };
    expect(() => CoachPresenceToneSchema.parse(valid)).not.toThrow();
  });

  test("CoachPresenceToneSchema rejects extra fields", () => {
    const invalid = { motivationStyle: "CALM", personality: "steady", intensity: "low", extra: true };
    expect(() => CoachPresenceToneSchema.parse(invalid)).toThrow();
  });

  test("CoachPresenceVisualStateSchema validates correctly", () => {
    const valid = { element: "LUMINA", level: 1, mood: "FOCUSED", phase: "YOUNG", reaction: "steady" };
    expect(() => CoachPresenceVisualStateSchema.parse(valid)).not.toThrow();
  });

  test("CoachPresenceMemorySummarySchema validates and defaults syncAvailable", () => {
    const parsed = CoachPresenceMemorySummarySchema.parse({
      coachMemoryCount: 0,
      companionMemoryCount: 0,
      latestMemory: null,
    });
    expect(parsed.syncAvailable).toBe(true);
  });

  test("CoachPresenceActionSchema validates intent, label, reason", () => {
    const valid = { intent: "START_SESSION", label: "Start focus", reason: "Ready to go." };
    expect(() => CoachPresenceActionSchema.parse(valid)).not.toThrow();
  });

  test("CoachPresenceProgressInputSchema validates min values", () => {
    const valid = { currentStreakDays: 0, highFocusStreak: 0, totalSessions: 0 };
    expect(() => CoachPresenceProgressInputSchema.parse(valid)).not.toThrow();
  });

  test("CompletionPresenceSummarySchema validates all fields", () => {
    const valid = {
      durationMinutes: 30,
      focusPurityScore: 85,
      isComeback: false,
      isFirstSession: true,
      isHighFocusStreak: false,
      isLowEnergyDay: false,
      isStreakRecovery: false,
      sessionMode: "FOCUS",
      streakDays: 1,
    };
    expect(() => CompletionPresenceSummarySchema.parse(valid)).not.toThrow();
  });

  test("CoachVisibilitySurfaceSchema accepts all valid surfaces", () => {
    for (const surface of ["ONBOARDING", "DAY_0_HOME", "SESSION_SETUP", "ACTIVE_SESSION", "COMPLETION", "RESCUE", "PREMIUM", "RETURN_HOME"]) {
      expect(() => CoachVisibilitySurfaceSchema.parse(surface)).not.toThrow();
    }
  });

  test("CoachVisibilityDecisionSchema accepts all valid decisions", () => {
    for (const decision of ["VISIBLE", "HIDDEN", "SUBTLE_ONE_LINE", "AVAILABLE_ON_REQUEST"]) {
      expect(() => CoachVisibilityDecisionSchema.parse(decision)).not.toThrow();
    }
  });
});
