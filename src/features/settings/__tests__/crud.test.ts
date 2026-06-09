import {
  getSetting,
  getAllSettings,
  updateSetting,
  batchUpdateSettings,
  deleteSetting,
  SettingsValidationError,
} from '../service';
import * as repository from '../repository';
import { eventBus } from '../../../events';
import * as Sentry from '@sentry/react-native';

jest.mock('../repository');
jest.mock('../../../events', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

describe('SettingsService', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSetting', () => {
    it('should fetch a single setting', async () => {
      const mockSetting = {
        id: 'setting-1',
        userId: mockUserId,
        key: 'general.language',
        value: 'en',
        category: 'general' as const,
        isDefault: true,
        lastModified: Date.now(),
      };
      (repository.fetchSetting as jest.Mock).mockResolvedValue(mockSetting);
      const result = await getSetting(mockUserId, 'general.language');
      expect(result).toEqual(mockSetting);
      expect(repository.fetchSetting).toHaveBeenCalledWith(
        mockUserId,
        'general.language',
      );
    });

    it('should return null for non-existent setting', async () => {
      (repository.fetchSetting as jest.Mock).mockResolvedValue(null);
      const result = await getSetting(mockUserId, 'nonexistent');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (repository.fetchSetting as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(getSetting(mockUserId, 'test')).rejects.toThrow('DB error');
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe('getAllSettings', () => {
    it('should fetch all settings', async () => {
      const mockSettings = [
        {
          id: '1',
          userId: mockUserId,
          key: 'a',
          value: '1',
          category: 'general' as const,
          isDefault: true,
          lastModified: Date.now(),
        },
        {
          id: '2',
          userId: mockUserId,
          key: 'b',
          value: '2',
          category: 'appearance' as const,
          isDefault: false,
          lastModified: Date.now(),
        },
      ];
      (repository.fetchAllSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const result = await getAllSettings(mockUserId);
      expect(result).toHaveLength(2);
      expect(repository.fetchAllSettings).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('updateSetting', () => {
    it('should update a setting and emit event', async () => {
      const mockSetting = {
        id: 'setting-1',
        userId: mockUserId,
        key: 'general.language',
        value: 'es',
        category: 'general' as const,
        isDefault: false,
        lastModified: Date.now(),
      };
      (repository.fetchSetting as jest.Mock).mockResolvedValue(null);
      (repository.upsertSetting as jest.Mock).mockResolvedValue(mockSetting);
      const result = await updateSetting(
        mockUserId,
        'general.language',
        'es',
        'general',
      );
      expect(result).toEqual(mockSetting);
      expect(eventBus.publish).toHaveBeenCalledWith(
        'settings:change',
        expect.any(Object),
      );
    });
    it('should throw validation error for invalid value', async () => {
      await expect(
        updateSetting(mockUserId, 'appearance.fontScale', 3, 'appearance'),
      ).rejects.toThrow(SettingsValidationError);
    });
  });

  describe('batchUpdateSettings', () => {
    it('should update multiple settings', async () => {
      const mockSettings = [
        {
          id: '1',
          userId: mockUserId,
          key: 'a',
          value: '1',
          category: 'general' as const,
          isDefault: false,
          lastModified: Date.now(),
        },
      ];
      (repository.batchUpsertSettings as jest.Mock).mockResolvedValue(
        mockSettings,
      );
      const updates = [
        {
          key: 'notifications.push.enabled',
          value: true,
          category: 'notifications' as const,
        },
        {
          key: 'appearance.theme',
          value: 'dark',
          category: 'appearance' as const,
        },
      ];
      const result = await batchUpdateSettings(mockUserId, updates);
      expect(result).toHaveLength(1);
      expect(repository.batchUpsertSettings).toHaveBeenCalled();
    });

    it('should throw validation error for invalid batch', async () => {
      const updates = [
        {
          key: 'appearance.fontScale',
          value: 3,
          category: 'appearance' as const,
        },
      ];
      await expect(batchUpdateSettings(mockUserId, updates)).rejects.toThrow(
        SettingsValidationError,
      );
    });
  });

  describe('deleteSetting', () => {
    it('should delete a setting', async () => {
      (repository.deleteSetting as jest.Mock).mockResolvedValue(undefined);
      const result = await deleteSetting(mockUserId, 'test.setting');
      expect(result).toBe(true);
      expect(repository.deleteSetting).toHaveBeenCalledWith(
        mockUserId,
        'test.setting',
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        'settings:change',
        expect.any(Object),
      );
    });
  });
});
