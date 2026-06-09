import { FeatureFlagService } from '../FeatureFlagService';
import { getStorageManager } from '../../persistence';

jest.mock('../../persistence');
jest.mock('../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn().mockReturnValue(() => {}),
  },
}));
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
jest.mocked(getStorageManager).mockReturnValue(mockStorageManager as never);

describe('FeatureFlagService — Edge Cases', () => {
  let service: FeatureFlagService;

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
    service.cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should handle uninitialized service', () => {
    expect(service.isEnabled('new_design')).toBe(false);
  });

  it('should handle invalid user ID in rollout', async () => {
    mockStorageManager.getItem.mockResolvedValue({});
    await service.initialize();
    service.setUserId('');
    expect(service.isEnabled('new_design')).toBe(false);
  });

  it('should handle storage errors gracefully', async () => {
    mockStorageManager.getItem.mockRejectedValue(new Error('Storage error'));
    await expect(service.initialize()).resolves.not.toThrow();
  });

  it('should prevent double initialization', async () => {
    mockStorageManager.getItem.mockResolvedValue({});
    await service.initialize();
    await service.initialize();
    expect(mockStorageManager.initialize).toHaveBeenCalledTimes(1);
  });
});
