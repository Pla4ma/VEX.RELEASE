import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as service from '../service';
import * as repository from '../repository';
import { eventBus } from '../../../events';
import type { UserAchievement } from '../types';

jest.mock('../repository');
jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));
jest.mock('../../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));
jest.mock('../../../shared/analytics/analytics-events', () => ({
  ProgressionEvents: { ACHIEVEMENT_UNLOCKED: 'achievement_unlocked' },
}));

const mockedRepository = jest.mocked(repository);
const mockedEventBus = jest.mocked(eventBus);

const mockUserAchievement = (
  overrides: Partial<UserAchievement> = {},
): UserAchievement => ({
  userId: 'user-1',
  achievementId: 'session-first',
  progress: 0,
  maxProgress: 1,
  isUnlocked: false,
  progressHistory: [],
  ...overrides,
});

describe('updateAchievementProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns an empty array when no achievements match the condition type', async () => {
    const result = await service.updateAchievementProgress(
      'user-1',
      'NONEXISTENT_CONDITION',
      1,
    );
    expect(result).toEqual([]);
    expect(mockedRepository.updateAchievementProgress).not.toHaveBeenCalled();
  });

  it('skips already-unlocked achievements', async () => {
    mockedRepository.getUserAchievement.mockResolvedValue(
      mockUserAchievement({ isUnlocked: true }),
    );
    mockedRepository.updateAchievementProgress.mockResolvedValue(null);
    const result = await service.updateAchievementProgress(
      'user-1',
      'SESSION_COMPLETE',
      1,
    );
    expect(mockedRepository.updateAchievementProgress).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('updates progress for a matching achievement', async () => {
    mockedRepository.getUserAchievement.mockResolvedValue(null);
    const updated = mockUserAchievement({ progress: 1, isUnlocked: false });
    mockedRepository.updateAchievementProgress.mockResolvedValue(updated);
    const result = await service.updateAchievementProgress(
      'user-1',
      'SESSION_COMPLETE',
      1,
    );
    expect(mockedRepository.updateAchievementProgress).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
  });

  it('unlocks a GREATER_THAN achievement when value meets target', async () => {
    mockedRepository.getUserAchievement.mockResolvedValue(null);
    const unlockedAchievement = mockUserAchievement({
      achievementId: 'session-first',
      progress: 1,
      isUnlocked: true,
      unlockedAt: Date.now(),
    });
    mockedRepository.updateAchievementProgress.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === 'session-first') {
          return unlockedAchievement;
        }
        return mockUserAchievement({ achievementId });
      },
    );
    await service.updateAchievementProgress('user-1', 'SESSION_COMPLETE', 1);
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      'achievement:unlocked',
      expect.objectContaining({
        userId: 'user-1',
        achievementId: 'session-first',
      }),
    );
  });

  it('emits economy event when achievement has coin reward', async () => {
    mockedRepository.getUserAchievement.mockResolvedValue(null);
    const unlockedAchievement = mockUserAchievement({
      achievementId: 'session-first',
      progress: 1,
      isUnlocked: true,
      unlockedAt: Date.now(),
    });
    mockedRepository.updateAchievementProgress.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === 'session-first') {
          return unlockedAchievement;
        }
        return mockUserAchievement({ achievementId });
      },
    );
    await service.updateAchievementProgress('user-1', 'SESSION_COMPLETE', 1);
    const economyCall = (mockedEventBus.publish as jest.Mock).mock.calls.find(
      ([event]: [string]) => event === 'economy:add-currency',
    );
    expect(economyCall).toBeDefined();
  });

  it('accumulates progress for CUMULATIVE achievements', async () => {
    const currentProgress = mockUserAchievement({
      achievementId: 'session-10',
      progress: 8,
      isUnlocked: false,
    });
    mockedRepository.getUserAchievement.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === 'session-10') {
          return currentProgress;
        }
        return null;
      },
    );
    mockedRepository.updateAchievementProgress.mockImplementation(
      async (_userId, achievementId, data) => ({
        ...mockUserAchievement({ achievementId }),
        ...data,
      }),
    );
    await service.updateAchievementProgress('user-1', 'SESSION_COMPLETE', 1);
    const call = (
      mockedRepository.updateAchievementProgress as jest.Mock
    ).mock.calls.find(([, id]: [string, string]) => id === 'session-10');
    expect(call).toBeDefined();
    const updateData = call?.[2] as
      | { progress: number; isUnlocked: boolean }
      | undefined;
    expect(updateData?.progress).toBe(9);
    expect(updateData?.isUnlocked).toBe(false);
  });

  it('unlocks a CUMULATIVE achievement when threshold is exactly reached', async () => {
    const currentProgress = mockUserAchievement({
      achievementId: 'session-10',
      progress: 9,
      isUnlocked: false,
    });
    mockedRepository.getUserAchievement.mockImplementation(
      async (_userId, achievementId) => {
        if (achievementId === 'session-10') {
          return currentProgress;
        }
        return null;
      },
    );
    mockedRepository.updateAchievementProgress.mockImplementation(
      async (_userId, achievementId, data) => ({
        ...mockUserAchievement({ achievementId }),
        ...data,
      }),
    );
    await service.updateAchievementProgress('user-1', 'SESSION_COMPLETE', 1);
    const call = (
      mockedRepository.updateAchievementProgress as jest.Mock
    ).mock.calls.find(([, id]: [string, string]) => id === 'session-10');
    const updateData = call?.[2] as
      | { progress: number; isUnlocked: boolean }
      | undefined;
    expect(updateData?.progress).toBe(10);
    expect(updateData?.isUnlocked).toBe(true);
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      'achievement:unlocked',
      expect.objectContaining({
        userId: 'user-1',
        achievementId: 'session-10',
      }),
    );
  });
});
