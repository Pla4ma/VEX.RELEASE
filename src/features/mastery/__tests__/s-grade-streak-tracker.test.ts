/**
 * Mastery Feature — SGradeStreakTracker Tests
 */

import { isSGradeMilestone } from "../SGradeStreakTracker";

describe("SGradeStreakTracker", () => {
  it("isSGradeMilestone returns 3 for count 3", () => {
    expect(isSGradeMilestone(3)).toBe(3);
  });

  it("isSGradeMilestone returns 5 for count 5", () => {
    expect(isSGradeMilestone(5)).toBe(5);
  });

  it("isSGradeMilestone returns 10 for count 10", () => {
    expect(isSGradeMilestone(10)).toBe(10);
  });

  it("isSGradeMilestone returns null for non-milestone counts", () => {
    expect(isSGradeMilestone(0)).toBeNull();
    expect(isSGradeMilestone(1)).toBeNull();
    expect(isSGradeMilestone(2)).toBeNull();
    expect(isSGradeMilestone(4)).toBeNull();
    expect(isSGradeMilestone(7)).toBeNull();
  });
});
