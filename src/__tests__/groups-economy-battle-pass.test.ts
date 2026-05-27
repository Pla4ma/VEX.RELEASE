import {
  loadGroups,
  groupContains,
  type GroupConfig,
} from "./groups-validation-helpers";

let config: GroupConfig;

beforeAll(() => {
  config = loadGroups();
});

describe("archived-economy group exists", () => {
  it("archived-economy is a defined group", () => {
    expect(config.groups["archived-economy"]).toBeDefined();
  });

  it("archived-economy is not required", () => {
    expect(config.groups["archived-economy"].required).toBe(false);
  });

  it("archived-economy contains economy tests", () => {
    expect(groupContains(config.groups["archived-economy"], "economy")).toBe(
      true,
    );
  });

  it("archived-economy contains shop tests", () => {
    expect(groupContains(config.groups["archived-economy"], "shop")).toBe(true);
  });

  it("archived-economy contains wallet tests", () => {
    expect(groupContains(config.groups["archived-economy"], "wallet")).toBe(
      true,
    );
  });

  it("archived-economy contains inventory tests", () => {
    expect(groupContains(config.groups["archived-economy"], "inventory")).toBe(
      true,
    );
  });

  it("archived-economy contains battle-pass tests", () => {
    expect(
      groupContains(config.groups["archived-economy"], "battle-pass"),
    ).toBe(true);
  });
});

describe("battle-pass tests — NOT in required groups", () => {
  it("battle-pass test patterns are NOT in premium-billing group", () => {
    const patterns = config.groups["premium-billing"]?.patterns ?? [];
    const bpPattern = patterns.filter((p) => p.includes("battle-pass"));
    expect(bpPattern).toHaveLength(0);
  });

  it("battle-pass test patterns exist only in non-required groups", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "battle-pass")) {
        expect(group.required).toBe(false);
        expect(name === "archived-economy" || name === "legacy").toBe(true);
      }
    }
  });
});

describe("shop/wallet/inventory tests — NOT release blockers", () => {
  it("shop test patterns are not required", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/shop/")) {
        expect(group.required).toBe(false);
      }
    }
  });

  it("wallet test patterns are not required", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/wallet/")) {
        expect(group.required).toBe(false);
      }
    }
  });

  it("inventory test patterns are not required", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/inventory/")) {
        expect(group.required).toBe(false);
      }
    }
  });

  it("shop is not in blocking rules", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/shop/")) {
        expect(config.rules.blocking).not.toContain(name);
        expect(config.rules["non-blocking"]).toContain(name);
      }
    }
  });

  it("wallet is not in blocking rules", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/wallet/")) {
        expect(config.rules.blocking).not.toContain(name);
        expect(config.rules["non-blocking"]).toContain(name);
      }
    }
  });

  it("inventory is not in blocking rules", () => {
    for (const [name, group] of Object.entries(config.groups)) {
      if (groupContains(group, "/inventory/")) {
        expect(config.rules.blocking).not.toContain(name);
        expect(config.rules["non-blocking"]).toContain(name);
      }
    }
  });
});
