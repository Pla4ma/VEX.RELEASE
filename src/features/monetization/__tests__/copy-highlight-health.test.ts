import {
  blockedEconomyTerms,
  durableTerms,
  resolvePremiumTiming,
  resolvePremiumStrategy,
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  FEATURE_HIGHLIGHT_MAP,
} from "./helpers";

describe("premium copy — no economy language", () => {
  const allCopy = [
    VALUE_PROPOSITION,
    FREE_BOUNDARY_COPY,
    PREMIUM_BOUNDARY_COPY,
    ...PREMIUM_FEATURES.flatMap((f) => [f.title, f.description]),
    ...Object.values(FEATURE_HIGHLIGHT_MAP).flatMap((f) => [
      f.title,
      f.benefit,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  it.each(blockedEconomyTerms)(
    'excludes "%s" from all premium copy',
    (term) => {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
        "i",
      );
      expect(allCopy).not.toMatch(positiveUse);
    },
  );

  it("includes durable personalization language", () => {
    const durableCount = durableTerms.filter((t) =>
      allCopy.includes(t.toLowerCase()),
    ).length;
    expect(durableCount).toBeGreaterThanOrEqual(3);
  });

  it("mentions no coins, no gems explicitly", () => {
    expect(allCopy).toContain("no coin");
    expect(allCopy).toContain("no gem");
  });

  it("free boundary copy asserts core loop stays free forever", () => {
    expect(FREE_BOUNDARY_COPY).toMatch(/free.*(forever|always|stay)/i);
    expect(FREE_BOUNDARY_COPY).toContain("Core sessions");
  });
});

describe("paywall feature highlight map", () => {
  it("uses durable-lane keys not old economy keys", () => {
    const keys = Object.keys(FEATURE_HIGHLIGHT_MAP);
    expect(keys).toContain("deep_coach_memory");
    expect(keys).toContain("progress_intelligence");
    expect(keys).toContain("advanced_study_os");
    expect(keys).toContain("recovery_planning");
    expect(keys).toContain("premium_session_modes");
    expect(keys).toContain("visual_identity");
    expect(keys).not.toContain("streak_freeze");
    expect(keys).not.toContain("xp_boost");
    expect(keys).not.toContain("season_premium_rewards");
    expect(keys).not.toContain("ai_coach_full_access");
    expect(keys).not.toContain("advanced_analytics");
    expect(keys).not.toContain("content_study");
  });

  it("every highlight entry has durable-focused benefit copy", () => {
    for (const highlight of Object.values(FEATURE_HIGHLIGHT_MAP)) {
      const copy = [highlight.title, highlight.benefit].join(" ").toLowerCase();
      for (const term of blockedEconomyTerms) {
        expect(copy).not.toMatch(new RegExp(term, "i"));
      }
    }
  });
});

describe("RevenueCat health gate", () => {
  it("premium timing returns blocked_unhealthy when RC is unhealthy", () => {
    const result = resolvePremiumTiming({
      completedSessions: 100,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.tier).toBe("blocked_unhealthy");
  });

  it("premium timing blocks CTA render when unhealthy", () => {
    const result = resolvePremiumTiming({
      completedSessions: 100,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.canRenderPremiumCTA).toBe(false);
    expect(result.canShowCompletionMoment).toBe(false);
  });

  it("premium strategy hidden when billing not configured", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: false,
      completedSessions: 100,
    });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe("hidden_billing_unavailable");
  });
});
