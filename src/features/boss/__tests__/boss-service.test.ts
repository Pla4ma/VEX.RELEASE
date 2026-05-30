/**
 * Tests for boss service
 */

import {
  calculateDamage,
  createEncounter,
  applyDamage,
  getActiveEncounter,
  getAvailableBosses,
  canUserFightBoss,
  consumeBountiesOnDamage,
  recordBountyLootBoost,
} from "../service";

describe("boss service", () => {
  it("calculateDamage returns 0", () => {
    expect(calculateDamage()).toBe(0);
  });

  it("createEncounter resolves to null", async () => {
    await expect(createEncounter()).resolves.toBeNull();
  });

  it("applyDamage resolves to null", async () => {
    await expect(
      applyDamage({ encounterId: "e1", sessionId: "s1", damage: 10 }),
    ).resolves.toBeNull();
  });

  it("applyDamage works with no arguments", async () => {
    await expect(applyDamage()).resolves.toBeNull();
  });

  it("getActiveEncounter resolves to null", async () => {
    await expect(getActiveEncounter("user-1")).resolves.toBeNull();
  });

  it("getAvailableBosses resolves to empty array", async () => {
    await expect(getAvailableBosses()).resolves.toEqual([]);
  });

  it("canUserFightBoss returns not allowed with 'archived' reason", async () => {
    const result = await canUserFightBoss();
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("archived");
  });

  it("consumeBountiesOnDamage is a no-op", () => {
    expect(() => consumeBountiesOnDamage()).not.toThrow();
  });

  it("recordBountyLootBoost is a no-op", () => {
    expect(() => recordBountyLootBoost()).not.toThrow();
  });
});
