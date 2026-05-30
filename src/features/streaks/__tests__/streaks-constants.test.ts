/**
 * Streaks Comprehensive Tests — Constants
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import { STREAK_STATES, STREAK_MILESTONES } from "../constants";

describe("STREAK_STATES", () => {
  it("defines all 6 states", () => {
    expect(Object.keys(STREAK_STATES)).toEqual(
      expect.arrayContaining(["ACTIVE", "AT_RISK", "CRITICAL", "BROKEN", "RECOVERING", "PROTECTED"]),
    );
  });

  it("each state has required properties", () => {
    for (const [key, state] of Object.entries(STREAK_STATES)) {
      expect(state).toHaveProperty("state", key);
      expect(state).toHaveProperty("label");
      expect(state).toHaveProperty("description");
      expect(state).toHaveProperty("icon");
      expect(state).toHaveProperty("animation");
      expect(state).toHaveProperty("urgency");
      expect(state).toHaveProperty("coachMessage");
    }
  });
});

// ============================================================================
// STREAK_MILESTONES constant
// ============================================================================
describe("STREAK_MILESTONES", () => {
  it("defines milestones for expected days", () => {
    const days = STREAK_MILESTONES.map((m) => m.days);
    expect(days).toEqual(expect.arrayContaining([3, 7, 14, 30, 100]));
  });

  it("each milestone has required fields", () => {
    for (const m of STREAK_MILESTONES) {
      expect(m).toHaveProperty("days");
      expect(m).toHaveProperty("title");
      expect(m).toHaveProperty("name");
      expect(m).toHaveProperty("description");
      expect(m).toHaveProperty("badgeIcon");
      expect(m).toHaveProperty("rewardType");
      expect(m).toHaveProperty("rewards");
      expect(m.rewards.length).toBeGreaterThan(0);
    }
  });
});

