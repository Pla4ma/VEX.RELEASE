import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Debug mock ────────────────────────────────────────────────────────────
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// ─── Repository mock (auto-mock) ───────────────────────────────────────────
jest.mock('../repository');

// ─── Imports (after mocks) ──────────────────────────────────────────────────
import * as repository from '../repository';
import * as statsService from '../stats';
import { ALL_ACHIEVEMENTS } from '../definitions';
import type { UserAchievement } from '../types';

// ─── Typed mock accessors ──────────────────────────────────────────────────
const mockedRepository = jest.mocked(repository);

// ─── Helpers ────────────────────────────────────────────────────────
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

describe('Stats Service', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('resetUserAchievements', () => {
    it('delegates to repository.resetAllUserAchievements', async () => {
      await statsService.resetUserAchievements('user-1');
      expect(mockedRepository.resetAllUserAchievements).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getAchievementStats', () => {
    it('returns totals matching ALL_ACHIEVEMENTS length when no user data', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const stats = await statsService.getAchievementStats('user-1');
      expect(stats.total).toBe(ALL_ACHIEVEMENTS.length);
      expect(stats.unlocked).toBe(0);
    });

    it('counts unlocked achievements correctly', async () => {
      const realAch = ALL_ACHIEVEMENTS[0]!;
      mockedRepository.getUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
        if (achId === realAch.id) {return mockUserAchievement({ achievementId: achId, isUnlocked: true });}
        return null;
      });
      const stats = await statsService.getAchievementStats('user-1');
      expect(stats.unlocked).toBe(1);
    });

    it('includes hiddenUnlocked count', async () => {
      const hiddenAch = ALL_ACHIEVEMENTS.find((a) => a.isHidden);
      if (hiddenAch) {
        mockedRepository.getUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
          if (achId === hiddenAch.id) {return mockUserAchievement({ achievementId: achId, isUnlocked: true });}
          return null;
        });
        const stats = await statsService.getAchievementStats('user-1');
        expect(stats.hiddenUnlocked).toBeGreaterThanOrEqual(1);
      }
    });

    it('byTier contains entries for rarity tiers', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const stats = await statsService.getAchievementStats('user-1');
      expect(Object.keys(stats.byTier).length).toBeGreaterThan(0);
    });

    it('byCategory contains entries for categories', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const stats = await statsService.getAchievementStats('user-1');
      expect(Object.keys(stats.byCategory).length).toBeGreaterThan(0);
    });
  });

  describe('getNextAchievements', () => {
    it('sorts by percentComplete descending', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements('user-1', 10);
      if (result.length >= 2) {
        expect(result[0]!.percentComplete).toBeGreaterThanOrEqual(result[1]!.percentComplete);
      }
    });

    it('excludes hidden achievements', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements('user-1', 100);
      expect(result.every((a) => !a.isHidden)).toBe(true);
    });

    it('respects limit parameter', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements('user-1', 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('includes remaining and percentComplete fields', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const result = await statsService.getNextAchievements('user-1', 1);
      if (result.length > 0) {
        expect(typeof result[0]!.remaining).toBe('number');
        expect(typeof result[0]!.percentComplete).toBe('number');
      }
    });
  });

  describe('getAllAchievementsWithProgress', () => {
    it('returns achievements with default progress when no user data', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const result = await statsService.getAllAchievementsWithProgress('user-1');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((a) => a.progress === 0)).toBe(true);
      expect(result.every((a) => !a.isUnlocked)).toBe(true);
    });

    it('merges user progress with achievement definitions', async () => {
      mockedRepository.getUserAchievement.mockImplementation(async (_uid: string, achId: string) => {
        if (achId === ALL_ACHIEVEMENTS[0]!.id) {
          return mockUserAchievement({ achievementId: achId, progress: 1, isUnlocked: true });
        }
        return null;
      });
      const result = await statsService.getAllAchievementsWithProgress('user-1');
      const first = result.find((a) => a.id === ALL_ACHIEVEMENTS[0]!.id);
      expect(first?.progress).toBe(1);
      expect(first?.isUnlocked).toBe(true);
    });
  });

  describe('revealHiddenAchievement', () => {
    it('returns proper info for a known achievement', () => {
      const info = statsService.revealHiddenAchievement(ALL_ACHIEVEMENTS[0]!.id);
      expect(info.name).not.toBe('???' );
      expect(info.description).not.toBe('Unknown achievement');
    });

    it('returns placeholder for unknown id', () => {
      const info = statsService.revealHiddenAchievement('nonexistent');
      expect(info.name).toBe('???' );
      expect(info.icon).toBe('❓');
    });
  });

  describe('getCompletionPercentage', () => {
    it('returns 0 when no achievements unlocked', async () => {
      mockedRepository.getUserAchievement.mockResolvedValue(null);
      const pct = await statsService.getCompletionPercentage('user-1');
      expect(pct).toBe(0);
    });
  });

  describe('getRecentlyUnlockedAchievements', () => {
    it('returns empty when no user achievements', async () => {
      mockedRepository.getAllUserAchievements.mockResolvedValue([]);
      const result = await statsService.getRecentlyUnlockedAchievements('user-1');
      expect(result).toEqual([]);
    });

    it('respects limit parameter', async () => {
      mockedRepository.getAllUserAchievements.mockResolvedValue([]);
      const result = await statsService.getRecentlyUnlockedAchievements('user-1', 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('initializeUserAchievements', () => {
    it('creates user achievements for all definitions', async () => {
      mockedRepository.createUserAchievement.mockResolvedValue(null);
      await statsService.initializeUserAchievements('user-1');
      expect(mockedRepository.createUserAchievement).toHaveBeenCalledTimes(ALL_ACHIEVEMENTS.length);
    });
  });
});
