import * as bossIndex from "../index";

describe("boss index exports completeness", () => {
  const expectedFunctions = [
    "shouldShowBossPreview",
    "isBossVisibleAtSurface",
    "isCombatAllowed",
    "getBossDisplayCopy",
    "getBossEngagementSignals",
    "deriveBossEngagementLevel",
    "trackBossEvent",
    "trackBossRouteOpened",
    "trackBossCTAClicked",
  ];

  it.each(expectedFunctions)("exports %s as a function", (name) => {
    expect(typeof (bossIndex as Record<string, unknown>)[name]).toBe(
      "function",
    );
  });

  it("exports bossRepository object", () => {
    expect(bossIndex.bossRepository).toBeDefined();
    expect(typeof bossIndex.bossRepository).toBe("object");
  });

  it("exports PersonalBossBlockSchema", () => {
    expect(bossIndex.PersonalBossBlockSchema).toBeDefined();
  });

  it("exports hook functions", () => {
    expect(typeof bossIndex.useActiveBoss).toBe("function");
    expect(typeof bossIndex.useBossEngagementSummary).toBe("function");
    expect(typeof bossIndex.useAvailableBosses).toBe("function");
  });
});
