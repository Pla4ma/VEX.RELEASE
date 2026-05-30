import { getPhase3VerificationSummary } from "../verification";

describe("getPhase3VerificationSummary", () => {
  it("returns passed=true when all checks pass", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });
  it("returns passed=true for empty results", () => {
    const summary = getPhase3VerificationSummary([]);
    expect(summary.passed).toBe(true);
    expect(summary.failedFeatures).toEqual([]);
  });
  it("fails when isHidden is false", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain("rivals");
  });
  it("fails when hasNoTab is false", () => {
    const results = [
      {
        feature: "rankings" as const,
        isHidden: true,
        hasNoTab: false,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toContain("rankings");
  });
  it("fails when hasNoHomeCard is false", () => {
    const results = [
      {
        feature: "wagers" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: false,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });
  it("fails when hasNoSettingsEntry is false", () => {
    const results = [
      {
        feature: "gems_prominent" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: false,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });
  it("fails when hasSafeFallback is false", () => {
    const results = [
      {
        feature: "squads" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: false,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });
  it("fails when analyticsBlocked is false", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: false,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
  });
  it("collects multiple failed features", () => {
    const results = [
      {
        feature: "rivals" as const,
        isHidden: false,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
      {
        feature: "rankings" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: false,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.passed).toBe(false);
    expect(summary.failedFeatures).toEqual(["rivals", "rankings"]);
  });
  it("preserves the results array reference", () => {
    const results = [
      {
        feature: "squads" as const,
        isHidden: true,
        hasNoTab: true,
        hasNoHomeCard: true,
        hasNoSettingsEntry: true,
        hasSafeFallback: true,
        analyticsBlocked: true,
      },
    ];
    const summary = getPhase3VerificationSummary(results);
    expect(summary.results).toBe(results);
  });
});
