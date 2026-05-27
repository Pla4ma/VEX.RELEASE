import {
  initializeSessionBossIntegration,
  calculateBossDamage,
} from "../SessionBossIntegration";
import {
  mockedEventBus,
  mockedConsumeBountiesOnDamage,
  mockedRecordBountyLootBoost,
  MOCK_ENCOUNTER,
  buildSessionSummary,
  setupMocks,
} from "./SessionBossIntegration.helpers";

describe("SessionBossIntegration > bounty loot boost", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("arms a one-shot chest loot boost when boss damage consumes bounties", async () => {
    initializeSessionBossIntegration();
    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    mockedConsumeBountiesOnDamage.mockReturnValue({
      lootMultiplier: 4,
      consumedCount: 2,
      consumedBountyIds: [
        "123e4567-e89b-12d3-a456-426614174010",
        "123e4567-e89b-12d3-a456-426614174011",
      ],
    });
    await handler?.({
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      userId: "user-123",
      summary: buildSessionSummary({
        focusQuality: 90,
        focusPurityScore: 90,
        streakDays: 7,
        userLevel: 2,
      }),
    });
    expect(mockedConsumeBountiesOnDamage).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      expect.any(Number),
    );
    expect(mockedRecordBountyLootBoost).toHaveBeenCalledWith({
      userId: "user-123",
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      encounterId: "123e4567-e89b-12d3-a456-426614174000",
      lootMultiplier: 4,
      consumedCount: 2,
    });
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      "analytics:track",
      expect.objectContaining({ event: "boss_bounty_loot_boost_armed" }),
    );
  });
});

describe("SessionBossIntegration > calculateBossDamage", () => {
  it("applies daily boss damage modifiers to matching session modes", () => {
    const sprintDamage = calculateBossDamage({
      ...buildSessionSummary({
        sessionMode: "SPRINT",
        modeBonus: 0,
        createdAt: new Date("2026-04-29T12:00:00-04:00").getTime(),
      }),
    } as Parameters<typeof calculateBossDamage>[0]);
    expect(sprintDamage).toBe(72);
  });
});
