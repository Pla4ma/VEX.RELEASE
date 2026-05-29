import { describe, expect, it } from "@jest/globals";
import {
  computeJourneyDay,
  computeJourneyState,
  getDay0SessionSuggestion,
  getDay1ReturnMoment,
} from "../service";
import {
  shouldShowDay3Memory,
  shouldOfferRescue,
  shouldShowPremiumAfterValue,
  getPremiumCopy,
  getPremiumHeadline,
  getRescueCopy,
  getNotificationCopy,
  getModeReturnHook,
  getModeReturnReason,
} from "../retention-guards";
import {
  JourneyDaySchema,
  JourneyPhaseSchema,
  EmotionalStateSchema,
  JourneyHomeMessageSchema,
  JourneySessionSuggestionSchema,
  JourneyMomentSchema,
  JourneyReturnReasonSchema,
  JourneyPremiumMomentSchema,
  JourneyNudgePolicySchema,
} from "../journey-element-schemas";
import {
  LaneCopyMapSchema,
  JourneyDayCopySchema,
  RetentionJourneyCopySchema,
  JourneyStateInputSchema,
  JourneyStateSchema,
} from "../journey-composite-schemas";
import { RETENTION_JOURNEY_COPY } from "../journey-copy";
import { persistJourneyState } from "../repository";

// ── Helpers ────────────────────────────────────────────────────────────
const baseInput = {
  userId: "u1",
  completedSessions: 0,
  hasCompletedToday: false,
  hasSeenMemoryInsight: false,
  rescueCompleted: 0,
  recentDismissals: 0,
  inactivityDays: 0,
  hasInsightReady: false,
};

const ALL_LANES = ["student", "game_like", "deep_creative", "minimal_normal"] as const;

// ── computeJourneyDay ──────────────────────────────────────────────────
describe("computeJourneyDay", () => {
  it("returns 0 for day 0 (negative clamped)", () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: -1, lane: "student" })).toBe(0);
  });

  it("returns 0 for day 0", () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 0, lane: "student" })).toBe(0);
  });

  it("returns the exact day for days 1–6", () => {
    for (let d = 1; d <= 6; d++) {
      expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: d, lane: "student" })).toBe(d);
    }
  });

  it("returns 7 for day 7", () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 7, lane: "student" })).toBe(7);
  });

  it("clamps to 7 for days beyond 7", () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 30, lane: "student" })).toBe(7);
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 999, lane: "student" })).toBe(7);
  });
});

