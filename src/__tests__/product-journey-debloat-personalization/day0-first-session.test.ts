/**
 * Test Group 1 — Day 0 Home
 * Test Group 2 — First Session Setup
 */

import { getFeatureAvailability } from "../../features/liveops-config/feature-access";
import {
  experience,
  firstWeek,
  accessFor,
  assertFullyHidden,
  assertCoreAvailable,
} from "./helpers";

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

describe("Group 2 — First Session Setup", () => {
  it("2a: first session setup shows only mode/duration/start", () => {
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

  it("2e: no stakes/difficulty/premium/challenges in first session setup", () => {
    const f0 = accessFor(0);
    assertFullyHidden(f0, "challenges");
    assertFullyHidden(f0, "wagers");
    expect(getFeatureAvailability(f0.premium_paywall).canNavigate).toBe(false);

    const fw = firstWeek();
    expect(fw.hiddenSurfaces).toContain("premium_hard_sell");
  });
});
