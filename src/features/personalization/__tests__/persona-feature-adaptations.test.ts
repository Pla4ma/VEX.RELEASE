import {
  resolveVexExperience,
  profile,
  stats,
  baseAvailability,
} from "./persona-integration-helpers";

describe("VexExperience — feature adaptations & edge cases", () => {
  describe("Creative/project user", () => {
    const exp = resolveVexExperience(
      {
        ...profile("coach_led"),
        primaryGoal: "creative",
        studyLayerName: "Project Focus Path",
        defaultSessionMode: "CREATIVE",
      },
      stats({ totalCompletedSessions: 2 }),
      baseAvailability,
    );

    it("study layer label is Project Focus Path", () => {
      expect(exp.studyLayerLabel).toBe("Project Focus Path");
    });

    it("default session mode is CREATIVE", () => {
      expect(exp.sessionDefaults.mode).toBe("CREATIVE");
    });
  });

  describe("Learning non-student", () => {
    const exp = resolveVexExperience(
      {
        ...profile("coach_led"),
        primaryGoal: "learning",
        studyLayerName: "Learning OS",
      },
      stats({ studyUsageRatio: 0.5 }),
      baseAvailability,
    );

    it("study layer label is Learning OS", () => {
      expect(exp.studyLayerLabel).toBe("Learning OS");
    });

    it("study layer is prominent", () => {
      expect(exp.studyLayerProminence).toBe("spotlight");
    });
  });

  describe("User who ignores boss", () => {
    const exp = resolveVexExperience(
      profile("game_like"),
      stats({
        totalCompletedSessions: 8,
        bossChallengeEngagement: "none",
        ignoredFeatures: ["boss_tab"],
        completedSessionDurations: [25, 25, 25],
      }),
      baseAvailability,
    );

    it("boss is marked in teased systems", () => {
      expect(exp.teasedSystems).toContain("boss_tab");
    });

    it("behavior adaptations include boss_ignored", () => {
      expect(exp.behaviorAdaptations).toContain("boss_ignored");
    });

    it("boss intensity remains game-like", () => {
      expect(exp.bossIntensity).toBe("game-like");
    });
  });

  describe("User who uses Study heavily", () => {
    const exp = resolveVexExperience(
      profile("coach_led"),
      stats({ totalCompletedSessions: 6, studyUsageRatio: 0.8 }),
      baseAvailability,
    );

    it("study layer is prominent", () => {
      expect(exp.studyLayerProminence).toBe("spotlight");
    });

    it("primary CTA is continue study path", () => {
      expect(exp.primaryHomeCTA.intent).toBe("CONTINUE_STUDY_PATH");
    });

    it("premium moment triggers advanced study", () => {
      expect(exp.premiumMoment).toBe("advanced_study");
    });
  });

  describe("Premium unavailable", () => {
    const noPremium = { ...baseAvailability, premium: false };
    const exp = resolveVexExperience(
      profile("coach_led"),
      stats({ totalCompletedSessions: 10 }),
      noPremium,
    );

    it("premium is not teased", () => {
      expect(exp.premium.shouldTease).toBe(false);
    });

    it("premium trigger is none", () => {
      expect(exp.premium.trigger).toBe("none");
    });
  });

  describe("Content Study degraded", () => {
    const noStudy = { ...baseAvailability, study: false };
    const exp = resolveVexExperience(
      profile("study_focused"),
      stats({ totalCompletedSessions: 5 }),
      noStudy,
    );

    it("study layer stays visible for study users even when content_study is unavailable", () => {
      expect(exp.studyLayerProminence).toBe("spotlight");
    });

    it("study route is not allowed when feature unavailable", () => {
      expect(exp.allowedRoutes).not.toContain("ContentStudy");
    });
  });
});