// ── computeJourneyState ────────────────────────────────────────────────
describe("computeJourneyState", () => {
  it("Day 0: onboarding phase, curious, no nudge allowed", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(state.day).toBe(0);
    expect(state.phase).toBe("onboarding");
    expect(state.emotionalState).toBe("curious");
    expect(state.nudgePolicy.canSend).toBe(false);
    expect(state.nudgePolicy.type).toBeNull();
    expect(state.momentType.type).toBe("none");
    expect(state.homeMessage.tone).toBe("warm");
    expect(state.premiumTrigger.trigger).toBe("none");
  });

  it("Day 1: return phase, familiar when completed today", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 1,
      hasCompletedToday: true,
      lane: "student",
    });
    expect(state.phase).toBe("return");
    expect(state.emotionalState).toBe("familiar");
    expect(state.nudgePolicy.type).toBe("gentle_return");
    expect(state.homeMessage.tone).toBe("direct");
  });

  it("Day 1: return phase, curious when not completed today", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 1,
      completedSessions: 0,
      hasCompletedToday: false,
      lane: "student",
    });
    expect(state.emotionalState).toBe("curious");
  });

  it("Day 2: proof phase, validated emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 2,
      completedSessions: 2,
      lane: "student",
    });
    expect(state.phase).toBe("proof");
    expect(state.emotionalState).toBe("validated");
    expect(state.nudgePolicy.type).toBe("proof_nudge");
    expect(state.momentType.type).toBe("proof_signal");
  });

  it("Day 3: insight phase, trusting emotional state, What VEX Learned moment", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      lane: "student",
    });
    expect(state.phase).toBe("insight");
    expect(state.emotionalState).toBe("trusting");
    expect(state.momentType.type).toBe("what_vex_learned");
    expect(state.momentType.requiresSessions).toBe(3);
    expect(state.momentType.canHide).toBe(true);
    expect(state.homeMessage.tone).toBe("humble");
  });

  it("Day 3: nudge type depends on hasInsightReady", () => {
    const withInsight = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      hasInsightReady: true,
      lane: "student",
    });
    expect(withInsight.nudgePolicy.type).toBe("memory_nudge");

    const withoutInsight = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 3,
      completedSessions: 3,
      hasInsightReady: false,
      lane: "student",
    });
    expect(withoutInsight.nudgePolicy.type).toBe("gentle_return");
  });

  it("Day 4: rescue phase when inactive, lane_forming when active", () => {
    const inactive = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      inactivityDays: 1,
      lane: "student",
    });
    expect(inactive.phase).toBe("rescue");
    expect(inactive.emotionalState).toBe("struggling");
    expect(inactive.nudgePolicy.type).toBe("rescue");
    expect(inactive.homeMessage.tone).toBe("encouraging");

    const active = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      inactivityDays: 0,
      recentDismissals: 0,
      lane: "student",
    });
    expect(active.phase).toBe("lane_forming");
    expect(active.emotionalState).toBe("forming");
  });

  it("Day 5: lane_forming phase, forming emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 5,
      completedSessions: 5,
      lane: "student",
    });
    expect(state.phase).toBe("lane_forming");
    expect(state.emotionalState).toBe("forming");
  });

  it("Day 6: weekly_prep phase, ready emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 6,
      completedSessions: 6,
      lane: "student",
    });
    expect(state.phase).toBe("weekly_prep");
    expect(state.emotionalState).toBe("ready");
  });

  it("Day 7: weekly_intelligence phase, valuable emotional state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 7,
      completedSessions: 7,
      lane: "student",
    });
    expect(state.day).toBe(7);
    expect(state.phase).toBe("weekly_intelligence");
    expect(state.emotionalState).toBe("valuable");
    expect(state.momentType.type).toBe("weekly_insight");
    expect(state.momentType.requiresSessions).toBe(5);
    expect(state.momentType.canHide).toBe(true);
    expect(state.homeMessage.tone).toBe("proof");
    expect(state.premiumTrigger.trigger).toBe("deep_insight_tap");
  });

  it("dismissals >= 3 suppress nudge.canSend", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 2,
      completedSessions: 2,
      recentDismissals: 3,
      lane: "student",
    });
    expect(state.nudgePolicy.canSend).toBe(false);
    expect(state.nudgePolicy.condition).toBe("User repeatedly dismissed — paused.");
  });

  it("Day 4: rescue triggers when recentDismissals >= 2", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 4,
      completedSessions: 4,
      recentDismissals: 2,
      inactivityDays: 0,
      lane: "student",
    });
    expect(state.phase).toBe("rescue");
  });

  it("lane-specific copy is populated for all lanes on day 0", () => {
    for (const lane of ALL_LANES) {
      const state = computeJourneyState({
        ...baseInput,
        daysSinceOnboarding: 0,
        lane,
      });
      expect(state.homeMessage.headline.length).toBeGreaterThan(0);
      expect(state.primaryCta.length).toBeGreaterThan(0);
      expect(state.sessionSuggestion.durationMinutes).toBeGreaterThanOrEqual(5);
      expect(state.returnReason.length).toBeGreaterThan(0);
    }
  });

  it("premium trigger copyKey maps correctly per lane", () => {
    const expectedCopyKeys: Record<string, string> = {
      student: "study",
      game_like: "run",
      deep_creative: "project",
      minimal_normal: "clean",
    };
    for (const [lane, expectedKey] of Object.entries(expectedCopyKeys)) {
      const state = computeJourneyState({
        ...baseInput,
        daysSinceOnboarding: 7,
        completedSessions: 7,
        lane: lane as (typeof ALL_LANES)[number],
      });
      expect(state.premiumTrigger.copyKey).toBe(expectedKey);
    }
  });
});

// ── getDay0SessionSuggestion ───────────────────────────────────────────
describe("getDay0SessionSuggestion", () => {
  it("returns student session suggestion with correct type", () => {
    const suggestion = getDay0SessionSuggestion("student");
    expect(suggestion.durationMinutes).toBeGreaterThan(0);
    expect(suggestion.type).toBe("STUDY");
    expect(suggestion.taskPrompt.length).toBeGreaterThan(0);
  });

  it("returns game_like session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("game_like");
    expect(suggestion.type).toBe("SPRINT");
    expect(suggestion.taskPrompt.length).toBeGreaterThan(0);
  });

  it("returns deep_creative session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("deep_creative");
    expect(suggestion.type).toBe("DEEP_WORK");
  });

  it("returns minimal_normal session suggestion", () => {
    const suggestion = getDay0SessionSuggestion("minimal_normal");
    expect(suggestion.type).toBe("LIGHT_FOCUS");
    expect(suggestion.durationMinutes).toBeGreaterThan(0);
  });
});

