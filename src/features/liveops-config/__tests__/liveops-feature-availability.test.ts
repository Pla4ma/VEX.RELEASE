/**
 * Liveops Config Feature — feature-availability Tests
 */

import {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from "../feature-availability";
import type { FeatureAccess } from "../feature-access-types";

describe("feature-availability", () => {
  function makeFeatureAccess(overrides?: Partial<FeatureAccess>): FeatureAccess {
    return {
      key: "challenges",
      isUnlocked: true,
      isVisible: true,
      isTeased: false,
      isDegraded: false,
      disableOnDegraded: false,
      priority: 1,
      lockedDescription: "Locked",
      recommendedUnlockMoment: "After 5 sessions",
      unlockReason: "Unlocks at 5",
      releaseState: "final_release_progressive",
      ...overrides,
    };
  }

  describe("getFeatureAvailability", () => {
    it("returns unlocked state for fully available feature", () => {
      const result = getFeatureAvailability(makeFeatureAccess());
      expect(result.state).toBe("unlocked");
      expect(result.canNavigate).toBe(true);
      expect(result.canQuery).toBe(true);
    });

    it("returns disabled for deactivated feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ releaseState: "final_release_deactivated" }),
      );
      expect(result.state).toBe("disabled");
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it("returns disabled for archived feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ releaseState: "archived" }),
      );
      expect(result.state).toBe("disabled");
    });

    it("returns locked for invisible feature", () => {
      const result = getFeatureAvailability(makeFeatureAccess({ isVisible: false }));
      expect(result.state).toBe("disabled");
    });

    it("returns degraded for unlocked but degraded feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isDegraded: true }),
      );
      expect(result.state).toBe("degraded");
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
      expect(result.canQuery).toBe(false);
    });

    it("returns disabled for degraded with disableOnDegraded", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isDegraded: true, disableOnDegraded: true }),
      );
      expect(result.state).toBe("disabled");
    });

    it("returns teased for teased locked feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isUnlocked: false, isTeased: true }),
      );
      expect(result.state).toBe("teased");
      expect(result.canRenderEntryPoint).toBe(true);
      expect(result.canNavigate).toBe(false);
    });

    it("returns locked for not-unlocked not-teased feature", () => {
      const result = getFeatureAvailability(
        makeFeatureAccess({ isUnlocked: false, isTeased: false }),
      );
      expect(result.state).toBe("locked");
      expect(result.canRenderEntryPoint).toBe(false);
    });
  });

  describe("getFeatureAvailabilityFor", () => {
    it("returns availability with feature key", () => {
      const result = getFeatureAvailabilityFor("challenges", makeFeatureAccess());
      expect(result.state).toBe("unlocked");
    });
  });

  describe("isFeatureAvailableForNavigation", () => {
    it("returns true for unlocked features", () => {
      expect(isFeatureAvailableForNavigation(getFeatureAvailability(makeFeatureAccess()))).toBe(true);
    });

    it("returns false for locked features", () => {
      expect(isFeatureAvailableForNavigation(
        getFeatureAvailability(makeFeatureAccess({ isUnlocked: false })),
      )).toBe(false);
    });

    it("returns false for degraded features", () => {
      expect(isFeatureAvailableForNavigation(
        getFeatureAvailability(makeFeatureAccess({ isDegraded: true })),
      )).toBe(false);
    });
  });

  describe("isFeatureAvailableForQueries", () => {
    it("returns true for unlocked features", () => {
      expect(isFeatureAvailableForQueries(getFeatureAvailability(makeFeatureAccess()))).toBe(true);
    });

    it("returns false for locked features", () => {
      expect(isFeatureAvailableForQueries(
        getFeatureAvailability(makeFeatureAccess({ isUnlocked: false })),
      )).toBe(false);
    });
  });
});
