import { initializeSessionBossIntegration } from "../SessionBossIntegration";
import { eventBus } from "../../../events";
import { getAvailabilityFor } from "../../../features/liveops-config/feature-access-store";
import {
  applyDamage,
  getActiveEncounter,
} from "../../../features/boss/service";

jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(jest.fn()),
  },
}));
jest.mock("../../../features/liveops-config/feature-access-store", () => ({
  getAvailabilityFor: jest.fn(),
}));
jest.mock("../../../features/boss/service", () => ({
  applyDamage: jest.fn(),
  getActiveEncounter: jest.fn(),
}));
jest.mock(
  "../../../features/boss/damage-rules",
  () => ({
    applyBossDamageRules: jest.fn((dmg) => dmg),
  }),
  { virtual: true },
);
jest.mock(
  "../../../features/boss/BossBountySystem",
  () => ({
    consumeBountiesOnDamage: jest.fn().mockReturnValue({
      lootMultiplier: 1,
      consumedCount: 0,
      consumedBountyIds: [],
    }),
  }),
  { virtual: true },
);
jest.mock(
  "../../../features/boss/bounty-loot-boost",
  () => ({
    recordBountyLootBoost: jest.fn(),
  }),
  { virtual: true },
);
describe("SessionBossIntegration - FeatureAvailability gating", () => {
  const mockedEventBus = jest.mocked(eventBus);
  const mockedGetAvailability = jest.mocked(getAvailabilityFor);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEventBus.subscribe.mockReturnValue(jest.fn());
  });

  it("should not subscribe when boss_tab cannot subscribe to events", () => {
    mockedGetAvailability.mockReturnValue({
      state: "locked",
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canExpose: false,
      canShowTeaser: false,
      snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
    } as ReturnType<typeof getAvailabilityFor>);

    const cleanup = initializeSessionBossIntegration();
    expect(typeof cleanup).toBe("function");
    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it("boss integration is no-op when boss features archived", () => {
    mockedGetAvailability.mockReturnValue({
      state: "unlocked",
      canRenderEntryPoint: true,
      canNavigate: true,
      canQuery: true,
      canRegisterRoute: true,
      canSubscribeToEvents: true,
      canExpose: true,
      canShowTeaser: false,
      snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
    } as ReturnType<typeof getAvailabilityFor>);

    initializeSessionBossIntegration();
    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });

  it("should not subscribe when boss_tab is hidden", () => {
    mockedGetAvailability.mockReturnValue({
      state: "hidden",
      canRenderEntryPoint: false,
      canNavigate: false,
      canQuery: false,
      canRegisterRoute: false,
      canSubscribeToEvents: false,
      canExpose: false,
      canShowTeaser: false,
      snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
    } as ReturnType<typeof getAvailabilityFor>);

    initializeSessionBossIntegration();
    expect(mockedEventBus.subscribe).not.toHaveBeenCalled();
  });
});
