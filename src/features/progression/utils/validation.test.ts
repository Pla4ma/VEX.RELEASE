/**
 * Progression Validation Tests
 *
 * @phase 3 - Deepening: Validation tests
 */

import {
  validateXPTransaction,
  validateLevelUp,
  validatePrestige,
  validateXPBatch,
  type XPTransaction,
} from "./validation";

describe("Progression Validation", () => {
  describe("validateXPTransaction", () => {
    it("should validate a normal XP transaction", () => {
      const transaction: XPTransaction = {
        id: "txn-1",
        userId: "user-1",
        amount: 100,
        source: "SESSION_COMPLETE",
        sourceId: "session-1",
        timestamp: Date.now(),
        applied: false,
      };

      const result = validateXPTransaction(transaction, {
        recentTransactions: [],
        currentLevel: 5,
        currentXP: 1000,
        sessionHistory: [{ duration: 1500000, xp: 100, timestamp: Date.now() }],
      });

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it("should detect suspicious XP rate", () => {
      const transaction: XPTransaction = {
        id: "txn-2",
        userId: "user-1",
        amount: 5000,
        source: "SESSION_COMPLETE",
        sourceId: "session-2",
        timestamp: Date.now(),
        applied: false,
      };

      const result = validateXPTransaction(transaction, {
        recentTransactions: [],
        currentLevel: 1,
        currentXP: 0,
        sessionHistory: [],
      });

      expect(result.riskScore).toBeGreaterThan(50);
    });

    it("should detect duplicate transaction", () => {
      const now = Date.now();
      const transaction: XPTransaction = {
        id: "txn-3",
        userId: "user-1",
        amount: 100,
        source: "SESSION_COMPLETE",
        sourceId: "session-3",
        timestamp: now,
        applied: false,
      };

      const result = validateXPTransaction(transaction, {
        recentTransactions: [transaction],
        currentLevel: 5,
        currentXP: 1000,
        sessionHistory: [],
      });

      expect(result.valid).toBe(false);
      expect(result.violations.some((v) => v.type === "SUSPICIOUS")).toBe(true);
    });
  });

  describe("validateLevelUp", () => {
    it("should validate normal level up", () => {
      const result = validateLevelUp(
        { userId: "user-1", newLevel: 6, xpAtLevelUp: 1500 },
        { currentLevel: 5, totalXp: 1200 },
        [
          { level: 5, xpRequired: 1200 },
          { level: 6, xpRequired: 1500 },
        ],
      );

      expect(result.valid).toBe(true);
    });

    it("should detect level skip", () => {
      const result = validateLevelUp(
        { userId: "user-1", newLevel: 10, xpAtLevelUp: 5000 },
        { currentLevel: 5, totalXp: 1200 },
        [
          { level: 5, xpRequired: 1200 },
          { level: 6, xpRequired: 1500 },
          { level: 7, xpRequired: 2000 },
          { level: 8, xpRequired: 2500 },
          { level: 9, xpRequired: 3500 },
          { level: 10, xpRequired: 5000 },
        ],
      );

      expect(result.valid).toBe(false);
    });
  });

  describe("validatePrestige", () => {
    it("should validate prestige at max level", () => {
      const result = validatePrestige(
        { userId: "user-1", currentLevel: 100, prestigeCount: 0 },
        { maxPrestiges: 10, minLevelRequired: 100, xpMultiplier: 1.5 },
      );

      expect(result.valid).toBe(true);
    });

    it("should reject prestige below min level", () => {
      const result = validatePrestige(
        { userId: "user-1", currentLevel: 50, prestigeCount: 0 },
        { maxPrestiges: 10, minLevelRequired: 100, xpMultiplier: 1.5 },
      );

      expect(result.valid).toBe(false);
    });
  });

  describe("validateXPBatch", () => {
    it("should validate a batch of transactions", () => {
      const transactions: XPTransaction[] = [
        {
          id: "t1",
          userId: "user-1",
          amount: 100,
          source: "SESSION_COMPLETE",
          sourceId: "s1",
          timestamp: Date.now(),
          applied: false,
        },
        {
          id: "t2",
          userId: "user-1",
          amount: 50,
          source: "DAILY_LOGIN",
          timestamp: Date.now() - 1000,
          applied: false,
        },
      ];

      const result = validateXPBatch(transactions, {
        recentTransactions: [],
        currentLevel: 5,
        currentXP: 1000,
        sessionHistory: [],
      });

      expect(result.validTransactions.length).toBe(2);
    });

    it("should filter out invalid transactions", () => {
      const now = Date.now();
      const duplicate: XPTransaction = {
        id: "t1",
        userId: "user-1",
        amount: 100,
        source: "SESSION_COMPLETE",
        sourceId: "s1",
        timestamp: now,
        applied: false,
      };
      const transactions = [duplicate, duplicate]; // Same ID

      const result = validateXPBatch(transactions, {
        recentTransactions: [],
        currentLevel: 5,
        currentXP: 1000,
        sessionHistory: [],
      });

      expect(result.validTransactions.length).toBeLessThan(2);
    });
  });

});
