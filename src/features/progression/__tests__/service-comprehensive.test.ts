import {
  calculateLevelThreshold,
  calculateTotalXpToLevel,
  calculateLevelFromTotalXp,
  calculateProgressPercent,
  calculateXpBreakdown,
} from "../service-enhanced-math";

describe("Level Calculations (Canonical 1.25x Curve)", () => {
  describe("calculateLevelThreshold", () => {
    it("should return 100 XP for level 1", () => {
      expect(calculateLevelThreshold(1)).toBe(100);
    });

    it("should grow exponentially with level", () => {
      const level1 = calculateLevelThreshold(1);
      const level10 = calculateLevelThreshold(10);
      const level50 = calculateLevelThreshold(50);
      expect(level1).toBe(100);
      expect(level10).toBe(745);
      expect(level50).toBeGreaterThan(level10);
    });

    it("should handle max level", () => {
      expect(calculateLevelThreshold(100)).toBeGreaterThan(0);
    });

    it("should never return zero or negative", () => {
      for (let i = 1; i <= 50; i++) {
        expect(calculateLevelThreshold(i)).toBeGreaterThan(0);
      }
    });
  });

  describe("calculateTotalXpToLevel", () => {
    it("should return 0 for level 1", () => {
      expect(calculateTotalXpToLevel(1)).toBe(0);
    });

    it("should accumulate correctly with exponential thresholds", () => {
      expect(calculateTotalXpToLevel(2)).toBe(100);
      expect(calculateTotalXpToLevel(3)).toBe(225);
      expect(calculateTotalXpToLevel(5)).toBe(576);
      expect(calculateTotalXpToLevel(10)).toBe(2578);
    });

    it("should match level calculation inverse", () => {
      const totalXp = calculateTotalXpToLevel(10);
      const calculatedLevel = calculateLevelFromTotalXp(totalXp);
      expect(calculatedLevel).toBe(10);
    });
  });

  describe("calculateLevelFromTotalXp", () => {
    it("should return level 1 for 0 XP", () => {
      expect(calculateLevelFromTotalXp(0)).toBe(1);
    });

    it("should return level 1 for less than 100 XP", () => {
      expect(calculateLevelFromTotalXp(50)).toBe(1);
      expect(calculateLevelFromTotalXp(99)).toBe(1);
    });

    it("should return level 2 at 100 XP threshold", () => {
      expect(calculateLevelFromTotalXp(100)).toBe(2);
    });

    it("should cap at max level 100", () => {
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(100);
    });

    it("should calculate correct level for given XP", () => {
      expect(calculateLevelFromTotalXp(100)).toBe(2);
      expect(calculateLevelFromTotalXp(225)).toBe(3);
      expect(calculateLevelFromTotalXp(576)).toBe(5);
    });
  });

  describe("calculateProgressPercent", () => {
    it("should return 0 at start of level", () => {
      expect(calculateProgressPercent(0, 1)).toBe(0);
    });

    it("should return 50 at half of level", () => {
      expect(calculateProgressPercent(50, 1)).toBe(50);
    });

    it("should return 100 at a full threshold", () => {
      expect(calculateProgressPercent(100, 1)).toBe(100);
    });
  });
});

describe("XP Breakdown", () => {
  it("should calculate base breakdown", async () => {
    const breakdown = calculateXpBreakdown({
      baseAmount: 100,
      streakDays: 0,
      squadMultiplier: 1,
      bossActive: false,
      perfectSession: false,
      comebackActive: false,
    });
    expect(breakdown.base).toBe(100);
    expect(breakdown.total).toBe(100);
  });

  it("should apply streak bonus for 3+ days", async () => {
    const breakdown = calculateXpBreakdown({
      baseAmount: 100,
      streakDays: 3,
      squadMultiplier: 1,
      bossActive: false,
      perfectSession: false,
      comebackActive: false,
    });
    expect(breakdown.streakBonus).toBe(25);
    expect(breakdown.total).toBe(125);
  });

  it("should apply higher streak bonus for 7+ days", async () => {
    const breakdown = calculateXpBreakdown({
      baseAmount: 100,
      streakDays: 7,
      squadMultiplier: 1,
      bossActive: false,
      perfectSession: false,
      comebackActive: false,
    });
    expect(breakdown.streakBonus).toBe(50);
    expect(breakdown.total).toBe(150);
  });

  it("should apply perfect session bonus", async () => {
    const breakdown = calculateXpBreakdown({
      baseAmount: 100,
      streakDays: 0,
      squadMultiplier: 1,
      bossActive: false,
      perfectSession: true,
      comebackActive: false,
    });
    expect(breakdown.perfectBonus).toBe(15);
    expect(breakdown.total).toBe(115);
  });
});
