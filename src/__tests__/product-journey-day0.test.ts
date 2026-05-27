/**
 * Product Journey — Day 0 Home + First Session + Active Session
 */
import {
  experience,
  firstWeek,
  accessFor,
  assertFullyHidden,
  assertCoreAvailable,
  getFeatureAvailability,
} from "./debloat-test-helpers";

// ═══ Group 1 — Day 0 Home ═══════════════════════════════════════

describe("Group 1 — Day 0 Home", () => {
  it("1a: study user sees max 6-7 elements on Day 0", () => {
    const exp = experience("study_focused");
    const fw = firstWeek({ motivationStyle: "study_focused" });
    const sections = exp.home.sections;
    expect(sections.length).toBeLessThanOrEqual(7);
    expect(sections).toContain("coach_line");
    expect(sections).toContain("primary_session");
    expect(fw.allowedHomeSurfaces.length).toBeLessThanOrEqual(6);
  });

  it("1b: focus user sees one primary CTA on Day 0", () => {
    const exp = experience("calm");
    expect(exp.primaryHomeCTA.intent).toBe("START_SESSION");
    expect(exp.homeSections).toContain("primary_session");
    expect(exp.secondaryHomeCTA).toBeNull();
  });

  it("1c: game-like user sees tiny boss tease only on Day 0", () => {
    const fw = firstWeek({
      motivationStyle: "game_like",
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: true,
      },
    });
    expect(fw.spotlightSurface).toBe("tiny_boss_teaser");
    expect(fw.bossIntensity).toBe("tiny_tease");
    expect(fw.allowedHomeSurfaces).not.toContain("boss_full");
    expect(fw.allowedHomeSurfaces).toContain("tiny_boss_teaser");
    const exp = experience("game_like");
    expect(exp.boss.dayZeroTeaserAllowed).toBe(true);
    expect(exp.boss.isVisible).toBe(false);
  });

  it("1d: no premium on Day 0", () => {
    const fw = firstWeek();
    expect(fw.premiumMoment).toBe("none");
    expect(fw.hiddenSurfaces).toContain("premium_hard_sell");
    expect(fw.hiddenSurfaces).toContain("premium_currency");
    const exp = experience("calm");
    expect(exp.premium.shouldTease).toBe(false);
    expect(exp.premium.trigger).toBe("none");
  });

  it("1e: no battle pass on Day 0", () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain("battle_pass");
    assertFullyHidden(accessFor(0), "battle_pass");
  });

  it("1f: no shop/inventory/wallet on Day 0", () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain("shop");
    expect(fw.hiddenSurfaces).toContain("inventory");
    expect(fw.hiddenSurfaces).toContain("premium_currency");
    const f0 = accessFor(0);
    assertFullyHidden(f0, "shop");
    assertFullyHidden(f0, "inventory");
  });

  it("1g: no squads/guild/rivals on Day 0", () => {
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain("squads");
    expect(fw.hiddenSurfaces).toContain("rivals");
    const f0 = accessFor(0);
    assertFullyHidden(f0, "squads");
    assertFullyHidden(f0, "rivals");
  });

  it("1h: no full content upload on Day 0", () => {
    const exp = experience("study_focused");
    expect(exp.homeSections).not.toContain("upload_cta");
    expect(exp.homeSections).not.toContain("content_generation");
  });
});

// ═══ Group 2 — First Session Setup ═══════════════════════════════

describe("Group 2 — First Session Setup", () => {
  it("2a: first session shows only mode/duration/start", () => {
    const f0 = accessFor(0);
    assertCoreAvailable(f0, "focus_session");
    assertCoreAvailable(f0, "focus_tab");
    assertFullyHidden(f0, "challenges");
    assertFullyHidden(f0, "wagers");
    assertFullyHidden(f0, "streak_insurance");
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);
  });

  it("2b: study user gets Study default", () => {
    const exp = experience("study_focused");
    expect(exp.sessionDefaults.mode).toBe("STUDY");
    expect(exp.studyLayerLabel).toBe("Study OS");
  });

  it("2c: focus user gets Focus/Deep Work default", () => {
    const fw = firstWeek();
    expect(fw.studyLayerLabel).toBe("Deep Work Plan");
    const exp = experience("calm");
    expect(exp.sessionDefaults.mode).toBe("FOCUS");
  });

  it("2d: game-like user gets subtle boss copy but no boss config", () => {
    const fw = firstWeek({
      motivationStyle: "game_like",
      featureAvailability: {
        boss: true,
        premium: false,
        social: false,
        study: true,
      },
    });
    expect(fw.bossIntensity).toBe("tiny_tease");
    expect(fw.allowedHomeSurfaces).not.toContain("boss_full");
    const exp = experience("game_like");
    expect(exp.boss.systemsDisabled).toEqual(
      expect.arrayContaining(["shop", "inventory", "premium_currency"]),
    );
  });

  it("2e: no stakes/difficulty/premium/challenges in first session", () => {
    const f0 = accessFor(0);
    assertFullyHidden(f0, "challenges");
    assertFullyHidden(f0, "wagers");
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);
    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain("premium_hard_sell");
  });
});

// ═══ Group 3 — Active Session ════════════════════════════════════

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

  it("3c: game-like user sees tiny boss indicator only", () => {
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

  it("3d: no full BossCombatHUD by default for calm/study", () => {
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
    const expCalm = experience("calm");
    expect(expCalm.homeSections).not.toContain("purity_display");
  });
});
