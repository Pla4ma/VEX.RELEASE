/**
 * Mastery Feature — calculateTechniqueXp Tests
 */

import { calculateTechniqueXp } from "../xp-calculator";

describe("calculateTechniqueXp", () => {
  it("returns zero XP for interrupted session", () => {
    const xp = calculateTechniqueXp(60, 95, true, 5, true, 0.5);
    expect(xp.durationMastery).toBe(0);
  });

  it("calculates durationMastery based on minutes and purity", () => {
    const xp = calculateTechniqueXp(50, 90, false, 0, false, 1);
    expect(xp.durationMastery).toBe(Math.floor(50 * (90 / 100)));
  });

  it("purityMastery only if purity >= 90", () => {
    expect(calculateTechniqueXp(30, 95, false, 0, false, 1).purityMastery).toBe(
      Math.floor(95 / 10),
    );
    expect(calculateTechniqueXp(30, 80, false, 0, false, 1).purityMastery).toBe(0);
  });

  it("consistencyMastery awards 2 if streakDays > 0", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 3, false, 1).consistencyMastery,
    ).toBe(2);
    expect(
      calculateTechniqueXp(30, 80, false, 0, false, 1).consistencyMastery,
    ).toBe(0);
  });

  it("comebackMastery awards 10 only on first day of streak", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 1, false, 1).comebackMastery,
    ).toBe(10);
    expect(
      calculateTechniqueXp(30, 80, false, 2, false, 1).comebackMastery,
    ).toBe(0);
  });

  it("bossMastery scales with remaining boss health", () => {
    const fullHealth = calculateTechniqueXp(30, 80, false, 0, true, 1.0);
    expect(fullHealth.bossMastery).toBe(20);
    const halfHealth = calculateTechniqueXp(30, 80, false, 0, true, 0.5);
    expect(halfHealth.bossMastery).toBe(Math.floor(20 * 1.5));
  });

  it("bossMastery is 0 when boss not defeated", () => {
    expect(
      calculateTechniqueXp(30, 80, false, 0, false, 1).bossMastery,
    ).toBe(0);
  });
});
