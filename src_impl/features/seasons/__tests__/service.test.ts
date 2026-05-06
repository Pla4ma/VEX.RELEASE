/**
 * Seasons Service Tests
 *
 * Tests for season progression and tier calculation logic.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import * as service from "../service";
import * as repository from "../repository";
import { eventBus } from "../../../events";

jest.mock("../repository");
jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

const mockedRepository = jest.mocked(repository);
const mockedEventBus = jest.mocked(eventBus);

const makeSeason = (overrides = {}) => ({
  id: "season-1",
  name: "Season One",
  description: null,
  theme: null,
  startAt: Date.now() - 1000,
  endAt: Date.now() + 30 * 24 * 3600 * 1000,
  tierCount: 30,
  xpPerTier: 100,
  premiumPriceGems: 0,
  isActive: true,
  createdAt: Date.now() - 1000,
  ...overrides,
});

const makeProgress = (overrides = {}) => ({
  id: "up-1",
  userId: "user-1",
  seasonId: "season-1",
  currentTier: 0,
  tierXp: 0,
  totalSeasonXp: 0,
  isPremium: false,
  premiumPurchasedAt: null,
  claimedTiers: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe("getActiveSeason", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the active season from repository", async () => {
    const season = makeSeason();
    mockedRepository.fetchActiveSeason.mockResolvedValue(season as any);
    const result = await service.getActiveSeason();
    expect(result?.id).toBe("season-1");
  });

  it("returns null when no active season exists", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(null);
    const result = await service.getActiveSeason();
    expect(result).toBeNull();
  });

  it("rethrows errors from the repository", async () => {
    mockedRepository.fetchActiveSeason.mockRejectedValue(new Error("DB error"));
    await expect(service.getActiveSeason()).rejects.toThrow("DB error");
  });
});

describe("getUpcomingSeasons", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns upcoming seasons array", async () => {
    const seasons = [makeSeason({ id: "s2", isActive: false })];
    mockedRepository.fetchUpcomingSeasons.mockResolvedValue(seasons as any);
    const result = await service.getUpcomingSeasons();
    expect(result).toHaveLength(1);
  });

  it("returns empty array when no upcoming seasons", async () => {
    mockedRepository.fetchUpcomingSeasons.mockResolvedValue([]);
    const result = await service.getUpcomingSeasons();
    expect(result).toEqual([]);
  });

  it("rethrows repository errors", async () => {
    mockedRepository.fetchUpcomingSeasons.mockRejectedValue(new Error("fail"));
    await expect(service.getUpcomingSeasons()).rejects.toThrow("fail");
  });
});

describe("getUserSeasonProgress", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when userId is empty", async () => {
    const result = await service.getUserSeasonProgress("", "season-1");
    expect(result).toBeNull();
    expect(mockedRepository.fetchUserSeasonProgress).not.toHaveBeenCalled();
  });

  it("returns null when seasonId is empty", async () => {
    const result = await service.getUserSeasonProgress("user-1", "");
    expect(result).toBeNull();
  });

  it("returns progress from repository", async () => {
    const progress = makeProgress();
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(progress as any);
    const result = await service.getUserSeasonProgress("user-1", "season-1");
    expect(result?.userId).toBe("user-1");
  });

  it("rethrows repository errors", async () => {
    mockedRepository.fetchUserSeasonProgress.mockRejectedValue(new Error("fail"));
    await expect(service.getUserSeasonProgress("user-1", "season-1")).rejects.toThrow("fail");
  });
});

describe("addSeasonXP", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns zeroed result when no active season", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(null);

    const result = await service.addSeasonXP("user-1", 50, "session");
    expect(result.newTier).toBe(0);
    expect(result.tiersGained).toBe(0);
    expect(result.totalSeasonXp).toBe(0);
  });

  it("returns zeroed result when no user progress", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason() as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(null);

    const result = await service.addSeasonXP("user-1", 50, "session");
    expect(result.tiersGained).toBe(0);
  });

  it("returns zeroed result when amount is 0 or negative", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason() as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress() as any);

    const result = await service.addSeasonXP("user-1", 0, "session");
    expect(result.tiersGained).toBe(0);
  });

  it("calculates new tier correctly", async () => {
    // xpPerTier = 100, adding 100 XP from tier 0 => tier 1
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 0, totalSeasonXp: 0 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    const result = await service.addSeasonXP("user-1", 100, "session");
    expect(result.newTier).toBe(1);
    expect(result.tiersGained).toBe(1);
    expect(result.totalSeasonXp).toBe(100);

    expect(mockedRepository.updateUserSeasonProgress).toHaveBeenCalledWith("user-1", "season-1", expect.objectContaining({ currentTier: 1, totalSeasonXp: 100 }));
  });

  it("emits tier_unlocked events for each tier gained", async () => {
    // Adding 300 XP at xpPerTier=100, from tier 0 => gains 3 tiers
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100, tierCount: 30 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 0, totalSeasonXp: 0 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    await service.addSeasonXP("user-1", 300, "session");

    const tierCalls = (mockedEventBus.publish as jest.Mock).mock.calls.filter(([event]) => event === "season:tier_unlocked");
    expect(tierCalls.length).toBe(3);
    expect(tierCalls[0]?.[1]).toMatchObject({ userId: "user-1", tier: 1 });
    expect(tierCalls[1]?.[1]).toMatchObject({ tier: 2 });
    expect(tierCalls[2]?.[1]).toMatchObject({ tier: 3 });
  });

  it("does not emit tier events when no tiers gained", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 0, totalSeasonXp: 50 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    await service.addSeasonXP("user-1", 49, "session"); // 50+49=99, not enough for tier 1

    expect(mockedEventBus.publish).not.toHaveBeenCalled();
  });

  it("caps tier at tierCount maximum", async () => {
    // Already at last tier (29), adding enough for 2 more would go to 31 but cap is 30
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100, tierCount: 30 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 29, totalSeasonXp: 2900 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    const result = await service.addSeasonXP("user-1", 300, "session");
    expect(result.newTier).toBe(30); // capped at tierCount
  });

  it("sets tierXp to 0 when at max tier", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100, tierCount: 30 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 29, totalSeasonXp: 2900 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    await service.addSeasonXP("user-1", 200, "session");

    const updateCall = (mockedRepository.updateUserSeasonProgress as jest.Mock).mock.calls[0];
    const updateData = updateCall?.[2] as { tierXp: number } | undefined;
    expect(updateData?.tierXp).toBe(0);
  });

  it("passes correct source to tier_unlocked events", async () => {
    mockedRepository.fetchActiveSeason.mockResolvedValue(makeSeason({ xpPerTier: 100 }) as any);
    mockedRepository.fetchUserSeasonProgress.mockResolvedValue(makeProgress({ currentTier: 0, totalSeasonXp: 0 }) as any);
    mockedRepository.updateUserSeasonProgress.mockResolvedValue(undefined as any);

    await service.addSeasonXP("user-1", 100, "boss_kill");

    const tierCall = (mockedEventBus.publish as jest.Mock).mock.calls.find(([event]) => event === "season:tier_unlocked");
    expect(tierCall?.[1]).toMatchObject({ source: "boss_kill" });
  });
});
