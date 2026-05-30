/**
 * Session Recommendation — Performance-Based Recommendation Tests
 */

import { getPerformanceBasedRecommendation } from "../performance-based-recommendations";

// ═══════════════════════════════════════════════════════════════════════
// PERFORMANCE-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getPerformanceBasedRecommendation", () => {
  it("recommends shorter RECOVERY session for grade D", () => {
    const rec = getPerformanceBasedRecommendation(30, "D");
    expect(rec.duration).toBe(20); // max(15, 30-10)
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("Recovery");
  });

  it("recommends shorter RECOVERY session for grade F", () => {
    const rec = getPerformanceBasedRecommendation(30, "F");
    expect(rec.duration).toBe(20); // max(15, 30-10)
    expect(rec.mode).toBe("RECOVERY");
  });

  it("clamps low-grade duration to minimum 15", () => {
    const rec = getPerformanceBasedRecommendation(20, "D");
    expect(rec.duration).toBe(15); // max(15, 20-10)
  });

  it("recommends longer FOCUS session for grade A", () => {
    const rec = getPerformanceBasedRecommendation(30, "A");
    expect(rec.duration).toBe(40); // min(60, 30+10)
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Build on success");
  });

  it("recommends longer FOCUS session for grade A+", () => {
    const rec = getPerformanceBasedRecommendation(50, "A+");
    expect(rec.duration).toBe(60); // min(60, 50+10)
    expect(rec.mode).toBe("FOCUS");
  });

  it("caps high-grade duration at maximum 60", () => {
    const rec = getPerformanceBasedRecommendation(55, "A");
    expect(rec.duration).toBe(60); // min(60, 55+10)
  });

  it("maintains same duration for average grade (B)", () => {
    const rec = getPerformanceBasedRecommendation(30, "B");
    expect(rec.duration).toBe(30);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Maintain");
  });

  it("maintains same duration for grade C", () => {
    const rec = getPerformanceBasedRecommendation(25, "C");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
  });
});
