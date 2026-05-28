import { eventBus } from "../../../events";
import { consumeBountiesOnDamage } from "../../features/boss/service";
import { recordBountyLootBoost } from "../../features/boss/service";
import {
  applyDamage,
  getActiveEncounter,
} from "../../features/boss/service";

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));
jest.mock("../../../features/boss/BossBountySystem", () => ({
  consumeBountiesOnDamage: jest.fn(),
}));
jest.mock("../../../features/boss/bounty-loot-boost", () => ({
  recordBountyLootBoost: jest.fn(),
}));
jest.mock("../../../features/boss/service", () => ({
  applyDamage: jest.fn(),
  getActiveEncounter: jest.fn(),
}));

export const mockedEventBus = jest.mocked(eventBus);
export const mockedApplyDamage = jest.mocked(applyDamage);
export const mockedConsumeBountiesOnDamage = jest.mocked(
  consumeBountiesOnDamage,
);
export const mockedRecordBountyLootBoost = jest.mocked(recordBountyLootBoost);
export const mockedGetActiveEncounter = jest.mocked(getActiveEncounter);

export const MOCK_ENCOUNTER = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  bossId: "123e4567-e89b-12d3-a456-426614174001",
  bossName: "Focus Fiend",
  bossAvatarUrl: null,
  healthRemaining: 500,
  maxHealth: 1000,
  percentHealthRemaining: 50,
  status: "ACTIVE" as const,
  expiresAt: Date.now() + 60000,
  timeRemaining: 60000,
};

export function buildSessionSummary(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    sessionId: "123e4567-e89b-12d3-a456-426614174002",
    userId: "user-123",
    status: "COMPLETED",
    plannedDuration: 1800000,
    actualDuration: 1800000,
    effectiveDuration: 1800000,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 80,
    focusPurityScore: 80,
    interruptions: 0,
    pauses: 0,
    baseScore: 100,
    timeBonus: 0,
    streakBonus: 0,
    finalScore: 100,
    xpEarned: 100,
    coinsEarned: 20,
    gemsEarned: 0,
    streakMaintained: true,
    streakIncreased: true,
    streakDays: 3,
    userLevel: 1,
    damageTaken: 0,
    penaltiesApplied: [],
    bonuses: [],
    vsAverage: 0,
    vsBest: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

export function setupMocks(): void {
  jest.clearAllMocks();
  mockedEventBus.subscribe.mockReturnValue(jest.fn());
  mockedConsumeBountiesOnDamage.mockReturnValue({
    lootMultiplier: 1,
    consumedCount: 0,
    consumedBountyIds: [],
  });
}
