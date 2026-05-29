import { describe, it, expect } from "@jest/globals";
import { resolveAdaptation } from "../adaptation-rules";
import { summarizeSessionBehavior } from "../behavior-summarizer";
import {
  getAdaptationProof,
  getRescueAdaptationCopy,
  getCompletionAdaptationCopy,
  getSetupAdaptationCopy,
  getWeeklyAdaptationCopy,
  getHomeNextActionAdaptationCopy,
  getNotificationAdaptationCopy,
} from "../adaptation-visible-copy";
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

// ─── Test Case 7: deleted/hidden memory → not reused ───────────────────
describe("Adaptation Rule 7: deleted signals do not persist", () => {
  it("summarizeSessionBehavior ignores unknown signals", () => {
    const signals = [
      makeSignal("unknown_signal_type"),
    ];
    const summary = summarizeSessionBehavior(signals);

    expect(summary.totalSessionsStarted).toBe(0);
    expect(summary.totalSessionsCompleted).toBe(0);
  });

  it("only recognized signal types affect summary", () => {
    const signals = [
      makeSignal("session_started"),
      makeSignal("unknown_signal_type"),
      makeSignal("session_completed"),
    ];
    const summary = summarizeSessionBehavior(signals);

    expect(summary.totalSessionsStarted).toBe(1);
    expect(summary.totalSessionsCompleted).toBe(1);
  });
});

// ─── Test Case 8: mode change → copy adapts ────────────────────────────
describe("Adaptation Rule 8: mode change → copy adapts", () => {
  it("detects Sprint → Focus mode change → reduces game language", () => {
    const signals = [
      makeSignal("session_started"),
      makeSignal("mode_changed", { previousMode: "SPRINT", newMode: "FOCUS" }),
    ];
    const summary = summarizeSessionBehavior(signals);
    const result = resolveAdaptation(emptyInput({ summary, currentMode: "FOCUS" }));

    expect(result.modeChangeDetected).toBe(true);
    expect(result.fromMode).toBe("SPRINT");
    expect(result.toMode).toBe("FOCUS");
    expect(result.shouldReduceGameLanguage).toBe(true);
    expect(result.userFacingAdaptation).toContain("game-like");
  });
});

// ─── User-facing copy integration tests ────────────────────────────────
describe("adaptation-visible-copy", () => {
  const signals = [
    makeSignal("app_opened_no_session"),
    makeSignal("app_opened_no_session"),
    makeSignal("app_opened_no_session"),
  ];
  const summary = summarizeSessionBehavior(signals);
  const adaptation = resolveAdaptation(emptyInput({ summary }));

  it("getAdaptationProof returns user-facing text", () => {
    expect(getAdaptationProof(adaptation)).toContain("skipped");
  });

  it("getSetupAdaptationCopy returns friction reduction message", () => {
    expect(getSetupAdaptationCopy(adaptation)).toContain("skipped");
  });

  it("getCompletionAdaptationCopy returns adaptation or cold-start", () => {
    const copy = getCompletionAdaptationCopy(adaptation);
    expect(copy.length).toBeGreaterThan(0);
  });

  it("getRescueAdaptationCopy maps triggers to copy", () => {
    expect(getRescueAdaptationCopy("abandoned_session")).toContain("shorter");
    expect(getRescueAdaptationCopy("opened_app_no_start")).toContain("tiny");
    expect(getRescueAdaptationCopy("repeated_dismissals")).toContain("smaller");
    expect(getRescueAdaptationCopy("unknown_trigger")).toBeNull();
  });

  it("getHomeNextActionAdaptationCopy returns handoff label", () => {
    const handoffSignals = [
      makeSignal("project_handoff_saved", { nextActionLabel: "Fix auth bug" }),
    ];
    const handoffSummary = summarizeSessionBehavior(handoffSignals);
    const handoffAdaptation = resolveAdaptation(emptyInput({ summary: handoffSummary }));
    const copy = getHomeNextActionAdaptationCopy(handoffAdaptation);
    expect(copy).toContain("Fix auth bug");
  });

  it("getWeeklyAdaptationCopy returns null for cold start", () => {
    const coldSummary = summarizeSessionBehavior([]);
    const coldAdaptation = resolveAdaptation(emptyInput({ summary: coldSummary }));
    expect(getWeeklyAdaptationCopy(coldAdaptation)).toBeNull();
  });

  it("getNotificationAdaptationCopy returns evening notice", () => {
    const eveningSignals = [
      makeSignal("notification_dismissed", { dismissedEvening: true }),
      makeSignal("notification_dismissed", { dismissedEvening: true }),
    ];
    const eveningSummary = summarizeSessionBehavior(eveningSignals);
    const eveningAdaptation = resolveAdaptation(emptyInput({ summary: eveningSummary }));
    expect(getNotificationAdaptationCopy(eveningAdaptation)).toContain("evening");
  });
});

// ─── summarizeSessionBehavior edge cases ───────────────────────────────
describe("summarizeSessionBehavior", () => {
  it("calculates average duration from completed sessions", () => {
    const baseTime = Date.now();
    const signals = [
      { signalType: "session_completed", timestamp: baseTime - 2000, metadata: { durationSeconds: 600 } },
      { signalType: "session_completed", timestamp: baseTime - 1000, metadata: { durationSeconds: 1200 } },
      { signalType: "session_completed", timestamp: baseTime, metadata: { durationSeconds: 1800 } },
    ];
    const summary = summarizeSessionBehavior(signals);
    expect(summary.averageDurationSeconds).toBe(1200);
    expect(summary.recentDurationsSeconds).toEqual([600, 1200, 1800]);
  });

  it("detects insufficient data correctly", () => {
    const noSignals = summarizeSessionBehavior([]);
    expect(noSignals.hasEnoughData).toBe(false);
    expect(noSignals.signalCount).toBe(0);

    const fewSignals = summarizeSessionBehavior([
      makeSignal("app_opened_no_session"),
    ]);
    expect(fewSignals.hasEnoughData).toBe(false);

    const enoughSessions = summarizeSessionBehavior([
      makeSignal("session_started"),
      makeSignal("session_started"),
    ]);
    expect(enoughSessions.hasEnoughData).toBe(true);
  });

  it("handles rescue start/complete tracking", () => {
    const signals = [
      makeSignal("rescue_offered"),
      makeSignal("rescue_started"),
      makeSignal("rescue_started"),
      makeSignal("rescue_completed"),
    ];
    const summary = summarizeSessionBehavior(signals);
    expect(summary.rescueStartedCount).toBe(2);
    expect(summary.rescueCompletedCount).toBe(1);
  });

  it("handles reflection tracking", () => {
    const signals = [
      makeSignal("reflection_saved"),
      makeSignal("reflection_saved"),
      makeSignal("reflection_saved"),
    ];
    const summary = summarizeSessionBehavior(signals);
    expect(summary.reflectionCount).toBe(3);
  });
});
