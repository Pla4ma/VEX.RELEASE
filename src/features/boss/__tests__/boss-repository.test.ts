/**
 * Tests for boss repository
 */

import { bossRepository } from "../repository";
import {
  fetchBossTemplate,
  fetchActiveEncounter,
  hasActiveBossEncounter,
  getBossEncounter,
} from "../repository";

describe("bossRepository", () => {
  it("exports all methods", () => {
    expect(typeof bossRepository.fetchBossTemplate).toBe("function");
    expect(typeof bossRepository.fetchActiveEncounter).toBe("function");
    expect(typeof bossRepository.hasActiveBossEncounter).toBe("function");
    expect(typeof bossRepository.getBossEncounter).toBe("function");
  });

  it("fetchBossTemplate returns null", async () => {
    const result = await fetchBossTemplate();
    expect(result).toBeNull();
  });

  it("fetchActiveEncounter returns null", async () => {
    const result = await fetchActiveEncounter();
    expect(result).toBeNull();
  });

  it("hasActiveBossEncounter returns false", async () => {
    const result = await hasActiveBossEncounter();
    expect(result).toBe(false);
  });

  it("getBossEncounter returns null", async () => {
    const result = await getBossEncounter();
    expect(result).toBeNull();
  });
});
