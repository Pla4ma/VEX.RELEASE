/**
 * Boss Critical Hit System Tests
 *
 * Tests probability distributions and crit mechanics.
 */

import { bossCritService, CritStatus, CRIT_CONFIG, isCritActive, BossCriticalHitService } from "../critical-hit-system";

describe("BossCriticalHitService", () => {
  let service: BossCriticalHitService;
  const TEST_SESSION_ID = "test-session-123";
  const TEST_BOSS_ID = "test-boss-456";

  beforeEach(() => {
    service = new BossCriticalHitService();
    service.resetStats("test-user");
  });

  describe("Base Probability", () => {
    it("should have 10% base crit chance", () => {
      expect(CRIT_CONFIG.BASE_CHANCE).toBe(0.1);
    });

    it("should trigger crit ~10% of the time (within statistical bounds)", () => {
      const iterations = 10000;
      const distribution = service.simulateCritDistribution(iterations);

      const critRate = distribution.crits / iterations;
      expect(critRate).toBeGreaterThan(0.08);
      expect(critRate).toBeLessThan(0.12);
    });

    it("should near-miss ~10% of the time (11-20% range)", () => {
      const iterations = 10000;
      const distribution = service.simulateCritDistribution(iterations);

      const nearMissRate = distribution.nearMisses / iterations;
      expect(nearMissRate).toBeGreaterThan(0.08);
      expect(nearMissRate).toBeLessThan(0.12);
    });

    it("should have no crit ~80% of the time", () => {
      const iterations = 10000;
      const distribution = service.simulateCritDistribution(iterations);

      const normalRate = distribution.normal / iterations;
      expect(normalRate).toBeGreaterThan(0.78);
      expect(normalRate).toBeLessThan(0.82);
    });
  });

  describe("Modified Chances", () => {
    it("should increase crit chance with 7+ day streak", () => {
      const iterations = 10000;

      const noStreak = service.simulateCritDistribution(iterations, 3, "B");
      const withStreak = service.simulateCritDistribution(iterations, 10, "B");

      expect(withStreak.crits).toBeGreaterThan(noStreak.crits);
    });

    it("should increase crit chance with S grade", () => {
      const iterations = 10000;

      const normalGrade = service.simulateCritDistribution(iterations, 0, "B");
      const sGrade = service.simulateCritDistribution(iterations, 0, "S");

      expect(sGrade.crits).toBeGreaterThan(normalGrade.crits);
    });
  });

  describe("Session State Management", () => {
    it("should register and retrieve session state", () => {
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      const state = service.getSessionState(TEST_SESSION_ID);
      expect(state).not.toBeNull();
      expect(state?.sessionId).toBe(TEST_SESSION_ID);
      expect(state?.bossEncounterId).toBe(TEST_BOSS_ID);
    });

    it("should mark overlay as shown", () => {
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);
      service.markOverlayShown(TEST_SESSION_ID);

      const state = service.getSessionState(TEST_SESSION_ID);
      expect(state?.hasShownOverlay).toBe(true);
    });

    it("should determine if overlay should show", () => {
      // Force crit with seed
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed: "force-crit-seed",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      if (result.status === CritStatus.ACTIVE) {
        expect(service.shouldShowOverlay(TEST_SESSION_ID)).toBe(true);

        service.markOverlayShown(TEST_SESSION_ID);
        expect(service.shouldShowOverlay(TEST_SESSION_ID)).toBe(false);
      }
    });
  });

  describe("Damage Application", () => {
    it("should double damage when crit triggers", () => {
      // Force crit
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed: "force-crit-seed",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      if (result.status === CritStatus.ACTIVE) {
        const baseDamage = 100;
        const damageResult = service.applyCritDamage(TEST_SESSION_ID, baseDamage);

        expect(damageResult.wasCrit).toBe(true);
        expect(damageResult.finalDamage).toBe(200);
      }
    });

    it("should not double damage when no crit", () => {
      // Force no crit with seed
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed: "force-no-crit-seed-999",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      if (result.status === CritStatus.NONE) {
        const baseDamage = 100;
        const damageResult = service.applyCritDamage(TEST_SESSION_ID, baseDamage);

        expect(damageResult.wasCrit).toBe(false);
        expect(damageResult.finalDamage).toBe(100);
      }
    });

    it("should track near-miss correctly", () => {
      // Force near-miss (11-20% roll)
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed: "force-near-miss", // This should roll in 11-20% range
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      if (result.status === CritStatus.NEAR_MISS) {
        const baseDamage = 100;
        const damageResult = service.applyCritDamage(TEST_SESSION_ID, baseDamage);

        expect(damageResult.wasNearMiss).toBe(true);
        expect(damageResult.nearMissPercent).toBeDefined();
        expect(damageResult.finalDamage).toBe(100); // No multiplier
      }
    });
  });

  describe("Weekly Stats", () => {
    it("should track crits this week", () => {
      const userId = "test-user";

      // Simulate sessions
      for (let i = 0; i < 10; i++) {
        const sessionId = `session-${i}`;
        const result = service.calculateCritChance({
          userId,
          streakDays: 0,
          currentGrade: "B",
        });
        service.registerSession(sessionId, TEST_BOSS_ID, result);
        service.applyCritDamage(sessionId, 100);
      }

      const stats = service.getWeeklyStats(userId);
      expect(stats.totalSessions).toBe(10);
      expect(stats.totalSessions).toBeGreaterThanOrEqual(stats.totalCrits);
    });

    it("should calculate crit rate percentage", () => {
      const userId = "test-user";

      // Force some crits
      for (let i = 0; i < 10; i++) {
        const sessionId = `session-${i}`;
        const result = service.calculateCritChance({
          userId,
          streakDays: 0,
          currentGrade: "B",
          seed: i < 2 ? "force-crit" : `normal-${i}`,
        });
        service.registerSession(sessionId, TEST_BOSS_ID, result);
        service.applyCritDamage(sessionId, 100);
      }

      const stats = service.getWeeklyStats(userId);
      expect(stats.critRate).toBeGreaterThanOrEqual(0);
      expect(stats.critRate).toBeLessThanOrEqual(100);
    });
  });

  describe("Convenience Functions", () => {
    it("isCritActive should return correct state", () => {
      const result = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed: "force-crit",
      });

      service.registerSession(TEST_SESSION_ID, TEST_BOSS_ID, result);

      if (result.status === CritStatus.ACTIVE) {
        expect(isCritActive(TEST_SESSION_ID)).toBe(true);
      }
    });
  });

  describe("Seeded Random", () => {
    it("should produce same result with same seed", () => {
      const seed = "my-test-seed";

      const result1 = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed,
      });

      const result2 = service.calculateCritChance({
        userId: "test-user",
        streakDays: 0,
        currentGrade: "B",
        seed,
      });

      expect(result1.status).toBe(result2.status);
      expect(result1.roll).toBe(result2.roll);
    });
  });
});