// ── getDay1ReturnMoment ────────────────────────────────────────────────
describe("getDay1ReturnMoment", () => {
  it("returns headline, cta, and sessionMinutes for each lane", () => {
    for (const lane of ALL_LANES) {
      const moment = getDay1ReturnMoment(lane);
      expect(moment.headline.length).toBeGreaterThan(0);
      expect(moment.cta.length).toBeGreaterThan(0);
      expect(moment.sessionMinutes).toBeGreaterThanOrEqual(5);
    }
  });

  it("returns distinct headlines per lane", () => {
    const headlines = ALL_LANES.map((lane) => getDay1ReturnMoment(lane).headline);
    const unique = new Set(headlines);
    expect(unique.size).toBe(ALL_LANES.length);
  });
});

// ── shouldShowDay3Memory ───────────────────────────────────────────────
describe("shouldShowDay3Memory", () => {
  it("returns true when day >= 3, sessions >= 3, and not seen", () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 3, hasSeenMemoryInsight: false }),
    ).toBe(true);
  });

  it("returns true on later days too", () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 5, completedSessions: 10, hasSeenMemoryInsight: false }),
    ).toBe(true);
  });

  it("returns false when already seen", () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 3, hasSeenMemoryInsight: true }),
    ).toBe(false);
  });

  it("returns false when sessions < 3", () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 2, hasSeenMemoryInsight: false }),
    ).toBe(false);
  });

  it("returns false when days < 3", () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 2, completedSessions: 5, hasSeenMemoryInsight: false }),
    ).toBe(false);
  });
});

// ── shouldOfferRescue ──────────────────────────────────────────────────
describe("shouldOfferRescue", () => {
  const baseRescue = {
    daysSinceOnboarding: 4,
    completedSessions: 3,
    hasCompletedToday: false,
    inactivityDays: 0,
    abandonedSessionExists: false,
    openedAppNoStart: false,
    sessionStartedQuitEarly: false,
    recentDismissals: 0,
    homeCtaDismissals: 0,
    userTooBig: false,
  };

  it("returns true with inactivity", () => {
    expect(shouldOfferRescue({ ...baseRescue, inactivityDays: 1 })).toBe(true);
  });

  it("returns true with abandoned session", () => {
    expect(shouldOfferRescue({ ...baseRescue, abandonedSessionExists: true })).toBe(true);
  });

  it("returns true with session started and quit early", () => {
    expect(shouldOfferRescue({ ...baseRescue, sessionStartedQuitEarly: true })).toBe(true);
  });

  it("returns true with opened app no start", () => {
    expect(shouldOfferRescue({ ...baseRescue, openedAppNoStart: true })).toBe(true);
  });

  it("returns true with recentDismissals >= 2", () => {
    expect(shouldOfferRescue({ ...baseRescue, recentDismissals: 2 })).toBe(true);
  });

  it("returns true with homeCtaDismissals >= 2", () => {
    expect(shouldOfferRescue({ ...baseRescue, homeCtaDismissals: 2 })).toBe(true);
  });

  it("returns true with userTooBig", () => {
    expect(shouldOfferRescue({ ...baseRescue, userTooBig: true })).toBe(true);
  });

  it("returns false when completedSessions is 0", () => {
    expect(shouldOfferRescue({ ...baseRescue, completedSessions: 0, inactivityDays: 1 })).toBe(false);
  });

  it("returns false when completed today", () => {
    expect(shouldOfferRescue({ ...baseRescue, hasCompletedToday: true, inactivityDays: 1 })).toBe(false);
  });

  it("returns false when no friction signals present", () => {
    expect(shouldOfferRescue(baseRescue)).toBe(false);
  });
});

