import {
  purchaseTheme,
  unlockTheme,
  equipTheme,
} from '../service';
import { getEconomyService } from '../../../economy/EconomyService';
import { getDefaultStorageAdapter } from '../../../persistence/MMKVStorageAdapter';

jest.mock('../../../economy/EconomyService');
jest.mock('../../../persistence/MMKVStorageAdapter');

const mockStorage = { getItem: jest.fn(), setItem: jest.fn() };
(getDefaultStorageAdapter as jest.Mock).mockReturnValue(mockStorage);
const TEST_USER_ID = 'test-user-123';

describe('Themes Service — Purchases & Unlocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
  });

  describe('purchaseTheme', () => {
    it('should purchase theme and deduct coins', async () => {
      const mockSpendCurrency = jest.fn().mockResolvedValue(true);
      (getEconomyService as jest.Mock).mockReturnValue({
        spendCurrency: mockSpendCurrency,
      });
      const result = await purchaseTheme(TEST_USER_ID, 'premium_ocean');
      expect(result.success).toBe(true);
      expect(result.themeId).toBe('premium_ocean');
      expect(mockSpendCurrency).toHaveBeenCalledWith(
        TEST_USER_ID,
        'COINS',
        expect.any(Number),
        'theme_purchase',
      );
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error for already unlocked theme', async () => {
      const storedThemes = {
        unlocked: ['default_light', 'premium_ocean'],
        equipped: 'default_light',
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(
        purchaseTheme(TEST_USER_ID, 'premium_ocean'),
      ).rejects.toThrow('Theme already unlocked');
    });

    it('should throw error for non-existent theme', async () => {
      await expect(purchaseTheme(TEST_USER_ID, 'non_existent')).rejects.toThrow(
        'Theme not found',
      );
    });

    it('should throw error on insufficient funds', async () => {
      const mockSpendCurrency = jest
        .fn()
        .mockRejectedValue(new Error('Insufficient funds'));
      (getEconomyService as jest.Mock).mockReturnValue({
        spendCurrency: mockSpendCurrency,
      });
      await expect(
        purchaseTheme(TEST_USER_ID, 'premium_ocean'),
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('unlockTheme', () => {
    it('should unlock theme via achievement', async () => {
      const result = await unlockTheme(TEST_USER_ID, 'achievement_theme', {
        type: 'achievement',
        achievementId: 'seven_day_streak',
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe('achievement');
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should unlock theme via mastery rank', async () => {
      const result = await unlockTheme(TEST_USER_ID, 'master_theme', {
        type: 'mastery',
        rank: 'MASTER',
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe('mastery');
    });

    it('should unlock theme via season pass', async () => {
      const result = await unlockTheme(TEST_USER_ID, 'season_exclusive', {
        type: 'season',
        seasonId: 'season_1',
        tier: 20,
      });
      expect(result.success).toBe(true);
      expect(result.unlockedVia).toBe('season');
    });

    it('should throw error for already unlocked theme', async () => {
      const storedThemes = {
        unlocked: ['default_light', 'achievement_theme'],
        equipped: 'default_light',
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(
        unlockTheme(TEST_USER_ID, 'achievement_theme', {
          type: 'achievement',
          achievementId: 'test',
        }),
      ).rejects.toThrow('Theme already unlocked');
    });
  });

  describe('equipTheme', () => {
    it('should equip unlocked theme', async () => {
      const storedThemes = {
        unlocked: ['default_light', 'ocean_blue'],
        equipped: 'default_light',
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      const result = await equipTheme(TEST_USER_ID, 'ocean_blue');
      expect(result.success).toBe(true);
      expect(result.equippedTheme).toBe('ocean_blue');
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error for locked theme', async () => {
      const storedThemes = {
        unlocked: ['default_light'],
        equipped: 'default_light',
      };
      mockStorage.getItem.mockResolvedValue(JSON.stringify(storedThemes));
      await expect(equipTheme(TEST_USER_ID, 'locked_theme')).rejects.toThrow(
        'Theme not unlocked',
      );
    });

    it('should throw error for non-existent theme', async () => {
      await expect(equipTheme(TEST_USER_ID, 'non_existent')).rejects.toThrow(
        'Theme not found',
      );
    });
  });
});
