/**
 * Streaks Comprehensive Tests — Milestones
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from "@jest/globals";

import {
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
} from "../milestones";

describe("checkMilestones", () => {
  it("returns matching milestones for day 3", () => {
    const milestones = checkMilestones(3);
    expect(milestones.length).toBe(1);
    expect(milestones[0]!.days).toBe(3);
  });

  it("returns matching milestones for day 7", () => {
    const milestones = checkMilestones(7);
    expect(milestones.length).toBe(1);
  });

  it("returns empty for non-milestone day", () => {
    expect(checkMilestones(5)).toEqual([]);
  });
});

// ============================================================================
// getNextMilestone
// ============================================================================
describe("getNextMilestone", () => {
  it("returns next milestone after current streak", () => {
    const next = getNextMilestone(0);
    expect(next).not.toBeNull();
    expect(next!.days).toBe(3);
  });

  it("returns correct next after 3 days", () => {
    const next = getNextMilestone(3);
    expect(next!.days).toBe(7);
  });

  it("returns null after last milestone", () => {
    const next = getNextMilestone(1000);
    expect(next).toBeNull();
  });
});

// ============================================================================
// getMilestoneProgress
// ============================================================================
describe("getMilestoneProgress", () => {
  it("returns 100% when at exact milestone", () => {
    const progress = getMilestoneProgress(7);
    expect(progress.percentComplete).toBe(100);
    expect(progress.nextMilestone).not.toBeNull();
  });

  it("returns 100% when past all milestones", () => {
    const progress = getMilestoneProgress(500);
    expect(progress.percentComplete).toBe(100);
    expect(progress.nextMilestone).toBeNull();
  });

  it("calculates correct percentage", () => {
    const progress = getMilestoneProgress(3); // 3 out of 7
    // At 3 it's an exact match so 100
    expect(progress.percentComplete).toBe(100);
  });

  it("calculates partial progress", () => {
    const progress = getMilestoneProgress(5); // 5 out of 7
    expect(progress.percentComplete).toBeGreaterThan(0);
    expect(progress.percentComplete).toBeLessThan(100);
  });
});

// ============================================================================
// getStreakDisplayText
// ============================================================================
describe("getStreakDisplayText", () => {
  it("returns '1 Day' for singular", () => {
    expect(getStreakDisplayText(1)).toBe("1 Day");
  });

  it("returns '5 Days' for plural", () => {
    expect(getStreakDisplayText(5)).toBe("5 Days");
  });

  it("returns '0 Days' for zero", () => {
    expect(getStreakDisplayText(0)).toBe("0 Days");
  });
});

// ============================================================================
// getStreakCelebrationMessage
// ============================================================================
describe("getStreakCelebrationMessage", () => {
  it("returns special message for day 1", () => {
    expect(getStreakCelebrationMessage(1)).toContain("Day 1");
  });

  it("returns special message for day 3", () => {
    expect(getStreakCelebrationMessage(3)).toContain("3 days");
  });

  it("returns special message for day 7", () => {
    expect(getStreakCelebrationMessage(7)).toContain("Week Warrior");
  });

  it("returns special message for day 14", () => {
    expect(getStreakCelebrationMessage(14)).toContain("Fortnight");
  });

  it("returns special message for day 30", () => {
    expect(getStreakCelebrationMessage(30)).toContain("Monthly Master");
  });

  it("returns special message for day 100", () => {
    expect(getStreakCelebrationMessage(100)).toContain("Century Club");
  });

  it("returns generic message for non-milestone day", () => {
    expect(getStreakCelebrationMessage(5)).toContain("5 days");
  });
});

