import { TIERS, FEATURE_GATES, getPaywallContext } from "../PremiumTierSystem";

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe("PremiumTierSystem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TIERS", () => {
    it("has correct tier names", () => {
      expect(TIERS.free.name).toBe("Free");
      expect(TIERS.free.id).toBe("free");
      expect(TIERS.premium.name).toBe("Premium");
      expect(TIERS.premium.id).toBe("premium");
    });

    it("free tier does not include premium features", () => {
      expect(TIERS.free.features.deepCoachMemory).toBe(false);
      expect(TIERS.free.features.advancedStudyOS).toBe(false);
      expect(TIERS.free.features.progressIntelligence).toBe(false);
      expect(TIERS.free.features.visualIdentity).toBe(false);
      expect(TIERS.free.features.premiumSessionModes).toBe(false);
      expect(TIERS.free.features.recoveryPlanning).toBe(false);
    });

    it("free tier has no price", () => {
      expect(TIERS.free.monthlyPrice).toBeNull();
      expect(TIERS.free.yearlyPrice).toBeNull();
    });

    it("free tier highlights exclude game economy", () => {
      const joined = TIERS.free.highlightedFeatures.join(" ");
      expect(joined).not.toMatch(/coin|gem|inventory|battle pass|chest|shop/i);
    });

    it("premium tier includes all features", () => {
      expect(TIERS.premium.features.deepCoachMemory).toBe(true);
      expect(TIERS.premium.features.advancedStudyOS).toBe(true);
      expect(TIERS.premium.features.progressIntelligence).toBe(true);
      expect(TIERS.premium.features.visualIdentity).toBe(true);
      expect(TIERS.premium.features.premiumSessionModes).toBe(true);
      expect(TIERS.premium.features.recoveryPlanning).toBe(true);
    });

    it("premium tier has correct pricing", () => {
      expect(TIERS.premium.monthlyPrice).toBe(9.99);
      expect(TIERS.premium.yearlyPrice).toBe(59.99);
    });

    it("premium tier has 7-day trial", () => {
      expect(TIERS.premium.trialDays).toBe(7);
    });

    it("premium tier description excludes game economy", () => {
      const joined =
        TIERS.premium.description + TIERS.premium.highlightedFeatures.join(" ");
      expect(joined).not.toMatch(
        /coin|gem|battle pass|chest|shop|squads|boss tiers/i,
      );
    });
  });

  describe("FEATURE_GATES", () => {
    it("has feature gate for each premium feature", () => {
      const features = FEATURE_GATES.map((g) => g.feature);
      expect(features).toContain("deepCoachMemory");
      expect(features).toContain("advancedStudyOS");
      expect(features).toContain("progressIntelligence");
      expect(features).toContain("visualIdentity");
      expect(features).toContain("premiumSessionModes");
      expect(features).toContain("recoveryPlanning");
    });

    it("has correct paywall contexts", () => {
      const coachGate = FEATURE_GATES.find(
        (g) => g.feature === "deepCoachMemory",
      );
      expect(coachGate?.paywallContext).toBe("DEEP_COACH_MEMORY");
      const studyGate = FEATURE_GATES.find(
        (g) => g.feature === "advancedStudyOS",
      );
      expect(studyGate?.paywallContext).toBe("ADVANCED_STUDY_OS");
    });

    it("has plan limit gate", () => {
      const planGate = FEATURE_GATES.find(
        (g) => g.feature === "maxActiveStudyPlans",
      );
      expect(planGate?.paywallContext).toBe("STUDY_PLAN_LIMIT");
    });

    it("has no game economy paywall contexts", () => {
      const contexts = FEATURE_GATES.map((g) => g.paywallContext);
      expect(contexts).not.toContain("BOSS_BOUNTY");
      expect(contexts).not.toContain("STREAK_INSURANCE");
      expect(contexts).not.toContain("SQUAD_LIMIT");
      expect(contexts).not.toContain("EXCLUSIVE_COSMETIC");
    });
  });

  describe("PAYWALL_CONTEXTS", () => {
    it("has context for each premium feature type", () => {
      const ctx = getPaywallContext("DEEP_COACH_MEMORY");
      expect(ctx.title).toContain("Coach");
      expect(ctx.headline).toBeTruthy();
    });

    it("all context copy excludes economy language", () => {
      const allContexts = [
        "DEEP_COACH_MEMORY",
        "ADVANCED_STUDY_OS",
        "PROGRESS_INTELLIGENCE",
        "VISUAL_IDENTITY",
        "PREMIUM_SESSION_MODES",
        "RECOVERY_PLANNING",
        "STUDY_PLAN_LIMIT",
      ] as const;
      for (const ctx of allContexts) {
        const data = getPaywallContext(ctx);
        const joined = [
          data.headline,
          data.subtext,
          data.benefit1,
          data.benefit2,
        ].join(" ");
        expect(joined).not.toMatch(
          /coin|gem|inventory|battle pass|chest|squad|raid|shop/i,
        );
      }
    });
  });
});
