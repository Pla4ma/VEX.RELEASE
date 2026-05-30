import {
  shouldShowBossPreview,
  isCombatAllowed,
  isBossVisibleAtSurface,
  useBossDisplayPolicy,
  getBossDisplayCopy,
  isBossVisibleAtHome,
} from "../display-policy";

describe("Display policy (all stubs return false/empty)", () => {
  it("shouldShowBossPreview always returns false", () => {
    expect(shouldShowBossPreview()).toBe(false);
  });

  it("isCombatAllowed always returns false regardless of argument", () => {
    expect(isCombatAllowed()).toBe(false);
    expect(isCombatAllowed(undefined)).toBe(false);
    expect(isCombatAllowed({ some: "policy" })).toBe(false);
  });

  it("isBossVisibleAtSurface always returns false", () => {
    expect(isBossVisibleAtSurface()).toBe(false);
    expect(isBossVisibleAtSurface("home")).toBe(false);
  });

  it("useBossDisplayPolicy returns hidden and no combat", () => {
    const policy = useBossDisplayPolicy();
    expect(policy).toEqual({ isVisible: false, combatAllowed: false });
  });

  it("useBossDisplayPolicy returns same result with context argument", () => {
    expect(useBossDisplayPolicy("home")).toEqual({
      isVisible: false,
      combatAllowed: false,
    });
    expect(useBossDisplayPolicy("session")).toEqual({
      isVisible: false,
      combatAllowed: false,
    });
  });

  it("getBossDisplayCopy returns empty strings for title and subtitle", () => {
    const copy = getBossDisplayCopy();
    expect(copy).toHaveProperty("title");
    expect(copy).toHaveProperty("subtitle");
    expect(copy.title).toBe("");
    expect(copy.subtitle).toBe("");
  });

  it("isBossVisibleAtHome is a boolean constant set to false", () => {
    expect(isBossVisibleAtHome).toBe(false);
    expect(typeof isBossVisibleAtHome).toBe("boolean");
  });
});
