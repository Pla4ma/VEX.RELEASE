import {
  deduplicateConcurrent,
  generateIdempotencyKey,
  isDuplicateOperation,
  markOperationProcessed,
} from "../service-dedup";
import type { AddXpOperationResult } from "../types";

const RESULT: AddXpOperationResult = {
  breakdown: {
    base: 10,
    bossBonus: 0,
    comebackBonus: 0,
    perfectBonus: 0,
    squadBonus: 0,
    streakBonus: 0,
    total: 10,
  },
  error: null,
  levelUpOccurred: false,
  newLevel: 1,
  offlineQueued: false,
  previousLevel: 1,
  progression: null,
  rewards: [],
  success: true,
  xpAdded: 10,
};

describe("progression idempotency", () => {
  it("uses session context for stable idempotency keys", () => {
    const key = generateIdempotencyKey("user-1", "addXp", "session-1");

    expect(key).toBe("prog:user-1:addXp:session-1");
  });

  it("does not burn a key before a write succeeds", () => {
    const key = `test-key-${Date.now()}`;

    expect(isDuplicateOperation(key)).toBe(false);
    markOperationProcessed(key);
    expect(isDuplicateOperation(key)).toBe(true);
  });

  it("deduplicates concurrent operations without running work twice", async () => {
    const key = `pending-key-${Date.now()}`;
    const operation = jest.fn(async () => RESULT);

    const [first, second] = await Promise.all([
      deduplicateConcurrent(key, operation),
      deduplicateConcurrent(key, operation),
    ]);

    expect(first).toBe(RESULT);
    expect(second).toBe(RESULT);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
