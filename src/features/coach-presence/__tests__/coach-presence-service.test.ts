/**
 * Coach Presence — Service Tests (resolveCoachActionIntent & buildCoachPresence)
 */

import {
  buildCoachPresence,
  resolveCoachActionIntent,
} from "../service";

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
