import { bossRepository } from "../repository";
import {
  fetchBossTemplate,
  fetchActiveEncounter,
  hasActiveBossEncounter,
  getBossEncounter,
} from "../repository";

describe("bossRepository object", () => {
  it("exports all 4 required methods", () => {
    expect(typeof bossRepository.fetchBossTemplate).toBe("function");
    expect(typeof bossRepository.fetchActiveEncounter).toBe("function");
    expect(typeof bossRepository.hasActiveBossEncounter).toBe("function");
    expect(typeof bossRepository.getBossEncounter).toBe("function");
  });

  it("methods match the standalone named exports", () => {
    expect(bossRepository.fetchBossTemplate).toBe(fetchBossTemplate);
    expect(bossRepository.fetchActiveEncounter).toBe(fetchActiveEncounter);
    expect(bossRepository.hasActiveBossEncounter).toBe(hasActiveBossEncounter);
    expect(bossRepository.getBossEncounter).toBe(getBossEncounter);
  });
});
