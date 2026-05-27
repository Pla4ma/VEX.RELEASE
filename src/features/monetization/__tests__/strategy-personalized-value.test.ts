import {
  blockedEconomyTerms,
  resolvePremiumStrategy,
  resolvePersonalizedPremium,
  getLanePremiumValue,
  mapProfileToLane,
  type PremiumLane,
} from "./helpers";

describe("premium strategy integration", () => {
  it("hidden strategy when billing not configured", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: false,
      completedSessions: 0,
    });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe("hidden_billing_unavailable");
  });

  it("hidden at session 0 even with billing", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
    });
    expect(strategy.canShowPaywall).toBe(false);
  });

  it("can show after value proof (40 sessions)", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    expect(strategy.canShowPaywall).toBe(true);
    expect(strategy.triggerMoment).toBe("after_value");
  });

  it("premium features exclude economy", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    const copy = [
      strategy.paywallHeadline,
      strategy.paywallBody,
      ...strategy.premiumFeatures,
    ]
      .join(" ")
      .toLowerCase();
    for (const term of blockedEconomyTerms) {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
        "i",
      );
      expect(copy).not.toMatch(positiveUse);
    }
  });

  it("free features confirm core loop stays free", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    const freeCopy = strategy.freeFeatures.join(" ").toLowerCase();
    expect(freeCopy).toContain("focus");
    expect(freeCopy).toContain("session");
    expect(freeCopy).toContain("rescue");
  });
});

describe("personalized premium", () => {
  it("copy excludes economy language across all lanes", () => {
    const lanes = [
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ] as const;
    for (const lane of lanes) {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 10,
        lane,
        primaryGoal: "focus",
        motivationStyle: "calm",
        studyUsageRatio: 0.5,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 10,
      });
      const copy = [
        result.premiumHeadline,
        result.premiumBody,
        ...result.premiumFeatures,
      ]
        .join(" ")
        .toLowerCase();
      for (const term of blockedEconomyTerms) {
        const positiveUse = new RegExp(
          `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
          "i",
        );
        expect(copy).not.toMatch(positiveUse);
      }
    }
  });

  it("game_like lane copy explicitly disclaims no-currency", () => {
    const result = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 10,
      lane: "game_like",
      primaryGoal: "focus",
      motivationStyle: "game_like",
      studyUsageRatio: 0.3,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 5,
      daysSinceOnboarding: 10,
    });
    expect(result.premiumBody.toLowerCase()).toMatch(
      /(?:no|not|without|never).{0,10}(?:coin|gem|currency|shop)/i,
    );
  });

  it("does not paywall basic focus loop", () => {
    const result = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 0,
      primaryGoal: "focus",
      motivationStyle: "calm",
      studyUsageRatio: 0,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 0,
      daysSinceOnboarding: 0,
    });
    expect(result.triggerMoment).toBe("none");
    expect(result.canShowPaywall).toBe(false);
  });
});

describe("premium value map", () => {
  it("has all 4 lanes defined", () => {
    const lanes = Object.keys(PREMIUM_VALUE_MAP) as PremiumLane[];
    expect(lanes).toHaveLength(4);
    expect(lanes).toContain("study");
    expect(lanes).toContain("run");
    expect(lanes).toContain("project");
    expect(lanes).toContain("clean");
  });

  it.each([
    ["study", 4],
    ["run", 4],
    ["project", 4],
    ["clean", 4],
  ] as const)(
    "%s lane has %d features with no economy terms",
    (lane, count) => {
      const value = getLanePremiumValue(lane);
      expect(value.features).toHaveLength(count);
      const featureText = value.features.join(" ").toLowerCase();
      for (const term of blockedEconomyTerms) {
        expect(featureText).not.toMatch(new RegExp(term, "i"));
      }
    },
  );

  it("run lane explicitly states 'no currency'", () => {
    const runValue = getLanePremiumValue("run");
    const allText = [...runValue.features, runValue.headline, runValue.body]
      .join(" ")
      .toLowerCase();
    expect(allText).toMatch(/no currency|no coin|no gem/);
  });

  it.each([
    ["study", "deadline"],
    ["run", "modifier"],
    ["project", "context"],
    ["clean", "calendar"],
  ] as const)("%s lane uniquely mentions %s", (lane, keyword) => {
    const value = getLanePremiumValue(lane);
    const allText = [...value.features, value.headline, value.body]
      .join(" ")
      .toLowerCase();
    expect(allText).toContain(keyword);
  });

  it("mapProfileToLane routes correctly", () => {
    expect(mapProfileToLane("student")).toBe("study");
    expect(mapProfileToLane("study_focused")).toBe("study");
    expect(mapProfileToLane("game_like")).toBe("run");
    expect(mapProfileToLane("competitive")).toBe("run");
    expect(mapProfileToLane("intense")).toBe("run");
    expect(mapProfileToLane("creator")).toBe("project");
    expect(mapProfileToLane("deep_creative")).toBe("project");
    expect(mapProfileToLane("calm")).toBe("clean");
    expect(mapProfileToLane("unknown")).toBe("clean");
  });
});
