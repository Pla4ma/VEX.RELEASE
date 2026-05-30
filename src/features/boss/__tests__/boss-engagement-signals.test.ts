/**
 * Tests for boss-engagement-signals
 */

import {
  getBossEngagementSignals,
  useBossEngagementSignals,
  deriveBossEngagementLevel,
} from "../boss-engagement-signals";
import type { BossEngagementInputs } from "../boss-engagement-signals";

describe("boss-engagement-signals", () => {
  const emptyInputs: BossEngagementInputs = {};

  it("getBossEngagementSignals returns empty array", () => {
    expect(getBossEngagementSignals(emptyInputs)).toEqual([]);
  });

  it("getBossEngagementSignals handles populated inputs", () => {
    const inputs: BossEngagementInputs = {
      bossIgnored: false,
      bossUnlocked: true,
      canQueryBoss: true,
      bossRouteOpenedCount: 5,
      bossCTAClickedCount: 3,
      bossDamageEventsCount: 10,
      recentSessionsWithBossProgress: 2,
    };
    expect(getBossEngagementSignals(inputs)).toEqual([]);
  });

  it("useBossEngagementSignals returns inputs with empty signals", () => {
    const inputs: BossEngagementInputs = { bossUnlocked: true };
    const result = useBossEngagementSignals(inputs);
    expect(result.signals).toEqual([]);
    expect(result.bossUnlocked).toBe(true);
  });

  it("deriveBossEngagementLevel returns 'none'", () => {
    expect(deriveBossEngagementLevel(emptyInputs)).toBe("none");
  });

  it("deriveBossEngagementLevel returns 'none' with high activity", () => {
    const inputs: BossEngagementInputs = {
      bossRouteOpenedCount: 100,
      bossCTAClickedCount: 50,
      bossDamageEventsCount: 200,
    };
    expect(deriveBossEngagementLevel(inputs)).toBe("none");
  });
});
