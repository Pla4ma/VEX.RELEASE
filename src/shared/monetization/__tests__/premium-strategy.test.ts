import { resolvePremiumStrategy } from "../premium-strategy";

describe("resolvePremiumStrategy", () => {
  it("keeps the basic execution loop free", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 7,
    });

    expect(strategy.freeFeatures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Start and complete"),
        expect.stringContaining("rhythm and progress"),
        expect.stringContaining("Coach Presence"),
        expect.stringContaining("lane personalization"),
      ]),
    );
  });

  it("hides premium when billing is not configured", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: false,
      completedSessions: 10,
    });

    expect(strategy.triggerMoment).toBe("hidden_billing_unavailable");
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.noFakeBillingChecklist).toContain(
      "Do not render purchasable plans without RevenueCat packages.",
    );
  });

  it("uses premium copy about deeper personalization", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 7,
      highIntentAction: "weekly_intelligence",
    });

    expect(strategy.canShowPaywall).toBe(true);
    expect(strategy.paywallHeadline).toContain("execution system");
    expect(strategy.paywallBody).toContain("deeper memory");
    expect(strategy.paywallBody).not.toMatch(/upgrade now|unlock now/i);
  });

  it("does not show premium before 40 sessions", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 25,
    });
    expect(strategy.triggerMoment).toBe("none");
    expect(strategy.canShowPaywall).toBe(false);
  });

  it("shows premium after 40 sessions", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    expect(strategy.triggerMoment).toBe("after_value");
    expect(strategy.canShowPaywall).toBe(true);
  });

  it("triggers on high-intent action only after soft-tease threshold (session 5)", () => {
    // Below session 5: hidden even with highIntentAction
    const early = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 1,
      highIntentAction: "advanced_study",
    });
    expect(early.triggerMoment).toBe("none");
    expect(early.canShowPaywall).toBe(false);

    // At session 5: highIntentAction triggers paywall
    const at5 = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 5,
      highIntentAction: "advanced_study",
    });
    expect(at5.triggerMoment).toBe("advanced_study");
    expect(at5.canShowPaywall).toBe(true);
  });

  it("blocks premium on Day 0 and after repeated dismissals", () => {
    expect(
      resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
        highIntentAction: "advanced_study",
      }).canShowPaywall,
    ).toBe(false);

    expect(
      resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 10,
        highIntentAction: "weekly_intelligence",
        paywallDismissals: 2,
      }).triggerMoment,
    ).toBe("none");
  });

  it("does not paywall basic sessions", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 10,
    });
    expect(strategy.freeFeatures).toEqual(
      expect.arrayContaining([expect.stringContaining("Start and complete")]),
    );
  });

  it("references session data when evidence is provided", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 45,
      sessionEvidence: {
        completedSessions: 42,
        focusHours: 15,
        consistencyRate: 0.8,
        bestWindow: "morning",
        bestDay: "weekday",
      },
    });
    expect(strategy.paywallBody).toMatch(/42 sessions/);
    expect(strategy.paywallBody).toMatch(/15h/);
    expect(strategy.paywallBody).toContain("mornings");
    expect(strategy.paywallBody).toContain("weekdays");
    expect(strategy.paywallBody).toContain("Premium adds");
  });

  it("falls back to generic when evidence is insufficient (<5 sessions)", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 45,
      sessionEvidence: {
        completedSessions: 2,
        focusHours: 0.5,
        consistencyRate: 0.5,
      },
    });
    expect(strategy.paywallBody).toContain("VEX Premium adds");
    expect(strategy.paywallBody).not.toMatch(/Based on/);
    expect(strategy.paywallBody).not.toMatch(/Across \d/);
  });

  it("falls back to generic when no evidence provided", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 45,
    });
    expect(strategy.paywallBody).toContain("VEX Premium adds");
    expect(strategy.paywallBody).not.toMatch(/Based on/);
    expect(strategy.paywallBody).not.toMatch(/Across \d/);
  });

  it("has free vs pro matrix", () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 10,
    });
    expect(strategy.freeVsProMatrix).toBeDefined();
    expect(strategy.freeVsProMatrix.length).toBeGreaterThanOrEqual(5);
    strategy.freeVsProMatrix.forEach((row) => {
      expect(row.free).toBeTruthy();
      expect(row.pro).toBeTruthy();
    });
  });
});
