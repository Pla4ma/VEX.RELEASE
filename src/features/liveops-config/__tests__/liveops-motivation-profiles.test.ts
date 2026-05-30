/**
 * Liveops Config Feature — FEATURE_MOTIVATION_PROFILES Tests
 */

import { FEATURE_MOTIVATION_PROFILES } from "../feature-motivation-config";

describe("FEATURE_MOTIVATION_PROFILES", () => {
  it("defines config for boss_tab", () => {
    const config = FEATURE_MOTIVATION_PROFILES.boss_tab;
    expect(config).toBeDefined();
    expect(config!.accelerate).toContain("game_like");
    expect(config!.restrict).toContain("calm");
    expect(config!.restrictVisibility).toBe(true);
  });

  it("defines config for challenges", () => {
    const config = FEATURE_MOTIVATION_PROFILES.challenges;
    expect(config).toBeDefined();
    expect(config!.accelerateOffset).toBe(2);
    expect(config!.restrictOffset).toBe(5);
  });

  it("defines config for companion_detail", () => {
    const config = FEATURE_MOTIVATION_PROFILES.companion_detail;
    expect(config).toBeDefined();
    expect(config!.accelerate).toContain("friendly");
    expect(config!.accelerate).toContain("calm");
  });

  it("each config has accelerate and restrict arrays", () => {
    for (const [, config] of Object.entries(FEATURE_MOTIVATION_PROFILES)) {
      if (config) {
        expect(config.accelerate).toBeInstanceOf(Array);
        expect(config.restrict).toBeInstanceOf(Array);
        expect(typeof config.accelerateOffset).toBe("number");
        expect(typeof config.restrictOffset).toBe("number");
      }
    }
  });
});
