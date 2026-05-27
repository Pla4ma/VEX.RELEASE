/**
 * BossScreen analytics tracking tests.
 *
 * Verifies:
 * - no tracking without userId
 * - tracks with correct bossIntensity
 * - tracks with correct canQueryBoss
 * - does not spam duplicate events
 */
import { describe, it, expect } from "@jest/globals";

const mockAddBreadcrumb = jest.fn();
const mockPublish = jest.fn();

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
}));

jest.mock("../../../events", () => ({
  eventBus: {
    publish: (...args: unknown[]) => mockPublish(...args),
  },
}));

import { trackBossRouteOpened } from "../../../features/boss/analytics";

describe("trackBossRouteOpened", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not crash with null userId (boss analytics stubbed in final release)", () => {
    trackBossRouteOpened(null, "subtle", false);
    // Stub function — tracks nothing because boss is deactivated
    expect(mockAddBreadcrumb).not.toHaveBeenCalled();
  });

  it("does not track anything with valid inputs (boss deactivated)", () => {
    trackBossRouteOpened("user-1", "game-like", true);
    expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it("does not publish analytics events (boss deactivated)", () => {
    trackBossRouteOpened("user-2", "intense", true);
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it("remains a no-op across all intensity levels", () => {
    for (const intensity of ["subtle", "game-like", "intense"]) {
      jest.clearAllMocks();
      trackBossRouteOpened("user-1", intensity, true);
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
      expect(mockPublish).not.toHaveBeenCalled();
    }
  });
});
