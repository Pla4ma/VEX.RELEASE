import { describe, it, expect } from "@jest/globals";
import { resolveAdaptation } from "../adaptation-rules";
import { summarizeSessionBehavior } from "../behavior-summarizer";
import { getCompletionAdaptationCopy } from "../adaptation-visible-copy";
import type { AdaptationRuleInput } from "../session-behavior-signal-schemas";

function emptyInput(overrides: Partial<AdaptationRuleInput> = {}): AdaptationRuleInput {
  return {
    summary: summarizeSessionBehavior([]),
    currentDurationMinutes: 25,
    ...overrides,
  };
}

function makeSignal(
  signalType: string,
  metadata?: Record<string, unknown>,
): { signalType: string; timestamp: number; metadata?: Record<string, unknown> } {
  return {
    signalType,
    timestamp: Date.now() - Math.floor(Math.random() * 1000),
    metadata,
  };
}

// ─── Test Case 1: app_opened_no_session twice → tiny session ───────────
describe("Adaptation Rule 1: repeated no-start → tiny session", () => {
  it("detects 2+ app_opened_no_session but reset by session_started", () => {
    const baseTime = Date.now();
    const signals = [
      { signalType: "app_opened_no_session", timestamp: baseTime - 2000, metadata: { hourOfDay: 10 } },
      { signalType: "app_opened_no_session", timestamp: baseTime - 1000, metadata: { hourOfDay: 11 } },
      { signalType: "session_started", timestamp: baseTime },
    ];
    const summary = summarizeSessionBehavior(signals);

    expect(summary.appOpenedNoSessionCount).toBe(2);
    expect(summary.consecutiveAppOpenedNoSession).toBe(2);
  });

  it("detects 3 consecutive app_opened_no_session → rescue", () => {
    const signals = [
      makeSignal("app_opened_no_session", { hourOfDay: 10 }),
      makeSignal("app_opened_no_session", { hourOfDay: 11 }),
      makeSignal("app_opened_no_session", { hourOfDay: 12 }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));

    expect(result.shouldShowRescue).toBe(true);
    expect(result.shouldReduceFriction).toBe(true);
    expect(result.suggestedDurationMinutes).toBe(10);
    expect(result.userFacingAdaptation).toContain("skipped setup");
  });
});

// ─── Test Case 2: repeated pauses → shorter session ────────────────────
describe("Adaptation Rule 2: repeated pauses → shorter session ", () => {
  it("detects 3+ pauses with 3+ sessions → shorter suggestion", () => {
    const signals = [
      makeSignal("session_started"),
      makeSignal("session_started"),
      makeSignal("session_started"),
      makeSignal("session_paused", { pauseCount: 1 }),
      makeSignal("session_paused", { pauseCount: 1 }),
      makeSignal("session_paused", { pauseCount: 1 }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary, currentDurationMinutes: 25 }));

    expect(result.shouldSuggestShorterSessions).toBe(true);
    expect(result.suggestedDurationMinutes).toBeLessThanOrEqual(15);
    expect(result.userFacingAdaptation).toContain("shorter");
  });
});

// ─── Test Case 3: notification dismissals → quieter nudges ─────────────
describe("Adaptation Rule 3: notification dismissals → quieter", () => {
  it("detects 2+ evening dismissals → quiet evening nudges", () => {
    const signals = [
      makeSignal("notification_dismissed", { dismissedEvening: true }),
      makeSignal("notification_dismissed", { dismissedEvening: true }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));

    expect(result.shouldQuietEveningNudges).toBe(true);
    expect(result.userFacingAdaptation).toContain("evening");
  });
});

// ─── Test Case 4: project handoff → next session from saved move ───────
describe("Adaptation Rule 4: project handoff → next from saved move", () => {
  it("detects handoff saved → use it for next session", () => {
    const signals = [
      makeSignal("project_handoff_saved", { nextActionLabel: "Write conclusion" }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));

    expect(result.shouldUseHandoffForNextSession).toBe(true);
    expect(result.handoffLabel).toBe("Write conclusion");
    expect(result.userFacingAdaptation).toContain("next move");
  });
});

// ─── Test Case 5: study named targets → study review recommendation ────
describe("Adaptation Rule 5: study targets → review recommendation", () => {
  it("detects study target completed → suggests review", () => {
    const signals = [
      makeSignal("study_target_completed", { studyTarget: "Chapter 3" }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));

    expect(result.shouldSuggestStudyReview).toBe(true);
    expect(result.studyReviewTarget).toBe("Chapter 3");
    expect(result.userFacingAdaptation).toContain("Chapter 3");
  });
});

// ─── Test Case 6: cold start → VEX admits learning ─────────────────────
describe("Adaptation Rule 6: cold start → VEX admits learning", () => {
  it("returns low confidence when no signals", () => {
    const signals: Array<{ signalType: string; timestamp: number }> = [];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));

    expect(result.confidence).toBe("low");
    expect(summary.hasEnoughData).toBe(false);
    expect(result.userFacingAdaptation).toBeNull();
  });

  it("completion copy shows cold start for no-signal users", () => {
    const signals: Array<{ signalType: string; timestamp: number }> = [];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary }));
    const copy = getCompletionAdaptationCopy(result);

    expect(copy).toContain("still learning");
  });
});
