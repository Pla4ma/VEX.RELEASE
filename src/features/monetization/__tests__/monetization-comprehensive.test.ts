import {
  TIERS,
  FREE_FEATURE_STRS,
  PREMIUM_FEATURE_STRS,
  hasFeature,
  getMaxActiveStudyPlans,
} from "../tier-definitions";
import {
  calculateLadderPosition,
  getUpgradeMessage,
  getPaywallTiming,
  calculateUpgradeDiscount,
  formatTierPrice,
  getFeatureComparison,
  TIER_CONFIGS,
} from "../value-ladder";
import {
  createInitialState,
  transitionPaywallState,
  getPaywallStateMessage,
  canDismissPaywall,
  canPurchase,
  isTerminalState,
  getRetryAction,
  createPaywallTrigger,
} from "../paywall-state-machine";
import {
  isPurchaseValid,
  getRemainingDays,
  getActiveTrustSignals,
  calculatePriceTrustScore,
  getPriceExplanation,
  verifyPurchaseHash,
  isSuspiciousPurchase,
  getRefundEligibility,
  TRUST_SIGNALS,
  PurchaseTrustError,
} from "../purchase-trust";
import {
  shouldShowPaywall,
  getFeatureGate,
  canCreateStudyPlan,
  getRemainingStudyPlanSlots,
  FEATURE_GATES,
} from "../PremiumTierSystem";
import {
  recordPaywallShow,
  getPaywallHistory,
  canShowPaywall,
  shouldPreventPaywall,
  evaluateTrigger,
  getPaywallCooldownRemaining,
  selectBestPaywall,
} from "../ContextualPaywall";
import {
  recordConversion,
  getConversionRate,
  getBestConvertingContext,
} from "../conversion-tracking";
import { resolvePersonalizedPremium } from "../personalized-premium";

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn() },
}));

jest.mock("../subscription-store", () => ({
  subscriptionStore: {
    getSubscription: jest.fn(() => null),
    setSubscription: jest.fn(),
  },
}));

jest.mock("../../../shared/monetization/revenuecat-facade", () => ({
  initializeRevenueCat: jest.fn(),
  restorePurchases: jest.fn(),
}));

const TEST_USER = "test-user-001";

