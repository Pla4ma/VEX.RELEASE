/**
 * Liveops Config Feature — getProductTier Tests
 */

import { getProductTier } from "../feature-access";

describe("getProductTier", () => {
  it("returns SOCIAL_DEPTH for 40+ sessions", () => {
    expect(getProductTier("POWER_USER", 40)).toBe("SOCIAL_DEPTH");
  });

  it("returns RPG_DEPTH for 20-39 sessions", () => {
    expect(getProductTier("POWER_USER", 20)).toBe("RPG_DEPTH");
    expect(getProductTier("POWER_USER", 39)).toBe("RPG_DEPTH");
  });

  it("returns STUDY_OS for 10-19 sessions", () => {
    expect(getProductTier("POWER_USER", 10)).toBe("STUDY_OS");
    expect(getProductTier("POWER_USER", 19)).toBe("STUDY_OS");
  });

  it("returns COACHING for ENGAGED stage", () => {
    expect(getProductTier("ENGAGED", 5)).toBe("COACHING");
  });

  it("returns CORE_EXECUTION for new/activating users", () => {
    expect(getProductTier("NEW_USER", 0)).toBe("CORE_EXECUTION");
    expect(getProductTier("ACTIVATING", 1)).toBe("CORE_EXECUTION");
  });
});
