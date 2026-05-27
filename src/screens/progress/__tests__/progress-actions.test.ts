import { resolveMonthlyReportAction } from "../progress-actions";
import type { FeatureAccess } from "../../../features/liveops-config/feature-access";

const makeFeature = (overrides: Partial<FeatureAccess>): FeatureAccess => ({
  isDegraded: false,
  isTeased: false,
  isUnlocked: false,
  isVisible: false,
  key: "premium_paywall",
  lockedDescription: "Premium is hidden.",
  recommendedUnlockMoment: "Not part of final release",
  releaseState: "final_release_deactivated",
  requiredSessions: 0,
  unlockReason: "Unavailable.",
  ...overrides,
});

describe("resolveMonthlyReportAction", () => {
  it("does not route to paywall when premium is final-release deactivated", () => {
    expect(resolveMonthlyReportAction(makeFeature({}))).toBe("start-session");
  });

  it("routes to paywall only when premium navigation is available", () => {
    expect(
      resolveMonthlyReportAction(
        makeFeature({
          isUnlocked: true,
          isVisible: true,
          releaseState: "final_release_core",
        }),
      ),
    ).toBe("paywall");
  });
});
