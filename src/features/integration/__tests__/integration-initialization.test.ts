/**
 * Integration tests — index.ts initialization and cleanup
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  activeEvents,
} from "./integration-setup";
import { initializeFeatureIntegrations } from "../index";

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe("index.ts – initialization and cleanup", () => {
    it("default config enables progression, streaks, boss, sessions, focus; disables economy and social", () => {
      const cleanup = initializeFeatureIntegrations();
      expect(activeEvents()).toContain("progression:level_up");
      expect(activeEvents()).toContain("social:streak_milestone");
      expect(activeEvents()).toContain("boss:defeated");
      expect(activeEvents()).toContain("sessions:completed");
      expect(activeEvents()).not.toContain("economy:transaction");
      expect(activeEvents()).not.toContain("social:activity");
      cleanup();
    });

    it("respects partial config overrides — disabling progression", () => {
      const cleanup = initializeFeatureIntegrations({
        enableProgressionRewards: false,
      });
      expect(activeEvents()).not.toContain("progression:level_up");
      expect(activeEvents()).toContain("social:streak_milestone");
      expect(activeEvents()).toContain("boss:defeated");
      cleanup();
    });

    it("respects partial config overrides — disabling streaks and boss", () => {
      const cleanup = initializeFeatureIntegrations({
        enableStreaksRewards: false,
        enableBossRewards: false,
      });
      expect(activeEvents()).toContain("progression:level_up");
      expect(activeEvents()).not.toContain("social:streak_milestone");
      expect(activeEvents()).not.toContain("boss:defeated");
      cleanup();
    });

    it("disabling all options produces zero subscriptions", () => {
      const cleanup = initializeFeatureIntegrations({
        enableProgressionRewards: false,
        enableStreaksRewards: false,
        enableBossRewards: false,
        enableSessionsFeed: false,
        enableEconomyFeed: false,
        enableSocialFeed: false,
        enableFocusIdentity: false,
      });
      expect(mockEventBus.eventBus.subscribe).not.toHaveBeenCalled();
      cleanup();
    });

    it("cleanup removes all event subscriptions", () => {
      const cleanup = initializeFeatureIntegrations();
      const countBefore = mockActiveSubscribers.length;
      expect(countBefore).toBeGreaterThan(0);
      cleanup();
      expect(mockActiveSubscribers.length).toBe(0);
    });

    it("returns a cleanup function", () => {
      const cleanup = initializeFeatureIntegrations();
      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });
});
