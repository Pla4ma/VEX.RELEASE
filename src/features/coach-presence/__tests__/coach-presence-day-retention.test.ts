/**
 * Coach Presence — Day Retention Tests
 */

import { coachMomentFromJourneyState, shouldShowRetentionMoment } from "../day-retention";

describe("day-retention", () => {
  test("shouldShowRetentionMoment returns null for day 0", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 0, lastRetentionShownDay: null })).toBeNull();
  });

  test("shouldShowRetentionMoment returns day_1 for day 1", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 1, lastRetentionShownDay: null })).toBe("day_1");
  });

  test("shouldShowRetentionMoment returns day_3 for day 3", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 3, lastRetentionShownDay: null })).toBe("day_3");
  });

  test("shouldShowRetentionMoment returns day_7 for day 7", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 7, lastRetentionShownDay: null })).toBe("day_7");
  });

  test("shouldShowRetentionMoment returns null for non-milestone day", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 5, lastRetentionShownDay: null })).toBeNull();
  });

  test("shouldShowRetentionMoment returns null when already shown on that day", () => {
    expect(shouldShowRetentionMoment({ daysSinceFirstSession: 3, lastRetentionShownDay: 3 })).toBeNull();
  });
});
