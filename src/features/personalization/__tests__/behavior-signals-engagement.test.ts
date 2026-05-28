import { describe, it, expect } from "@jest/globals";
import { BehaviorSignalSchema } from "../behavior-signal-schemas";
import { resolveUserBehaviorSignals } from "../behavior-resolver";
import { makeSignal, makeSessions, baseInput } from "./behavior-test-helpers";

describe("resolveUserBehaviorSignals – engagement and edge cases", () => {
  it("premium attempt after 5 sessions → premium_moment appears", () => {
    const signals = [
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
    ];
    const sessions = makeSessions({ completedSessions: 7 });
    const result = resolveUserBehaviorSignals({
      recentSignals: signals,
      recentSessions: sessions,
      firstWeekExperience: { stage: "POST_DAY_7", isDayZero: false },
    });
    expect(result.highIntentPremiumActions).toContain("premium_moment");
    expect(result.premiumFeatureAttempts.length).toBeGreaterThan(0);
  });

  it("does not allow premium moment with insufficient sessions", () => {
    const signals = [
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
      makeSignal({
        surfaceKey: "premium_tease",
        signalType: "premium_gate_clicked",
        source: "premium_gate",
      }),
    ];
    const sessions = makeSessions({ completedSessions: 3 });
    const result = resolveUserBehaviorSignals({
      recentSignals: signals,
      recentSessions: sessions,
      firstWeekExperience: { stage: "POST_DAY_7", isDayZero: false },
    });
    expect(result.highIntentPremiumActions).toHaveLength(0);
  });

  it("day zero user → all signals are zeroed out", () => {
    const signals = [
      makeSignal({
        surfaceKey: "boss_compact",
        signalType: "surface_dismissed",
        source: "home_content",
      }),
    ];
    const result = resolveUserBehaviorSignals({
      recentSignals: signals,
      recentSessions: makeSessions({
        completedSessions: 0,
        totalSessions: 0,
        studySessions: 0,
      }),
      firstWeekExperience: { stage: "DAY_0_NOT_STARTED", isDayZero: true },
    });
    expect(result.ignoredFeatures).toHaveLength(0);
    expect(result.bossEngagement).toBe("none");
    expect(result.highIntentPremiumActions).toHaveLength(0);
  });

  it("no sensitive content in signals", () => {
    const signals = [
      makeSignal({
        surfaceKey: "study_layer",
        signalType: "surface_clicked",
        source: "study_layer",
      }),
    ];
    const result = resolveUserBehaviorSignals({
      ...baseInput,
      recentSignals: signals,
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/password|secret|token|api.?key/i);
    expect(serialized).not.toMatch(
      /content|message.*body|ai.*message|document/i,
    );
  });

  it("accepts 2026 personalization signal taxonomy", () => {
    const result = BehaviorSignalSchema.parse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      surfaceKey: "rescue_cta",
      signalType: "rescue_started",
      source: "session_completion",
      timestamp: Date.now(),
      metadata: { sessionCount: 3 },
    });

    expect(result.signalType).toBe("rescue_started");
  });
});
