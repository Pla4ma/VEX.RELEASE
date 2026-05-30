/**
 * Session Recommendation — Time-Based Recommendation Tests
 */

import { getTimeBasedRecommendation } from "../time-based-recommendations";

// ═══════════════════════════════════════════════════════════════════════
// TIME-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getTimeBasedRecommendation", () => {
  it("returns 15-min RECOVERY for early morning (5-7)", () => {
    const rec = getTimeBasedRecommendation(6);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(15);
    expect(rec!.mode).toBe("RECOVERY");
    expect(rec!.reason).toContain("Morning");
  });

  it("returns 45-min FOCUS for peak hours (9-10)", () => {
    const rec = getTimeBasedRecommendation(10);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(45);
    expect(rec!.mode).toBe("FOCUS");
    expect(rec!.reason).toContain("Peak");
  });

  it("returns 20-min RECOVERY for afternoon slump (13-14)", () => {
    const rec = getTimeBasedRecommendation(14);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(20);
    expect(rec!.mode).toBe("RECOVERY");
    expect(rec!.reason).toContain("Afternoon");
  });

  it("returns 30-min FOCUS for evening (19-20)", () => {
    const rec = getTimeBasedRecommendation(20);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(30);
    expect(rec!.mode).toBe("FOCUS");
    expect(rec!.reason).toContain("Evening");
  });

  it("returns 15-min HABIT_BUILD for late night (21-22)", () => {
    const rec = getTimeBasedRecommendation(22);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(15);
    expect(rec!.mode).toBe("HABIT_BUILD");
    expect(rec!.reason).toContain("habit");
  });

  it("returns null for hours with no specific recommendation", () => {
    expect(getTimeBasedRecommendation(0)).toBeNull();
    expect(getTimeBasedRecommendation(3)).toBeNull();
    expect(getTimeBasedRecommendation(12)).toBeNull();
    expect(getTimeBasedRecommendation(16)).toBeNull();
    expect(getTimeBasedRecommendation(23)).toBeNull();
  });

  it("handles boundary hours correctly", () => {
    // 5 is start of morning range
    expect(getTimeBasedRecommendation(5)).not.toBeNull();
    expect(getTimeBasedRecommendation(5)!.mode).toBe("RECOVERY");

    // 8 is not in any range
    expect(getTimeBasedRecommendation(8)).toBeNull();

    // 11 is not in peak range (9-10)
    expect(getTimeBasedRecommendation(11)).toBeNull();

    // 21 is start of late night
    expect(getTimeBasedRecommendation(21)).not.toBeNull();
    expect(getTimeBasedRecommendation(21)!.mode).toBe("HABIT_BUILD");
  });
});
