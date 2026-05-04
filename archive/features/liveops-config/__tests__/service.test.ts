/**
 * LiveOps Config Service Tests
 *
 * Comprehensive test suite for remote config service logic.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as service from '../service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

// Mock dependencies
jest.mock('../repository');
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => () => {}),
  },
}));

const mockedRepository = jest.mocked(repository);
const mockedEventBus = jest.mocked(eventBus);

describe('LiveOps Config Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncConfig', () => {
    it('should fetch and cache config', async () => {
      const mockConfig = {
        version: 1,
        features: {
          newBattlePass: { enabled: true, rolloutPercentage: 100 },
        },
        maintenance: { enabled: false },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      mockedRepository.recordConfigFetch.mockResolvedValue();

      const result = await service.syncConfig();

      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(mockedRepository.recordConfigFetch).toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      mockedRepository.fetchConfig.mockRejectedValue(new Error('Network error'));

      const result = await service.syncConfig();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('getConfigValue', () => {
    it('should return cached config value', async () => {
      const mockConfig = {
        version: 1,
        features: {
          testFeature: { enabled: true },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);

      // First sync
      await service.syncConfig();

      // Then get value
      const value = service.getConfigValue('features.testFeature.enabled');
      expect(value).toBe(true);
    });

    it('should return default for missing keys', () => {
      const value = service.getConfigValue('missing.key', 'default');
      expect(value).toBe('default');
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', async () => {
      const mockConfig = {
        version: 1,
        features: {
          testFeature: { enabled: true, rolloutPercentage: 100 },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const enabled = service.isFeatureEnabled('testFeature', 'user-1');
      expect(enabled).toBe(true);
    });

    it('should return false for disabled feature', async () => {
      const mockConfig = {
        version: 1,
        features: {
          testFeature: { enabled: false },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const enabled = service.isFeatureEnabled('testFeature', 'user-1');
      expect(enabled).toBe(false);
    });

    it('should handle percentage rollout', async () => {
      const mockConfig = {
        version: 1,
        features: {
          testFeature: { enabled: true, rolloutPercentage: 50 },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      // Deterministic based on userId hash
      const enabled = service.isFeatureEnabled('testFeature', 'user-1');
      // Result depends on hash, just verify it doesn't throw
      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('getABTestVariant', () => {
    it('should assign variant based on user hash', async () => {
      const mockConfig = {
        version: 1,
        abTests: {
          testExperiment: {
            enabled: true,
            variants: [
              { id: 'control', weight: 50 },
              { id: 'treatment', weight: 50 },
            ],
          },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const variant = service.getABTestVariant('testExperiment', 'user-1');
      expect(['control', 'treatment']).toContain(variant);
    });

    it('should return control for disabled experiment', async () => {
      const mockConfig = {
        version: 1,
        abTests: {
          testExperiment: {
            enabled: false,
            variants: [{ id: 'control' }],
          },
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const variant = service.getABTestVariant('testExperiment', 'user-1');
      expect(variant).toBe('control');
    });
  });

  describe('checkMaintenanceMode', () => {
    it('should return maintenance status', async () => {
      const mockConfig = {
        version: 1,
        maintenance: {
          enabled: true,
          message: 'Maintenance in progress',
          estimatedEndTime: Date.now() + 3600000,
        },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const status = service.checkMaintenanceMode();
      expect(status.enabled).toBe(true);
      expect(status.message).toBe('Maintenance in progress');
    });

    it('should return disabled when no maintenance', async () => {
      const mockConfig = {
        version: 1,
        maintenance: { enabled: false },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      const status = service.checkMaintenanceMode();
      expect(status.enabled).toBe(false);
    });
  });

  describe('invalidateCache', () => {
    it('should clear config cache', async () => {
      const mockConfig = {
        version: 1,
        features: { test: { enabled: true } },
      };

      mockedRepository.fetchConfig.mockResolvedValue(mockConfig as any);
      await service.syncConfig();

      // Verify cache works
      expect(service.isFeatureEnabled('test', 'user-1')).toBe(true);

      // Invalidate
      service.invalidateCache();

      // After invalidate, should still work but fetch again
      mockedRepository.fetchConfig.mockResolvedValue({
        ...mockConfig,
        version: 2,
      } as any);

      await service.syncConfig();
      expect(mockedRepository.fetchConfig).toHaveBeenCalledTimes(2);
    });
  });
});
