import {
  getBossEngagementSignals,
  useBossEngagementSignals,
  deriveBossEngagementLevel,
} from "../boss-engagement-signals";
import type {
  BossEngagementInputs,
  BossEngagementSignal,
  BossEngagementLevel,
} from "../boss-engagement-signals";

describe("Boss engagement signals", () => {
  it("getBossEngagementSignals always returns empty array", () => {
    expect(getBossEngagementSignals({})).toEqual([]);
    expect(
      getBossEngagementSignals({
        bossUnlocked: true,
        bossRouteOpenedCount: 10,
      }),
    ).toEqual([]);
  });

  it("useBossEngagementSignals returns inputs merged with empty signals", () => {
    const inputs: BossEngagementInputs = {
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 5,
    };
    const result = useBossEngagementSignals(inputs);
    expect(result.signals).toEqual([]);
    expect(result.bossUnlocked).toBe(true);
    expect(result.canQueryBoss).toBe(true);
    expect(result.bossRouteOpenedCount).toBe(5);
  });

  it("useBossEngagementSignals works with empty inputs", () => {
    const result = useBossEngagementSignals({});
    expect(result.signals).toEqual([]);
  });

  it("deriveBossEngagementLevel always returns 'none'", () => {
    expect(deriveBossEngagementLevel({})).toBe("none");
    expect(
      deriveBossEngagementLevel({
        bossRouteOpenedCount: 100,
        bossDamageEventsCount: 50,
      }),
    ).toBe("none");
  });

  it("BossEngagementSignal has type and value", () => {
    const signal: BossEngagementSignal = { type: "test", value: 42 };
    expect(signal.type).toBe("test");
    expect(signal.value).toBe(42);
  });

  it("BossEngagementLevel type includes all expected values", () => {
    const levels: BossEngagementLevel[] = [
      "none",
      "low",
      "medium",
      "high",
    ];
    expect(levels).toHaveLength(4);
  });
});
