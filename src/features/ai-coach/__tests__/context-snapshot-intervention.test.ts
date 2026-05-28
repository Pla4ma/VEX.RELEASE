import {
  determineInterventionPriority,
  getContextHash,
} from "../context-snapshot";
import { createTestSnapshot } from "./context-snapshot-fixtures";

describe("determineInterventionPriority", () => {
  it("returns critical when streak at risk", () => {
    const snapshot = createTestSnapshot({
      streakContext: { streakAtRisk: true, hoursSinceLastSession: 20 },
    });
    expect(determineInterventionPriority(snapshot)).toBe("critical");
  });

  it("returns high when boss ending soon", () => {
    const snapshot = createTestSnapshot({
      bossContext: {
        activeBoss: true,
        bossId: "boss-123",
        bossHealth: 30,
        timeRemaining: 12 * 60 * 60 * 1000,
      },
    });
    expect(determineInterventionPriority(snapshot)).toBe("high");
  });

  it("returns medium when hours since session high", () => {
    const snapshot = createTestSnapshot({
      streakContext: { currentStreak: 3, hoursSinceLastSession: 25 },
    });
    expect(determineInterventionPriority(snapshot)).toBe("medium");
  });

  it("returns low for normal context", () => {
    const snapshot = createTestSnapshot();
    expect(determineInterventionPriority(snapshot)).toBe("low");
  });
});

describe("getContextHash", () => {
  it("generates consistent hash", () => {
    const snapshot = createTestSnapshot({ capturedAt: 1234567890 });
    const hash = getContextHash(snapshot);
    expect(hash).toContain("ctx-");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(4);
  });
});
