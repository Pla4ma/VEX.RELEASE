/**
 * Tests for home-spine tomorrow-preview-compute.ts
 * (computeTomorrowPreview)
 */

jest.mock("../../../store/mmkv-storage", () => ({
  storage: {
    set: jest.fn(),
    getString: jest.fn(() => null),
    delete: jest.fn(),
  },
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

import { computeTomorrowPreview } from "../tomorrow-preview-compute";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = "550e8400-e29b-41d4-a716-446655440000";

const baseInput = {
  userId,
  currentStreakDays: 5,
  streakWillContinue: true,
};

// ---------------------------------------------------------------------------
// tomorrow-preview-compute tests
// ---------------------------------------------------------------------------
describe("home-spine: tomorrow-preview-compute", () => {
  it("returns GENERIC fallback when no candidates match", () => {
    const result = computeTomorrowPreview(baseInput);
    expect(result.type).toBe("GENERIC");
    expect(result.headline).toBeTruthy();
  });

  it("returns GENERIC with streak copy when streakWillContinue is true", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      streakWillContinue: true,
    });
    expect(result.headline).toContain("Streak");
  });

  it("returns GENERIC with fresh-start copy when streakWillContinue is false", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      streakWillContinue: false,
    });
    expect(result.headline).toContain("New Day");
  });

  it("picks highest-priority (lowest number) candidate", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      currentStreakDays: 6, // tomorrow = day 7, milestone
      bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: true },
    });
    // STREAK_MILESTONE has priority 1, BOSS_NEAR_DEATH has priority 2
    expect(result.type).toBe("STREAK_MILESTONE");
  });

  it("picks boss when no milestone but boss is near death", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      currentStreakDays: 3, // tomorrow = day 4, not a milestone
      bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: false },
    });
    expect(result.type).toBe("BOSS_NEAR_DEATH");
  });
});
