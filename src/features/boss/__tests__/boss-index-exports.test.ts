/**
 * Tests for boss index exports and individual hook file exports
 * Covers: boss index exports, hooks/useActiveBoss exports
 */

import * as bossIndex from "../index";
import { useActiveBossEnhanced } from "../hooks/useActiveBoss";

describe("boss index exports", () => {
  it("exports shouldShowBossPreview", () => {
    expect(typeof bossIndex.shouldShowBossPreview).toBe("function");
  });

  it("exports isBossVisibleAtSurface", () => {
    expect(typeof bossIndex.isBossVisibleAtSurface).toBe("function");
  });

  it("exports isCombatAllowed", () => {
    expect(typeof bossIndex.isCombatAllowed).toBe("function");
  });

  it("exports getBossDisplayCopy", () => {
    expect(typeof bossIndex.getBossDisplayCopy).toBe("function");
  });

  it("exports bossRepository", () => {
    expect(bossIndex.bossRepository).toBeDefined();
  });

  it("exports getBossEngagementSignals", () => {
    expect(typeof bossIndex.getBossEngagementSignals).toBe("function");
  });

  it("exports deriveBossEngagementLevel", () => {
    expect(typeof bossIndex.deriveBossEngagementLevel).toBe("function");
  });

  it("exports trackBossEvent", () => {
    expect(typeof bossIndex.trackBossEvent).toBe("function");
  });

  it("exports trackBossRouteOpened", () => {
    expect(typeof bossIndex.trackBossRouteOpened).toBe("function");
  });

  it("exports trackBossCTAClicked", () => {
    expect(typeof bossIndex.trackBossCTAClicked).toBe("function");
  });
});

describe("hooks/useActiveBoss exports", () => {
  it("useActiveBossEnhanced is a function", () => {
    expect(typeof useActiveBossEnhanced).toBe("function");
  });
});
