/**
 * Streaks Comprehensive Tests — Risk Recommendations & Types
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import { generateRecommendation } from "../utils/riskHelpers";

import { WEIGHTS, CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, DAY_HOURS } from "../utils/riskTypes";

describe("Risk Helpers", () => {
  describe("generateRecommendation", () => {
    it("returns critical message for CRITICAL", () => {
      const rec = generateRecommendation("CRITICAL", {
        hoursSinceLastSession: 25,
        typicalSessionHour: 9,
        currentHour: 20,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 0,
        recentSessionQuality: 80,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("streak");
    });

    it("returns high-risk message", () => {
      const rec = generateRecommendation("HIGH", {
        hoursSinceLastSession: 15,
        typicalSessionHour: 9,
        currentHour: 20,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 80,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("risk");
    });

    it("returns weekend message when weekend risk", () => {
      const rec = generateRecommendation("MEDIUM", {
        hoursSinceLastSession: 10,
        typicalSessionHour: 9,
        currentHour: 15,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 80,
        weekendRisk: true,
        vacationMode: false,
      });
      expect(rec).toContain("Weekend");
    });

    it("returns NONE message", () => {
      const rec = generateRecommendation("NONE", {
        hoursSinceLastSession: 2,
        typicalSessionHour: 9,
        currentHour: 10,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 90,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("Great job");
    });
  });
});

// ============================================================================
// Risk Types Constants
// ============================================================================
describe("Risk Types Constants", () => {
  it("WEIGHTS sum to 1.0", () => {
    const sum = WEIGHTS.TIME_DRIFT + WEIGHTS.HOURS_ELAPSED + WEIGHTS.PATTERN_DECLINE + WEIGHTS.QUALITY_DROP + WEIGHTS.WEEKEND_FACTOR;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("thresholds are in correct order", () => {
    expect(CRITICAL_THRESHOLD).toBeGreaterThan(HIGH_THRESHOLD);
    expect(HIGH_THRESHOLD).toBeGreaterThan(MEDIUM_THRESHOLD);
  });

  it("DAY_HOURS is 24", () => {
    expect(DAY_HOURS).toBe(24);
  });
});