describe("monetization feature — comprehensive tests", () => {
  // ── tier-definitions ──────────────────────────────────────
  describe("tier-definitions", () => {
    it("TIERS has free and premium tiers", () => {
      expect(TIERS.free).toBeDefined();
      expect(TIERS.premium).toBeDefined();
    });
    it("free tier has null price", () => {
      expect(TIERS.free.monthlyPrice).toBeNull();
      expect(TIERS.free.yearlyPrice).toBeNull();
    });
    it("premium tier has monthly and yearly prices", () => {
      expect(TIERS.premium.monthlyPrice).toBeGreaterThan(0);
      expect(TIERS.premium.yearlyPrice).toBeGreaterThan(0);
    });
    it("premium tier has trial days > 0", () => {
      expect(TIERS.premium.trialDays).toBeGreaterThan(0);
    });
    it("hasFeature returns false for all free features", () => {
      expect(hasFeature("free", "deepCoachMemory")).toBe(false);
      expect(hasFeature("free", "advancedStudyOS")).toBe(false);
      expect(hasFeature("free", "progressIntelligence")).toBe(false);
    });
    it("hasFeature returns true for all premium features", () => {
      expect(hasFeature("premium", "deepCoachMemory")).toBe(true);
      expect(hasFeature("premium", "advancedStudyOS")).toBe(true);
      expect(hasFeature("premium", "progressIntelligence")).toBe(true);
    });
    it("getMaxActiveStudyPlans returns 1 for free, Infinity for premium", () => {
      expect(getMaxActiveStudyPlans("free")).toBe(1);
      expect(getMaxActiveStudyPlans("premium")).toBe(Infinity);
    });
    it("FREE_FEATURE_STRS and PREMIUM_FEATURE_STRS are non-empty arrays", () => {
      expect(FREE_FEATURE_STRS.length).toBeGreaterThan(0);
      expect(PREMIUM_FEATURE_STRS.length).toBeGreaterThan(0);
    });
  });

  // ── value-ladder ──────────────────────────────────────────
  describe("value-ladder", () => {
    describe("calculateLadderPosition", () => {
      it("returns low urgency for premium user", () => {
        const pos = calculateLadderPosition("premium", 50, 30, false);
        expect(pos.upgradeUrgency).toBe("low");
        expect(pos.discountEligible).toBe(false);
      });
      it("returns low urgency for new free user", () => {
        const pos = calculateLadderPosition("free", 5, 3, false);
        expect(pos.upgradeUrgency).toBe("low");
      });
      it("returns medium urgency for 40+ sessions and 14+ days", () => {
        const pos = calculateLadderPosition("free", 40, 14, false);
        expect(pos.upgradeUrgency).toBe("medium");
      });
      it("returns high urgency with discount for 60+ sessions and 30+ days", () => {
        const pos = calculateLadderPosition("free", 60, 30, false);
        expect(pos.upgradeUrgency).toBe("high");
        expect(pos.discountEligible).toBe(true);
        expect(pos.discountPercent).toBe(20);
      });
      it("gives 15% discount for interested users with 20+ sessions", () => {
        const pos = calculateLadderPosition("free", 25, 5, true);
        expect(pos.discountEligible).toBe(true);
        expect(pos.discountPercent).toBe(15);
      });
    });
    describe("getUpgradeMessage", () => {
      it("returns already premium for premium users", () => {
        const msg = getUpgradeMessage({
          currentTier: "premium",
          sessionsCompleted: 0,
          daysActive: 0,
          nextRecommendedTier: "premium",
          upgradeUrgency: "low",
          discountEligible: false,
        });
        expect(msg).toContain("Premium");
      });
      it("returns high urgency message", () => {
        const msg = getUpgradeMessage({
          currentTier: "free",
          sessionsCompleted: 60,
          daysActive: 30,
          nextRecommendedTier: "premium",
          upgradeUrgency: "high",
          discountEligible: false,
        });
        expect(msg).toContain("rhythm");
      });
      it("returns medium urgency message", () => {
        const msg = getUpgradeMessage({
          currentTier: "free",
          sessionsCompleted: 40,
          daysActive: 14,
          nextRecommendedTier: "premium",
          upgradeUrgency: "medium",
          discountEligible: false,
        });
        expect(msg).toContain("momentum");
      });
    });
    describe("getPaywallTiming", () => {
      it("does not show paywall within 7 days of last", () => {
        const result = getPaywallTiming(50, 3, 90);
        expect(result.shouldShow).toBe(false);
      });
      it("shows paywall for high quality session after 7 days", () => {
        const result = getPaywallTiming(50, 8, 90);
        expect(result.shouldShow).toBe(true);
        expect(result.trigger).toBe("post_session");
      });
      it("does not show for low quality session", () => {
        const result = getPaywallTiming(50, 8, 50);
        expect(result.shouldShow).toBe(false);
      });
    });
    describe("calculateUpgradeDiscount", () => {
      it("returns 15% for 30+ active days", () => {
        const result = calculateUpgradeDiscount("free", "premium", 30);
        expect(result.eligible).toBe(true);
        expect(result.discountPercent).toBe(15);
      });
      it("returns 10% for 14+ active days", () => {
        const result = calculateUpgradeDiscount("free", "premium", 14);
        expect(result.eligible).toBe(true);
        expect(result.discountPercent).toBe(10);
      });
      it("returns not eligible for < 14 days", () => {
        const result = calculateUpgradeDiscount("free", "premium", 5);
        expect(result.eligible).toBe(false);
      });
    });
    describe("formatTierPrice", () => {
      it("formats free tier price as $0.00", () => {
        const result = formatTierPrice("free");
        expect(result.fullPrice).toBe("$0.00");
        expect(result.discountedPrice).toBe("$0.00");
      });
      it("applies discount to premium tier", () => {
        const result = formatTierPrice("premium", 20);
        expect(result.fullPrice).toContain("$9.99");
        expect(result.savings).toContain("Save");
      });
      it("returns no savings for 0 discount", () => {
        const result = formatTierPrice("premium", 0);
        expect(result.savings).toBe("");
      });
    });
    describe("getFeatureComparison", () => {
      it("returns new features when upgrading from free to premium", () => {
        const result = getFeatureComparison("free", "premium");
        expect(result.newFeatures.length).toBeGreaterThan(0);
      });
      it("returns empty for same tier upgrade", () => {
        const result = getFeatureComparison("premium", "premium");
        expect(result.newFeatures).toHaveLength(0);
      });
    });
    it("TIER_CONFIGS has free and premium entries", () => {
      expect(TIER_CONFIGS.free).toBeDefined();
      expect(TIER_CONFIGS.premium).toBeDefined();
    });
  });

  // ── paywall-state-machine ─────────────────────────────────
  describe("paywall-state-machine", () => {
    const ctx = { userId: TEST_USER, currentTier: "free", sessionsCompleted: 10 };

    it("createInitialState returns idle state", () => {
      const state = createInitialState(ctx);
      expect(state.state).toBe("idle");
      expect(state.canDismiss).toBe(true);
      expect(state.canRestore).toBe(true);
    });
    it("TRIGGER transitions from idle to loading", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      expect(state.state).toBe("loading");
    });
    it("PRESENT transitions from loading to presenting", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      expect(state.state).toBe("presenting");
    });
    it("PURCHASE transitions from presenting to purchasing", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "PURCHASE", tier: "premium" });
      expect(state.state).toBe("purchasing");
    });
    it("PURCHASE_SUCCESS transitions to success", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "PURCHASE", tier: "premium" });
      state = transitionPaywallState(state, { type: "PURCHASE_SUCCESS" });
      expect(state.state).toBe("success");
    });
    it("PURCHASE_FAILED transitions to failed with error", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "PURCHASE", tier: "premium" });
      state = transitionPaywallState(state, { type: "PURCHASE_FAILED", error: "card_declined" });
      expect(state.state).toBe("failed");
      expect(state.context.error).toBe("card_declined");
    });
    it("DISMISS from presenting goes to dismissed", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "DISMISS" });
      expect(state.state).toBe("dismissed");
    });
    it("TRIGGER from dismissed resets to initial idle state", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "DISMISS" });
      expect(state.state).toBe("dismissed");
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      // createInitialState returns "idle", so TRIGGER from terminal resets to idle
      expect(state.state).toBe("idle");
    });
    it("RESTORE from presenting goes to restoring", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "RESTORE" });
      expect(state.state).toBe("restoring");
    });
    it("RESTORE_SUCCESS goes to success", () => {
      let state = createInitialState(ctx);
      state = transitionPaywallState(state, { type: "TRIGGER", context: ctx });
      state = transitionPaywallState(state, { type: "PRESENT" });
      state = transitionPaywallState(state, { type: "RESTORE" });
      state = transitionPaywallState(state, { type: "RESTORE_SUCCESS" });
      expect(state.state).toBe("success");
    });

    it("getPaywallStateMessage returns correct messages", () => {
      expect(getPaywallStateMessage("idle")).toBe("");
      expect(getPaywallStateMessage("presenting")).toBe("Choose your plan");
      expect(getPaywallStateMessage("success")).toContain("Premium");
      expect(getPaywallStateMessage("failed")).toContain("try again");
    });
    it("canDismissPaywall is true only for presenting and failed", () => {
      expect(canDismissPaywall("presenting")).toBe(true);
      expect(canDismissPaywall("failed")).toBe(true);
      expect(canDismissPaywall("loading")).toBe(false);
      expect(canDismissPaywall("success")).toBe(false);
    });
    it("canPurchase is true for presenting, failed, and trial_started", () => {
      expect(canPurchase("presenting")).toBe(true);
      expect(canPurchase("failed")).toBe(true);
      expect(canPurchase("trial_started")).toBe(true);
      expect(canPurchase("loading")).toBe(false);
    });
    it("isTerminalState is true for success and dismissed", () => {
      expect(isTerminalState("success")).toBe(true);
      expect(isTerminalState("dismissed")).toBe(true);
      expect(isTerminalState("presenting")).toBe(false);
    });
    it("getRetryAction returns PURCHASE for failed with selectedTier", () => {
      const state = createInitialState(ctx);
      const failedState = {
        ...state,
        state: "failed" as const,
        context: { ...ctx, selectedTier: "premium" },
      };
      const action = getRetryAction(failedState);
      expect(action?.type).toBe("PURCHASE");
    });
    it("getRetryAction returns null for non-failed state", () => {
      expect(getRetryAction(createInitialState(ctx))).toBeNull();
    });
    it("createPaywallTrigger creates a TRIGGER event", () => {
      const event = createPaywallTrigger(TEST_USER, "free", 10);
      expect(event.type).toBe("TRIGGER");
      expect(event.context.userId).toBe(TEST_USER);
    });
  });

  // ── purchase-trust ────────────────────────────────────────
  describe("purchase-trust", () => {
    const verifiedPurchase = {
      verified: true,
      transactionId: "txn-001",
      productId: "premium_monthly",
      tier: "premium" as const,
      purchaseDate: Date.now() - 86400000,
      expiryDate: Date.now() + 30 * 86400000,
      isTrial: false,
      platform: "ios" as const,
    };
    const expiredPurchase = {
      ...verifiedPurchase,
      expiryDate: Date.now() - 86400000,
    };
    const unverifiedPurchase = {
      ...verifiedPurchase,
      verified: false,
    };

    it("isPurchaseValid returns true for verified non-expired", () => {
      expect(isPurchaseValid(verifiedPurchase)).toBe(true);
    });
    it("isPurchaseValid returns false for expired", () => {
      expect(isPurchaseValid(expiredPurchase)).toBe(false);
    });
    it("isPurchaseValid returns false for unverified", () => {
      expect(isPurchaseValid(unverifiedPurchase)).toBe(false);
    });
    it("getRemainingDays returns positive for future expiry", () => {
      const days = getRemainingDays(verifiedPurchase);
      expect(days).toBeGreaterThan(0);
    });
    it("getRemainingDays returns Infinity for no expiry", () => {
      expect(getRemainingDays({ ...verifiedPurchase, expiryDate: undefined })).toBe(Infinity);
    });
    it("getActiveTrustSignals returns sorted signals", () => {
      const signals = getActiveTrustSignals(false, 3);
      expect(signals.length).toBeLessThanOrEqual(3);
      expect(signals[0]!.priority).toBeLessThanOrEqual(signals[signals.length - 1]!.priority);
    });
    it("getActiveTrustSignals includes verified_reviews when trial", () => {
      const signals = getActiveTrustSignals(true, 10);
      expect(signals.some((s) => s.id === "verified_reviews")).toBe(true);
    });
    it("calculatePriceTrustScore base is 50", () => {
      const score = calculatePriceTrustScore(9.99, 9.99, false, false);
      expect(score).toBe(50);
    });
    it("calculatePriceTrustScore adds for discount, trial, guarantee", () => {
      const score = calculatePriceTrustScore(12.99, 9.99, true, true);
      expect(score).toBe(100);
    });
    it("getPriceExplanation includes trial info when hasTrial", () => {
      const msg = getPriceExplanation("Premium", 9.99, "month", true);
      expect(msg).toContain("free");
    });
    it("getPriceExplanation shows daily cost without trial", () => {
      const msg = getPriceExplanation("Premium", 9.99, "month", false);
      expect(msg).toContain("/day");
    });
    it("verifyPurchaseHash throws PurchaseTrustError", () => {
      expect(() => verifyPurchaseHash()).toThrow(PurchaseTrustError);
    });
    it("isSuspiciousPurchase returns true for unverified", () => {
      expect(isSuspiciousPurchase(unverifiedPurchase, { purchases: 0, refunds: 0 })).toBe(true);
    });
    it("isSuspiciousPurchase returns true for many refunds", () => {
      expect(isSuspiciousPurchase(verifiedPurchase, { purchases: 0, refunds: 4 })).toBe(true);
    });
    it("getRefundEligibility returns eligible within 7 days", () => {
      const result = getRefundEligibility(verifiedPurchase, 3);
      expect(result.eligible).toBe(true);
      expect(result.daysRemaining).toBe(4);
    });
    it("getRefundEligibility returns not eligible after 7 days", () => {
      const result = getRefundEligibility(verifiedPurchase, 10);
      expect(result.eligible).toBe(false);
    });
  });

  // ── PremiumTierSystem ─────────────────────────────────────
  describe("PremiumTierSystem", () => {
    it("FEATURE_GATES has entries for all premium features", () => {
      expect(FEATURE_GATES.length).toBeGreaterThan(0);
    });
    it("getFeatureGate returns a gate for known features", () => {
      const gate = getFeatureGate("deepCoachMemory");
      expect(gate).not.toBeNull();
      expect(gate!.requiresPremium).toBe(true);
    });
    it("getFeatureGate returns null for unknown feature", () => {
      expect(getFeatureGate("nonexistent_feature" as any)).toBeNull();
    });
    it("shouldShowPaywall shows for free user with premium feature", () => {
      const result = shouldShowPaywall("free", "deepCoachMemory");
      expect(result.show).toBe(true);
      expect(result.context).toBe("DEEP_COACH_MEMORY");
    });
    it("shouldShowPaywall does not show for premium user", () => {
      const result = shouldShowPaywall("premium", "deepCoachMemory");
      expect(result.show).toBe(false);
    });
    it("canCreateStudyPlan allows when under limit for free", () => {
      expect(canCreateStudyPlan("free", 0)).toBe(true);
      expect(canCreateStudyPlan("free", 1)).toBe(false);
    });
    it("canCreateStudyPlan always allows for premium", () => {
      expect(canCreateStudyPlan("premium", 100)).toBe(true);
    });
    it("getRemainingStudyPlanSlots returns correct count for free", () => {
      expect(getRemainingStudyPlanSlots("free", 0)).toBe(1);
      expect(getRemainingStudyPlanSlots("free", 1)).toBe(0);
    });
    it("getRemainingStudyPlanSlots returns Infinity for premium", () => {
      expect(getRemainingStudyPlanSlots("premium", 0)).toBe(Infinity);
    });
  });

  // ── ContextualPaywall ─────────────────────────────────────
  describe("ContextualPaywall", () => {
    it("recordPaywallShow and getPaywallHistory work together", () => {
      const userId = `ctx-user-${Date.now()}`;
      recordPaywallShow(userId, "DEEP_COACH_MEMORY", false, false);
      const history = getPaywallHistory(userId);
      expect(history.length).toBe(1);
      expect(history[0]!.context).toBe("DEEP_COACH_MEMORY");
    });
    it("canShowPaywall returns true for first show", () => {
      const userId = `ctx-user-${Date.now()}-fresh`;
      const result = canShowPaywall(userId, "DEEP_COACH_MEMORY");
      expect(result.canShow).toBe(true);
    });
    it("canShowPaywall respects DND during session", () => {
      const userId = `ctx-user-${Date.now()}-dnd`;
      const result = canShowPaywall(userId, "DEEP_COACH_MEMORY", true);
      expect(result.canShow).toBe(false);
      expect(result.reason).toContain("Do Not Disturb");
    });
    it("shouldPreventPaywall blocks during onboarding", () => {
      const result = shouldPreventPaywall(TEST_USER, 5, true, false);
      expect(result.prevent).toBe(true);
      expect(result.reason).toContain("Onboarding");
    });
    it("shouldPreventPaywall blocks for first session", () => {
      const result = shouldPreventPaywall(TEST_USER, 5, false, true);
      expect(result.prevent).toBe(true);
    });
    it("shouldPreventPaywall blocks with < 1 sessions completed", () => {
      const result = shouldPreventPaywall(TEST_USER, 0, false, false);
      expect(result.prevent).toBe(true);
    });
    it("evaluateTrigger returns shouldShow for free user with known trigger", () => {
      const userId = `eval-user-${Date.now()}`;
      const result = evaluateTrigger(userId, { type: "COACH_MEMORY_REQUEST" }, "free");
      expect(typeof result.shouldShow).toBe("boolean");
      expect(typeof result.context === "string" || result.context === null).toBe(true);
    });
    it("evaluateTrigger returns false for unknown trigger type", () => {
      const result = evaluateTrigger(TEST_USER, { type: "UNKNOWN_TRIGGER" } as any);
      expect(result.shouldShow).toBe(false);
    });
    it("getPaywallCooldownRemaining returns 0 for no history", () => {
      const userId = `cooldown-user-${Date.now()}`;
      expect(getPaywallCooldownRemaining(userId, "DEEP_COACH_MEMORY")).toBe(0);
    });
    it("selectBestPaywall returns null when no contexts can show", () => {
      // Premium user should not be able to show any paywall
      const { subscriptionStore } = require("../subscription-store");
      subscriptionStore.getSubscription.mockReturnValue({
        userId: "premium-user",
        tier: "premium",
        startedAt: Date.now(),
        expiresAt: null,
        isTrial: false,
        trialEndsAt: null,
        autoRenew: true,
        platform: "ios",
      });
      const result = selectBestPaywall("premium-user", ["DEEP_COACH_MEMORY"]);
      expect(result).toBeNull();
      subscriptionStore.getSubscription.mockReturnValue(null);
    });
  });

  // ── conversion-tracking ───────────────────────────────────
  describe("conversion-tracking", () => {
    it("recordConversion does not throw", () => {
      expect(() =>
        recordConversion(TEST_USER, "DEEP_COACH_MEMORY", true, 5000),
      ).not.toThrow();
    });
    it("getConversionRate returns 0 for no data", () => {
      const rate = getConversionRate("VISUAL_IDENTITY");
      expect(rate).toBe(0);
    });
    it("getBestConvertingContext returns a context after recordings", () => {
      // Note: recordConversion is module-level state, already recorded DEEP_COACH_MEMORY above
      const result = getBestConvertingContext();
      // After recording at least one DEEP_COACH_MEMORY conversion, it should return that
      expect(result).toBe("DEEP_COACH_MEMORY");
    });
  });

  // ── personalized-premium ──────────────────────────────────
  describe("personalized-premium", () => {
    const baseInput = {
      billingConfigured: true,
      completedSessions: 50,
      primaryGoal: "study" as const,
      motivationStyle: "study_focused" as const,
      studyUsageRatio: 0.6,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 5,
      daysSinceOnboarding: 30,
    };

    it("resolves to hidden_billing_unavailable when billing not configured", () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        billingConfigured: false,
      });
      expect(result.triggerMoment).toBe("hidden_billing_unavailable");
      expect(result.canShowPaywall).toBe(false);
    });
    it("resolves to none for 0 sessions", () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        completedSessions: 0,
      });
      expect(result.triggerMoment).toBe("none");
    });
    it("resolves to advanced_study when tried it", () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        hasTriedAdvancedStudy: true,
      });
      expect(result.triggerMoment).toBe("advanced_study");
      expect(result.canShowPaywall).toBe(true);
    });
    it("resolves to weekly_intelligence when tried it", () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        hasTriedWeeklyReport: true,
      });
      expect(result.triggerMoment).toBe("weekly_intelligence");
    });
    it("returns non-empty freeVsProMatrix", () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.freeVsProMatrix.length).toBeGreaterThan(0);
    });
    it("returns non-empty premium headline and body", () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.premiumHeadline.length).toBeGreaterThan(0);
      expect(result.premiumBody.length).toBeGreaterThan(0);
    });
    it("includes NO_FAKE_BILLING checklist", () => {
      const result = resolvePersonalizedPremium(baseInput);
      expect(result.noFakeBillingChecklist.length).toBeGreaterThan(0);
    });
    it("resolves session_value for high sessions with no specific trigger", () => {
      const result = resolvePersonalizedPremium({
        ...baseInput,
        completedSessions: 50,
        daysSinceOnboarding: 30,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        studyUsageRatio: 0.1,
        currentStreakDays: 2,
      });
      expect(result.triggerMoment).toBe("session_value");
    });
  });
});
