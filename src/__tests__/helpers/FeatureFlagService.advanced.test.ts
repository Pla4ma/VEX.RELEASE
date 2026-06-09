import { FeatureFlagService } from '../FeatureFlagService';
import { getStorageManager } from '../../persistence';
import { eventBus } from '../../events';
import { getApiClient } from '../../api/api-client';

jest.mock('../../persistence');
jest.mock('../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(() => {}),
  },
}));
jest.mock('../../api/api-client');
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockStorageManager = {
  initialize: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getJSON: jest.fn(),
  setJSON: jest.fn(),
};
const mockApiClient = { get: jest.fn(), post: jest.fn() };
jest.mocked(getStorageManager).mockReturnValue(mockStorageManager as never);
jest.mocked(getApiClient).mockReturnValue(mockApiClient as never);

type _ServiceInternal = { fetchRemote(): Promise<void> };

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;
  let timer: ReturnType<typeof setInterval> | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new FeatureFlagService({
      storageKey: 'test-flags',
      enableOverrides: true,
      remoteFetchInterval: 1000,
    });
  });

  afterEach(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    service.cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const _withTimer = async (work: () => Promise<void>) => {
    await work();
    if (timer) {clearInterval(timer);}
  };

  describe('Remote fetching', () => {
    beforeEach(async () => {
      mockStorageManager.getItem.mockResolvedValue({});
      await service.initialize();
    });

    it('should fetch remote flags on interval', async () => {
      const remoteFlags = {
        new_design: {
          key: 'new_design',
          value: true,
          description: 'Updated from remote',
          enabled: true,
          rolloutPercentage: 100,
          updatedAt: Date.now() + 1000,
        },
      };
      mockApiClient.get.mockResolvedValue({
        data: remoteFlags,
        status: 200,
        headers: {},
      });

      timer = setInterval(() => {}, 1000);
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/features/flags',
        expect.objectContaining({ deduplicate: true }),
      );
    });

    it('should ignore empty remote payload and not publish updated event', async () => {
      mockApiClient.get.mockResolvedValue({
        data: null,
        status: 204,
        headers: {},
      });

      timer = setInterval(() => {}, 1000);
      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(eventBus.publish).not.toHaveBeenCalledWith(
        'feature:updated',
        expect.any(Object),
      );
    });
  });

  describe('Rollout Logic', () => {
    beforeEach(async () => {
      mockStorageManager.getItem.mockResolvedValue({});
      await service.initialize();
    });
    it('should respect rollout percentage', async () => {
      service.setUserId('0');
      await service.registerFlag({
        key: 'rollout_flag',
        value: true,
        description: 'Rollout test',
        enabled: true,
        rolloutPercentage: 50,
      });
      expect(service.isEnabled('rollout_flag')).toBe(true);
    });
    it('should use override over rollout', async () => {
      await service.registerFlag({
        key: 'rollout_flag',
        value: true,
        description: 'Rollout test',
        enabled: true,
        rolloutPercentage: 0,
      });
      await service.setOverride('rollout_flag', true);
      expect(service.isEnabled('rollout_flag')).toBe(true);
    });
    it('should respect disabled flag', async () => {
      await service.registerFlag({
        key: 'disabled_flag',
        value: true,
        description: 'Disabled test',
        enabled: false,
        rolloutPercentage: 100,
      });
      expect(service.isEnabled('disabled_flag')).toBe(false);
    });
    it('should handle non-existent flag', () => {
      expect(service.isEnabled('nonexistent')).toBe(false);
      expect(service.get('nonexistent', null)).toBeNull();
    });
  });

  describe('Persistence', () => {
    beforeEach(async () => {
      mockStorageManager.getItem.mockResolvedValue({});
      await service.initialize();
    });
    it('should save flags after update', async () => {
      await service.updateFlag({ key: 'new_design', value: true });
      expect(mockStorageManager.setJSON).toHaveBeenCalledWith('test-flags', expect.any(Object));
    });
    it('should save overrides after set', async () => {
      await service.setOverride('new_design', true);
      expect(mockStorageManager.setJSON).toHaveBeenCalledWith('test-flags-overrides', expect.any(Object));
    });
  });
});
