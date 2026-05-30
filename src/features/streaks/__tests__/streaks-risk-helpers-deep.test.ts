/**
 * Deep Streaks Tests — riskHelpers & riskTypes constants
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock("../../../utils/uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock("../repository", () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("../repository-helpers", () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import { analyzePattern, calculateRecentQuality, getRiskLevel } from "../utils/riskHelpers";
import { WEIGHTS, CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD } from "../utils/riskTypes";

// ============================================================================
// riskHelpers
// ============================================================================

describe("riskHelpers: analyzePattern", () => {
  it("returns CONSISTENT for fewer than 5 sessions", () => {
    expect(
      analyzePattern([
        { timestamp: 1000, quality: 80 },
        { timestamp: 2000, quality: 85 },
      ]),
    ).toBe("CONSISTENT");
  });

  it("returns CONSISTENT for evenly spaced sessions", () => {
    const now = Date.now();
    const sessions = Array.from({ length: 6 }, (_, i) => ({
      timestamp: now - (5 - i) * 86400000,
      quality: 80,
    }));
    expect(analyzePattern(sessions)).toBe("CONSISTENT");
  });

  it("returns DECLINING for increasing gaps", () => {
    const now = Date.now();
    const d = 86400000;
    const sessions = [
      { timestamp: now - 20 * d, quality: 80 },
      { timestamp: now - 19 * d, quality: 80 },
      { timestamp: now - 17 * d, quality: 80 },
      { timestamp: now - 14 * d, quality: 80 },
      { timestamp: now - 10 * d, quality: 80 },
      { timestamp: now - 5 * d, quality: 80 },
    ];
    // gaps: 1, 2, 3, 4, 5 → 4/4 increasing → 1.0 > 0.7 → DECLINING
    expect(analyzePattern(sessions)).toBe("DECLINING");
  });
});

describe("riskHelpers: calculateRecentQuality", () => {
  it("returns 100 for empty history", () => {
    expect(calculateRecentQuality([])).toBe(100);
  });

  it("averages last 5 sessions", () => {
    const sessions = [
      { timestamp: 1, quality: 80 },
      { timestamp: 2, quality: 90 },
      { timestamp: 3, quality: 70 },
    ];
    expect(calculateRecentQuality(sessions)).toBe(80);
  });

  it("only uses last 5 when more exist", () => {
    const sessions = [
      { timestamp: 1, quality: 100 },
      { timestamp: 2, quality: 100 },
      { timestamp: 3, quality: 100 },
      { timestamp: 4, quality: 100 },
      { timestamp: 5, quality: 100 },
      { timestamp: 6, quality: 80 },
      { timestamp: 7, quality: 80 },
    ];
    // last 5: 100, 100, 100, 80, 80 -> avg = 92
    expect(calculateRecentQuality(sessions)).toBe(92);
  });
});

describe("riskHelpers: getRiskLevel", () => {
  it("returns CRITICAL for high hours", () => {
    expect(getRiskLevel(0, CRITICAL_THRESHOLD)).toBe("CRITICAL");
  });

  it("returns CRITICAL for high score", () => {
    expect(getRiskLevel(85, 0)).toBe("CRITICAL");
  });

  it("returns HIGH for moderate-high values", () => {
    expect(getRiskLevel(65, 0)).toBe("HIGH");
  });

  it("returns MEDIUM for moderate values", () => {
    expect(getRiskLevel(40, 0)).toBe("MEDIUM");
  });

  it("returns LOW for low-moderate values", () => {
    expect(getRiskLevel(20, 2)).toBe("LOW");
  });

  it("returns NONE for safe values", () => {
    expect(getRiskLevel(0, 0)).toBe("NONE");
  });
});

// ============================================================================
// riskTypes constants
// ============================================================================

describe("riskTypes constants", () => {
  it("WEIGHTS sum to 1.0", () => {
    const sum =
      WEIGHTS.TIME_DRIFT +
      WEIGHTS.HOURS_ELAPSED +
      WEIGHTS.PATTERN_DECLINE +
      WEIGHTS.QUALITY_DROP +
      WEIGHTS.WEEKEND_FACTOR;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("thresholds are in correct order", () => {
    expect(CRITICAL_THRESHOLD).toBeGreaterThan(HIGH_THRESHOLD);
    expect(HIGH_THRESHOLD).toBeGreaterThan(MEDIUM_THRESHOLD);
  });
});
