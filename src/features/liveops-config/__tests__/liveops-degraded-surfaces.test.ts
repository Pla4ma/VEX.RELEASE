/**
 * Liveops Config Feature — degraded-surfaces Tests
 */

import {
  getDegradedBlockedSurfaces,
  shouldBlockFullSurface,
  getDegradedFallbackSurface,
  DEGRADED_SURFACE_BLOCKS,
} from "../degraded-surfaces";

describe("degraded-surfaces", () => {
  it("DEGRADED_SURFACE_BLOCKS has entries for all degraded feature keys", () => {
    expect(DEGRADED_SURFACE_BLOCKS.content_study).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.ai_coach_advanced).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.premium_paywall).toBeDefined();
    expect(DEGRADED_SURFACE_BLOCKS.boss_tab).toBeDefined();
  });

  it("each entry has blockedSurfaces and fallbackSurface", () => {
    for (const [, value] of Object.entries(DEGRADED_SURFACE_BLOCKS)) {
      expect(value.blockedSurfaces).toBeInstanceOf(Array);
      expect(value.blockedSurfaces.length).toBeGreaterThan(0);
      expect(typeof value.fallbackSurface).toBe("string");
    }
  });

  describe("getDegradedBlockedSurfaces", () => {
    it("returns blocked surfaces for degraded features", () => {
      const blocked = getDegradedBlockedSurfaces(["content_study", "boss_tab"]);
      expect(blocked).toContain("study_layer");
      expect(blocked).toContain("boss_full_cta");
    });

    it("returns empty array for empty input", () => {
      expect(getDegradedBlockedSurfaces([])).toEqual([]);
    });
  });

  describe("shouldBlockFullSurface", () => {
    it("returns true when feature is degraded", () => {
      expect(shouldBlockFullSurface("content_study", true)).toBe(true);
    });

    it("returns false when feature is not degraded", () => {
      expect(shouldBlockFullSurface("content_study", false)).toBe(false);
    });
  });

  describe("getDegradedFallbackSurface", () => {
    it("returns fallback surface for known feature", () => {
      expect(getDegradedFallbackSurface("content_study")).toBe("start_session");
      expect(getDegradedFallbackSurface("boss_tab")).toBe("boss_teaser");
    });

    it("returns default fallback for unknown feature", () => {
      // @ts-expect-error testing with unknown key
      expect(getDegradedFallbackSurface("unknown_feature")).toBe("start_session");
    });
  });
});
