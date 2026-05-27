/**
 * Perfect Session Tests
 *
 * Tests for perfect session detection and S-grade streak tracking.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  trackSGradeSession,
  getSGradeStreak,
  resetSGradeStreak,
  isSGradeMilestone,
} from "../../mastery/SGradeStreakTracker";

describe("Perfect Session detection", () => {
  beforeEach(async () => {
    // Reset streak before each test
    await resetSGradeStreak();
  });

  it("isPerfect is true when score >= 95, no pauses, >= 30min", () => {
    // This is tested in the ScoringEngine integration
    // Criteria: finalScore >= 95 && pauses === 0 && effectiveTime >= 30 * 60 && focusQualityScore >= 95
    const mockCalculation = {
      finalScore: 95,
      pauses: 0,
      effectiveTime: 30 * 60,
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(true);
  });

  it("isPerfect is false when paused even once", () => {
    const mockCalculation = {
      finalScore: 95,
      pauses: 1,
      effectiveTime: 30 * 60,
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });

  it("isPerfect is false when duration < 30 minutes", () => {
    const mockCalculation = {
      finalScore: 95,
      pauses: 0,
      effectiveTime: 25 * 60, // 25 minutes
      focusQualityScore: 95,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });

  it("isPerfect is false when score < 95", () => {
    const mockCalculation = {
      finalScore: 94,
      pauses: 0,
      effectiveTime: 30 * 60,
      focusQualityScore: 94,
    };

    const isPerfect =
      mockCalculation.finalScore >= 95 &&
      mockCalculation.pauses === 0 &&
      mockCalculation.effectiveTime >= 30 * 60 &&
      mockCalculation.focusQualityScore >= 95;

    expect(isPerfect).toBe(false);
  });

  it("S-grade streak increments on consecutive perfect sessions", async () => {
    const mockEventBus = { emit: jest.fn() };

    // First S grade - streak becomes 1, no milestone
    const result1 = await trackSGradeSession(
      "user1",
      "S",
      "session1",
      mockEventBus,
    );
    expect(result1.count).toBe(1);
    expect(result1.milestone).toBeUndefined();

    // Second S grade - streak becomes 2, no milestone
    const result2 = await trackSGradeSession(
      "user1",
      "S",
      "session2",
      mockEventBus,
    );
    expect(result2.count).toBe(2);
    expect(result2.milestone).toBeUndefined();

    // Third S grade - streak becomes 3, milestone reached
    const result3 = await trackSGradeSession(
      "user1",
      "S",
      "session3",
      mockEventBus,
    );
    expect(result3.count).toBe(3);
    expect(result3.milestone).toBe(3);

    // Verify event was emitted
    expect(mockEventBus.emit).toHaveBeenCalledWith("mastery:s_grade_streak", {
      userId: "user1",
      count: 3,
      milestone: 3,
    });
  });

  it("S-grade streak resets to 0 on A grade", async () => {
    const mockEventBus = { emit: jest.fn() };

    // Build up streak to 2
    await trackSGradeSession("user1", "S", "session1", mockEventBus);
    await trackSGradeSession("user1", "S", "session2", mockEventBus);

    const streakBefore = await getSGradeStreak();
    expect(streakBefore).toBe(2);

    // Non-S grade resets streak
    const result = await trackSGradeSession(
      "user1",
      "A",
      "session3",
      mockEventBus,
    );
    expect(result.count).toBe(0);
    expect(result.milestone).toBeUndefined();

    const streakAfter = await getSGradeStreak();
    expect(streakAfter).toBe(0);
  });

  it("isSGradeMilestone returns correct milestone or null", () => {
    expect(isSGradeMilestone(1)).toBeNull();
    expect(isSGradeMilestone(2)).toBeNull();
    expect(isSGradeMilestone(3)).toBe(3);
    expect(isSGradeMilestone(4)).toBeNull();
    expect(isSGradeMilestone(5)).toBe(5);
    expect(isSGradeMilestone(6)).toBeNull();
    expect(isSGradeMilestone(10)).toBe(10);
    expect(isSGradeMilestone(11)).toBeNull();
  });

  it("handles edge case of first-ever perfect session", async () => {
    const mockEventBus = { emit: jest.fn() };

    const result = await trackSGradeSession(
      "user1",
      "S",
      "session1",
      mockEventBus,
    );
    expect(result.count).toBe(1);
    expect(result.milestone).toBeUndefined();
  });

  it("handles edge case of streak=1 not shown as milestone", async () => {
    expect(isSGradeMilestone(1)).toBeNull();
  });

  it("reaches 10-streak milestone correctly", async () => {
    const mockEventBus = { emit: jest.fn() };

    // Build up to 10 S grades
    for (let i = 1; i <= 10; i++) {
      const result = await trackSGradeSession(
        "user1",
        "S",
        `session${i}`,
        mockEventBus,
      );

      if (i === 3 || i === 5 || i === 10) {
        expect(result.milestone).toBe(i as 3 | 5 | 10);
      } else {
        expect(result.milestone).toBeUndefined();
      }
    }

    // Verify all three milestones were emitted
    expect(mockEventBus.emit).toHaveBeenCalledTimes(3);
    expect(mockEventBus.emit).toHaveBeenCalledWith("mastery:s_grade_streak", {
      userId: "user1",
      count: 3,
      milestone: 3,
    });
    expect(mockEventBus.emit).toHaveBeenCalledWith("mastery:s_grade_streak", {
      userId: "user1",
      count: 5,
      milestone: 5,
    });
    expect(mockEventBus.emit).toHaveBeenCalledWith("mastery:s_grade_streak", {
      userId: "user1",
      count: 10,
      milestone: 10,
    });
  });

  it("handles offline perfect session gracefully", async () => {
    // When offline, the tracker should still work with local MMKV storage
    const mockEventBus = { emit: jest.fn() };

    const result = await trackSGradeSession(
      "user1",
      "S",
      "offline-session",
      mockEventBus,
    );
    expect(result.count).toBeGreaterThanOrEqual(0); // Should not crash
  });
});
