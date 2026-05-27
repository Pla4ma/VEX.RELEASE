import {
  getEntitlementAccessState,
  hasPremiumEntitlement,
  isPremiumEntitlementIdentifier,
} from "../entitlements";
import type { EntitlementInfo } from "../revenuecat-types";

function entitlement(
  identifier: string,
  isActive: boolean,
  billingIssueDetectedAt: string | null = null,
): EntitlementInfo {
  return {
    identifier,
    isActive,
    willRenew: true,
    latestPurchaseDate: "2026-04-30T00:00:00.000Z",
    originalPurchaseDate: "2026-04-30T00:00:00.000Z",
    expirationDate: null,
    store: "APP_STORE",
    productIdentifier: "vex.premium.monthly",
    isSandbox: true,
    unsubscribeDetectedAt: null,
    billingIssueDetectedAt,
  };
}

describe("monetization entitlements", () => {
  it("treats known premium identifiers as premium access", () => {
    expect(isPremiumEntitlementIdentifier("premium")).toBe(true);
    expect(isPremiumEntitlementIdentifier("vex-premium")).toBe(true);
    expect(hasPremiumEntitlement([entitlement("premium_access", true)])).toBe(
      true,
    );
  });

  it("does not unlock premium from unrelated active entitlements", () => {
    const state = getEntitlementAccessState([
      entitlement("extra_gems_pack", true),
    ]);

    expect(state.isPremium).toBe(false);
    expect(state.hasActiveEntitlements).toBe(true);
    expect(state.unknownActiveEntitlementIds).toEqual(["extra_gems_pack"]);
  });

  it("does not unlock premium from inactive premium entitlements", () => {
    const state = getEntitlementAccessState([entitlement("premium", false)]);

    expect(state.isPremium).toBe(false);
    expect(state.premiumEntitlementIds).toEqual([]);
  });

  it("surfaces billing issues without crashing access checks", () => {
    const state = getEntitlementAccessState([
      entitlement("vex_premium", true, "2026-04-30T00:00:00.000Z"),
    ]);

    expect(state.isPremium).toBe(true);
    expect(state.hasBillingIssue).toBe(true);
  });
});
