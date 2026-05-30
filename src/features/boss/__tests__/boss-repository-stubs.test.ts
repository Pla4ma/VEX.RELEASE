import {
  fetchBossTemplate,
  fetchActiveEncounter,
  hasActiveBossEncounter,
  getBossEncounter,
} from "../repository";

describe("Repository stubs (archived feature)", () => {
  it("fetchBossTemplate resolves to null", async () => {
    await expect(fetchBossTemplate()).resolves.toBeNull();
  });

  it("fetchBossTemplate accepts any arguments", async () => {
    await expect(fetchBossTemplate("arg1", "arg2")).resolves.toBeNull();
  });

  it("fetchActiveEncounter resolves to null", async () => {
    await expect(fetchActiveEncounter()).resolves.toBeNull();
  });

  it("hasActiveBossEncounter resolves to false", async () => {
    await expect(hasActiveBossEncounter()).resolves.toBe(false);
  });

  it("getBossEncounter resolves to null", async () => {
    await expect(getBossEncounter()).resolves.toBeNull();
  });
});
