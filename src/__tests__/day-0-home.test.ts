import {
  experience,
  firstWeek,
  accessFor,
  assertFullyHidden,
} from "./debloat-test-helpers";

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
    const secondary = exp.secondaryHomeCTA;
    expect(secondary).toBeNull();
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
