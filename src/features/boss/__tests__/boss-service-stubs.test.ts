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

describe("Service stubs (archived feature)", () => {
  it("calculateDamage returns 0 synchronously", () => {
    expect(calculateDamage()).toBe(0);
    expect(typeof calculateDamage()).toBe("number");
  });

  it("createEncounter returns a Promise resolving to null", async () => {
    const result = createEncounter();
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeNull();
  });

  it("applyDamage resolves to null with input", async () => {
    await expect(
      applyDamage({ encounterId: "e1", sessionId: "s1", damage: 10 }),
    ).resolves.toBeNull();
  });

  it("applyDamage resolves to null with no arguments", async () => {
    await expect(applyDamage()).resolves.toBeNull();
  });

  it("getActiveEncounter resolves to null for any userId", async () => {
    await expect(getActiveEncounter("user-1")).resolves.toBeNull();
    await expect(getActiveEncounter("")).resolves.toBeNull();
  });

  it("getAvailableBosses resolves to an empty array", async () => {
    const result = await getAvailableBosses();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("canUserFightBoss returns {allowed:false, reason:'archived'}", async () => {
    const result = await canUserFightBoss();
    expect(result).toEqual({ allowed: false, reason: "archived" });
  });

  it("consumeBountiesOnDamage is a no-op (no throw)", () => {
    expect(() => consumeBountiesOnDamage()).not.toThrow();
    expect(consumeBountiesOnDamage()).toBeUndefined();
  });

  it("recordBountyLootBoost is a no-op (no throw)", () => {
    expect(() => recordBountyLootBoost()).not.toThrow();
    expect(recordBountyLootBoost()).toBeUndefined();
  });
});