// ── shouldShowPremiumAfterValue ────────────────────────────────────────
describe("shouldShowPremiumAfterValue", () => {
  it("returns true on day 7+ with weekly insight seen", () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 7, hasSeenWeeklyInsight: true })).toBe(true);
  });

  it("returns true on day 10 with weekly insight seen", () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 10, hasSeenWeeklyInsight: true })).toBe(true);
  });

  it("returns false when insight not seen", () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 7, hasSeenWeeklyInsight: false })).toBe(false);
  });

  it("returns false when day < 7", () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 6, hasSeenWeeklyInsight: true })).toBe(false);
  });
});

// ── getPremiumCopy ─────────────────────────────────────────────────────
describe("getPremiumCopy", () => {
  it("returns lane-specific copy for each lane", () => {
    for (const lane of ALL_LANES) {
      const copy = getPremiumCopy(lane);
      expect(copy.length).toBeGreaterThan(0);
    }
  });

  it("student copy mentions Study Intelligence", () => {
    expect(getPremiumCopy("student")).toContain("Study Intelligence");
  });

  it("game_like copy mentions Run Intelligence", () => {
    expect(getPremiumCopy("game_like")).toContain("Run Intelligence");
  });

  it("deep_creative copy mentions Project Memory", () => {
    expect(getPremiumCopy("deep_creative")).toContain("Project Memory");
  });

  it("minimal_normal copy mentions Focus Intelligence", () => {
    expect(getPremiumCopy("minimal_normal")).toContain("Focus Intelligence");
  });
});

// ── getPremiumHeadline ─────────────────────────────────────────────────
describe("getPremiumHeadline", () => {
  it("returns headline for each lane", () => {
    for (const lane of ALL_LANES) {
      const headline = getPremiumHeadline(lane);
      expect(headline.length).toBeGreaterThan(0);
    }
  });

  it("returns distinct headlines per lane", () => {
    const headlines = ALL_LANES.map((l) => getPremiumHeadline(l));
    expect(new Set(headlines).size).toBe(ALL_LANES.length);
  });
});

