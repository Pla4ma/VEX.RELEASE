import {
  initializeServicesAfterAuth,
  deinitializeServicesAfterLogout,
  resetServiceSingletonsForLogout,
} from '../authStoreIntegrations';

jest.mock('../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: {
    setUserId: jest.fn(),
    clearUserId: jest.fn(),
  },
}));

jest.mock('../../session/SessionOrchestrator', () => ({
  resetSessionOrchestrator: jest.fn(),
}));

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('authStoreIntegrations', () => {
  const mockUser = { id: 'user-123', email: 'test@test.com', username: 'tester' } as any;

  beforeEach(() => {
    resetServiceSingletonsForLogout();
    jest.clearAllMocks();
  });

  describe('initializeServicesAfterAuth', () => {
    it('sets RevenueCat user ID', () => {
      const { revenueCatService } = require('../../shared/monetization/revenuecat-service');
      initializeServicesAfterAuth(mockUser);
      expect(revenueCatService.setUserId).toHaveBeenCalledWith('user-123');
    });

    it('tracks initialized user ID', () => {
      initializeServicesAfterAuth(mockUser);
      // Calling again should still work (idempotent)
      initializeServicesAfterAuth(mockUser);
      const { revenueCatService } = require('../../shared/monetization/revenuecat-service');
      expect(revenueCatService.setUserId).toHaveBeenCalledTimes(2);
    });
  });

  describe('deinitializeServicesAfterLogout', () => {
    it('clears RevenueCat user ID', () => {
      const { revenueCatService } = require('../../shared/monetization/revenuecat-service');
      deinitializeServicesAfterLogout();
      expect(revenueCatService.clearUserId).toHaveBeenCalled();
    });

    it('resets session orchestrator', () => {
      const { resetSessionOrchestrator } = require('../../session/SessionOrchestrator');
      deinitializeServicesAfterLogout();
      expect(resetSessionOrchestrator).toHaveBeenCalled();
    });
  });

  describe('resetServiceSingletonsForLogout', () => {
    it('resets the initialized user ID tracker', () => {
      initializeServicesAfterAuth(mockUser);
      resetServiceSingletonsForLogout();
      // After reset, re-initialization should work
      initializeServicesAfterAuth(mockUser);
      const { revenueCatService } = require('../../shared/monetization/revenuecat-service');
      expect(revenueCatService.setUserId).toHaveBeenCalledTimes(2);
    });
  });
});
