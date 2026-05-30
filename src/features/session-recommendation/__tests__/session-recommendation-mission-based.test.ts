/**
 * Session Recommendation — Mission-Based Recommendation Tests
 */

import { getMissionBasedRecommendation } from "../mission-based-recommendations";

// ═══════════════════════════════════════════════════════════════════════
// MISSION-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getMissionBasedRecommendation", () => {
  it("returns 10-min RECOVERY for first-session", () => {
    const rec = getMissionBasedRecommendation("first-session");
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("10-minute");
  });

  it("returns 15-min RECOVERY for streak-critical", () => {
    const rec = getMissionBasedRecommendation("streak-critical");
    expect(rec.duration).toBe(15);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("streak");
  });

  it("returns 45-min BOSS_PREP for boss-fight", () => {
    const rec = getMissionBasedRecommendation("boss-fight");
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("BOSS_PREP");
    expect(rec.reason).toContain("Boss battle");
  });

  it("returns 20-min RECOVERY for comeback-quest", () => {
    const rec = getMissionBasedRecommendation("comeback-quest");
    expect(rec.duration).toBe(20);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("Comeback");
  });

  it("returns 30-min FOCUS for daily-challenge", () => {
    const rec = getMissionBasedRecommendation("daily-challenge");
    expect(rec.duration).toBe(30);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Challenge");
  });

  it("returns 25-min FOCUS default for unknown mission type", () => {
    const rec = getMissionBasedRecommendation("unknown-mission");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Standard");
  });
});
