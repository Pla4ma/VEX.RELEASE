import {
  loadGroups,
  groupContains,
  type GroupConfig,
} from "./groups-validation-helpers";

let config: GroupConfig;

beforeAll(() => {
  config = loadGroups();
});

describe("premium RevenueCat gating tests — ci-required", () => {
  it("premium-billing group exists", () => {
    expect(config.groups["premium-billing"]).toBeDefined();
  });

  it("premium-billing is ci-required", () => {
    expect(config.rules["ci-required"]).toContain("premium-billing");
  });

  it("premium-billing contains monetization tests", () => {
    expect(
      groupContains(config.groups["premium-billing"], "features/monetization"),
    ).toBe(true);
  });

  it("premium-billing contains shared monetization (entitlements)", () => {
    expect(
      groupContains(config.groups["premium-billing"], "shared/monetization"),
    ).toBe(true);
  });

  it("premium-billing is NOT in blocking rules (conditional)", () => {
    expect(config.rules.blocking).not.toContain("premium-billing");
  });
});

describe("archived feature tests — cannot block final release", () => {
  it("archived-economy is not in blocking rules", () => {
    expect(config.rules.blocking).not.toContain("archived-economy");
  });

  it("archived-economy is in non-blocking rules", () => {
    expect(config.rules["non-blocking"]).toContain("archived-economy");
  });

  it("archived-economy is ci-optional not ci-required", () => {
    expect(config.rules["ci-optional"]).toContain("archived-economy");
    expect(config.rules["ci-required"]).not.toContain("archived-economy");
  });

  it("legacy group remains non-blocking", () => {
    expect(config.rules.blocking).not.toContain("legacy");
    expect(config.rules["non-blocking"]).toContain("legacy");
  });
});

describe("blocking groups — only final-release scope", () => {
  it("blocking list contains exactly 5 groups", () => {
    expect(config.rules.blocking).toHaveLength(5);
  });

  it("core-loop is blocking", () => {
    expect(config.rules.blocking).toContain("core-loop");
  });

  it("progressive-unlock is blocking", () => {
    expect(config.rules.blocking).toContain("progressive-unlock");
  });

  it("session-completion is blocking", () => {
    expect(config.rules.blocking).toContain("session-completion");
  });

  it("offline-sync is blocking", () => {
    expect(config.rules.blocking).toContain("offline-sync");
  });

  it("auth-onboarding is blocking", () => {
    expect(config.rules.blocking).toContain("auth-onboarding");
  });

  it("archived-economy is NOT blocking", () => {
    expect(config.rules.blocking).not.toContain("archived-economy");
  });

  it("no monetization/economy/shop/wallet/battle-pass groups are blocking", () => {
    const blocking = new Set(config.rules.blocking);
    const economyGroupNames: string[] = [];
    for (const [name, group] of Object.entries(config.groups)) {
      if (
        groupContains(group, "economy") ||
        groupContains(group, "shop/") ||
        groupContains(group, "wallet/") ||
        groupContains(group, "battle-pass") ||
        groupContains(group, "inventory")
      ) {
        economyGroupNames.push(name);
      }
    }
    for (const name of economyGroupNames) {
      expect(blocking.has(name)).toBe(false);
    }
  });
});
