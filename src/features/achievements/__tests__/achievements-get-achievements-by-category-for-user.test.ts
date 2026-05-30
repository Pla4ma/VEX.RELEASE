import { describe, it, expect } from "@jest/globals";
import {
  getAchievementsByCategoryForUser,
} from "../EventHandler";

describe("getAchievementsByCategoryForUser", () => {
  it("returns achievements filtered by category", () => {
    const r = getAchievementsByCategoryForUser("user-1", "SESSION");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((a) => a.category === "SESSION")).toBe(true);
  });

  it("returns array for ECONOMY category", () => {
    expect(Array.isArray(getAchievementsByCategoryForUser("user-1", "ECONOMY"))).toBe(true);
  });
});
