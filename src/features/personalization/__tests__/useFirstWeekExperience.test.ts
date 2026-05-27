import { computeFirstWeekExperience } from "../useFirstWeekExperience";

describe("computeFirstWeekExperience", () => {
  it("0-session user sees no advanced systems", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 0,
      daysSinceOnboarding: 0,
      daysSinceLastSession: null,
      motivationStyle: "friendly",
      primaryGoal: "focus",
      bossEngagement: "none",
      studyUsageRatio: 0,
      isPremium: false,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.hiddenSurfaces).toContain("boss_full");
    expect(exp.hiddenSurfaces).toContain("shop");
    expect(exp.hiddenSurfaces).toContain("premium_hard_sell");
    expect(exp.allowedHomeSurfaces).toContain("start_session");
    expect(exp.primaryCTA.intent).toBe("START_SESSION");
  });

  it("1-session user sees progress proof", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 1,
      daysSinceOnboarding: 1,
      daysSinceLastSession: 0,
      motivationStyle: "friendly",
      primaryGoal: "focus",
      bossEngagement: "none",
      studyUsageRatio: 0,
      isPremium: false,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.allowedHomeSurfaces).toContain("progress_proof");
  });

  it("3-session user sees companion continuity", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 3,
      daysSinceOnboarding: 3,
      daysSinceLastSession: 0,
      motivationStyle: "coach_led",
      primaryGoal: "focus",
      bossEngagement: "low",
      studyUsageRatio: 0.1,
      isPremium: false,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.allowedHomeSurfaces).toContain("companion_continuity");
  });

  it("5-session user sees path forming, premium soft tease", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 5,
      daysSinceOnboarding: 5,
      daysSinceLastSession: 0,
      motivationStyle: "study_focused",
      primaryGoal: "study",
      bossEngagement: "low",
      studyUsageRatio: 0.3,
      isPremium: false,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.allowedHomeSurfaces).toContain("study_deep_work_path");
    expect(exp.premiumMoment).toBe("soft_tease");
  });

  it("7-session user sees deeper mode", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 7,
      daysSinceOnboarding: 7,
      daysSinceLastSession: 0,
      motivationStyle: "game_like",
      primaryGoal: "personal_growth",
      bossEngagement: "medium",
      studyUsageRatio: 0.2,
      isPremium: true,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.premiumMoment).toBe("none");
    expect(exp.currentDayStage).toBe("DAY_7_DEEPER_MODE");
  });

  it("comeback user sees recovery CTA", () => {
    const exp = computeFirstWeekExperience({
      completedSessions: 3,
      daysSinceOnboarding: 30,
      daysSinceLastSession: 5,
      motivationStyle: "coach_led",
      primaryGoal: "focus",
      bossEngagement: "low",
      studyUsageRatio: 0.1,
      isPremium: false,
      featureAvailable: {
        boss: true,
        premium: true,
        social: false,
        study: true,
      },
    });
    expect(exp.allowedHomeSurfaces).toContain("recovery_cta");
    expect(exp.comebackState).toBe("missed_week");
  });
});
