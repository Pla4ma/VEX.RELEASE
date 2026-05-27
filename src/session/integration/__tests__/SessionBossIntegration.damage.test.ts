import { initializeSessionBossIntegration } from "../SessionBossIntegration";
import {
  mockedEventBus,
  mockedApplyDamage,
  mockedGetActiveEncounter,
  MOCK_ENCOUNTER,
  buildSessionSummary,
  setupMocks,
} from "./SessionBossIntegration.helpers";

describe("SessionBossIntegration > event-driven damage", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("applies boss damage from a completed focus session", async () => {
    initializeSessionBossIntegration();
    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    expect(handler).toBeDefined();
    mockedGetActiveEncounter.mockResolvedValue(MOCK_ENCOUNTER as never);
    await handler?.({
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      userId: "user-123",
      summary: buildSessionSummary(),
    });
    expect(mockedApplyDamage).toHaveBeenCalledWith({
      encounterId: "123e4567-e89b-12d3-a456-426614174000",
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      damage: 18,
    });
  });

  it("skips damage when there is no active encounter", async () => {
    initializeSessionBossIntegration();
    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    mockedGetActiveEncounter.mockResolvedValue(null);
    await handler?.({
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      userId: "user-123",
      summary: buildSessionSummary({
        plannedDuration: 600000,
        actualDuration: 600000,
        effectiveDuration: 600000,
        focusQuality: 100,
        focusPurityScore: 100,
      }),
    });
    expect(mockedApplyDamage).not.toHaveBeenCalled();
  });

  it("skips Perfectionist damage when the completed session is below S-grade", async () => {
    initializeSessionBossIntegration();
    const handler = mockedEventBus.subscribe.mock.calls[0]?.[1];
    mockedGetActiveEncounter.mockResolvedValue({
      ...MOCK_ENCOUNTER,
      bossId: "boss-perfectionist",
      bossName: "The Perfectionist",
    } as never);
    await handler?.({
      sessionId: "123e4567-e89b-12d3-a456-426614174002",
      userId: "user-123",
      summary: buildSessionSummary({ focusQuality: 94, focusPurityScore: 94 }),
    });
    expect(mockedApplyDamage).not.toHaveBeenCalled();
  });
});
