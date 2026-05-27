import { experience, firstWeek } from "./debloat-test-helpers";

describe("Group 3 — Active Session", () => {
  it("3a: calm user sees timer/progress only", () => {
    const exp = experience("calm");
    expect(exp.bossIntensity).toBe("subtle");
    expect(exp.homeLayoutVariant).not.toBe("game_centered");
    expect(exp.bannedSurfaces).toContain("boss_combat_effects");
  });

  it("3b: study user sees study target in active session", () => {
    const exp = experience("study_focused");
    expect(exp.studyLayerProminence).toBe("spotlight");
    expect(exp.studyLayerLabel).toBe("Study OS");
  });

  it("3c: game-like user sees tiny boss indicator only by default", () => {
    const exp = experience("game_like");
    expect(exp.boss.isVisible).toBe(false);
    expect(exp.boss.dayZeroTeaserAllowed).toBe(true);
    expect(exp.boss.homePlacement).toBe("hidden");

    const fw = firstWeek({
      motivationStyle: "game_like",
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: true,
      },
    });
    expect(fw.allowedHomeSurfaces).not.toContain("boss_full");
    expect(fw.bossIntensity).toBe("tiny_tease");
  });

  it("3d: no full BossCombatHUD by default for calm/study users", () => {
    const expCalm = experience("calm");
    expect(expCalm.homeSections).not.toContain("boss_full_cta");
    expect(expCalm.bannedSurfaces).toContain("boss_full_cta");

    const expStudy = experience("study_focused");
    expect(expStudy.bannedSurfaces).toContain("boss_full_cta");
  });

  it("3e: no coach loading spinner during focus", () => {
    const exp = experience("coach_led");
    expect(exp.coachMessageStyle).toBe("mentor");
    expect(exp.coachTone).toBe("soft");
    expect(exp.bannedSurfaces).not.toContain("coach_presence");
  });

  it("3f: no purity score stress by default", () => {
    const exp = experience("intense");
    expect(exp.homeSections).not.toContain("purity_display");
    expect(exp.bannedSurfaces).not.toContain("purity_score");

    const expCalm = experience("calm");
    expect(expCalm.homeSections).not.toContain("purity_display");
  });
});