// ── getRescueCopy ──────────────────────────────────────────────────────
describe("getRescueCopy", () => {
  it("returns headline, body, sessionMinutes, and actionLabel for each lane", () => {
    for (const lane of ALL_LANES) {
      const copy = getRescueCopy(lane);
      expect(copy.headline.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
      expect(copy.sessionMinutes).toBeGreaterThan(0);
      expect(copy.actionLabel.length).toBeGreaterThan(0);
    }
  });

  it("student rescue has 8 minutes", () => {
    expect(getRescueCopy("student").sessionMinutes).toBe(8);
  });

  it("game_like rescue has 10 minutes", () => {
    expect(getRescueCopy("game_like").sessionMinutes).toBe(10);
  });

  it("deep_creative rescue has 7 minutes", () => {
    expect(getRescueCopy("deep_creative").sessionMinutes).toBe(7);
  });

  it("minimal_normal rescue has 5 minutes", () => {
    expect(getRescueCopy("minimal_normal").sessionMinutes).toBe(5);
  });
});

// ── getNotificationCopy ────────────────────────────────────────────────
describe("getNotificationCopy", () => {
  it("returns title and body for each lane", () => {
    for (const lane of ALL_LANES) {
      const copy = getNotificationCopy(lane);
      expect(copy.title.length).toBeGreaterThan(0);
      expect(copy.body.length).toBeGreaterThan(0);
    }
  });

  it("returns distinct titles per lane", () => {
    const titles = ALL_LANES.map((l) => getNotificationCopy(l).title);
    expect(new Set(titles).size).toBe(ALL_LANES.length);
  });
});

// ── getModeReturnHook / getModeReturnReason ────────────────────────────
describe("getModeReturnHook", () => {
  it("returns non-empty string for each lane", () => {
    for (const lane of ALL_LANES) {
      expect(getModeReturnHook(lane).length).toBeGreaterThan(0);
    }
  });

  it("returns distinct hooks per lane", () => {
    const hooks = ALL_LANES.map((l) => getModeReturnHook(l));
    expect(new Set(hooks).size).toBe(ALL_LANES.length);
  });
});

describe("getModeReturnReason", () => {
  it("returns non-empty string for each lane", () => {
    for (const lane of ALL_LANES) {
      expect(getModeReturnReason(lane).length).toBeGreaterThan(0);
    }
  });

  it("returns distinct reasons per lane", () => {
    const reasons = ALL_LANES.map((l) => getModeReturnReason(l));
    expect(new Set(reasons).size).toBe(ALL_LANES.length);
  });
});

// ── Schema validation ──────────────────────────────────────────────────
describe("journey-element-schemas", () => {
  it("JourneyDaySchema accepts 0–7 and rejects 8", () => {
    expect(JourneyDaySchema.safeParse(0).success).toBe(true);
    expect(JourneyDaySchema.safeParse(7).success).toBe(true);
    expect(JourneyDaySchema.safeParse(8).success).toBe(false);
  });

  it("JourneyPhaseSchema accepts all valid phases", () => {
    const phases = ["onboarding", "return", "proof", "insight", "rescue", "lane_forming", "weekly_prep", "weekly_intelligence"];
    for (const p of phases) {
      expect(JourneyPhaseSchema.safeParse(p).success).toBe(true);
    }
    expect(JourneyPhaseSchema.safeParse("invalid").success).toBe(false);
  });

  it("EmotionalStateSchema accepts all valid states", () => {
    const states = ["curious", "familiar", "validated", "trusting", "struggling", "forming", "ready", "valuable"];
    for (const s of states) {
      expect(EmotionalStateSchema.safeParse(s).success).toBe(true);
    }
  });

  it("JourneyHomeMessageSchema validates correct shape", () => {
    const result = JourneyHomeMessageSchema.safeParse({
      headline: "Test headline",
      subtext: "Test subtext",
      tone: "warm",
    });
    expect(result.success).toBe(true);
  });

  it("JourneyHomeMessageSchema rejects empty headline", () => {
    const result = JourneyHomeMessageSchema.safeParse({
      headline: "",
      subtext: "Test",
      tone: "warm",
    });
    expect(result.success).toBe(false);
  });

  it("JourneyNudgePolicySchema accepts nullable type", () => {
    const result = JourneyNudgePolicySchema.safeParse({
      canSend: false,
      type: null,
      condition: "Day 0: no unsolicited notification.",
    });
    expect(result.success).toBe(true);
  });

  it("JourneyPremiumMomentSchema validates correct shape", () => {
    const result = JourneyPremiumMomentSchema.safeParse({
      day: 7,
      trigger: "deep_insight_tap",
      copyKey: "study",
    });
    expect(result.success).toBe(true);
  });

  it("JourneyMomentSchema validates correct shape", () => {
    const result = JourneyMomentSchema.safeParse({
      type: "what_vex_learned",
      requiresSessions: 3,
      canHide: true,
    });
    expect(result.success).toBe(true);
  });
});

// ── Composite schemas ──────────────────────────────────────────────────
describe("journey-composite-schemas", () => {
  it("JourneyStateInputSchema validates correct shape", () => {
    const result = JourneyStateInputSchema.safeParse({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(result.success).toBe(true);
  });

  it("JourneyStateInputSchema rejects missing fields", () => {
    const result = JourneyStateInputSchema.safeParse({ userId: "u1" });
    expect(result.success).toBe(false);
  });

  it("LaneCopyMapSchema validates correct shape", () => {
    const result = LaneCopyMapSchema.safeParse({
      student: "test",
      game_like: "test",
      deep_creative: "test",
      minimal_normal: "test",
    });
    expect(result.success).toBe(true);
  });

  it("JourneyStateSchema validates full computed state", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    const result = JourneyStateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });
});

// ── RETENTION_JOURNEY_COPY ─────────────────────────────────────────────
describe("RETENTION_JOURNEY_COPY", () => {
  it("has copy for all 8 days (day0–day7)", () => {
    for (let d = 0; d <= 7; d++) {
      expect(RETENTION_JOURNEY_COPY[`day${d}` as keyof typeof RETENTION_JOURNEY_COPY]).toBeDefined();
    }
  });

  it("each day has lane-specific homeMessage for all lanes", () => {
    for (let d = 0; d <= 7; d++) {
      const dayCopy = RETENTION_JOURNEY_COPY[`day${d}` as keyof typeof RETENTION_JOURNEY_COPY];
      for (const lane of ALL_LANES) {
        expect(dayCopy.homeMessage[lane]).toBeDefined();
        expect(dayCopy.homeMessage[lane].length).toBeGreaterThan(0);
      }
    }
  });
});

// ── persistJourneyState (no-op) ────────────────────────────────────────
describe("persistJourneyState", () => {
  it("is a no-op that returns void", () => {
    const state = computeJourneyState({
      ...baseInput,
      daysSinceOnboarding: 0,
      lane: "student",
    });
    expect(() => persistJourneyState(state)).not.toThrow();
  });
});
