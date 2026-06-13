import {
  initializeServicesAfterAuth,
  deinitializeServicesAfterLogout,
  resetServiceSingletonsForLogout,
} from '../authStoreIntegrations';
import type { User } from '../types/models';

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

const makeMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-123',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  username: 'tester',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  squadId: null,
  avatar: undefined,
  bio: undefined,
  location: undefined,
  website: undefined,
  verified: false,
  role: 'user',
  status: 'active',
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: {
      push: true,
      email: true,
      sms: false,
      inApp: true,
      digestFrequency: 'daily',
      quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' },
    },
    privacy: {
      profileVisibility: 'public',
      activityStatus: true,
      readReceipts: true,
      allowTagging: true,
      allowMentions: true,
      dataSharing: false,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
    },
  },
  metadata: {
    loginCount: 1,
    deviceHistory: [],
  },
  onboardingCompletedAt: null,
  ...overrides,
});

describe('authStoreIntegrations', () => {
  const mockUser = makeMockUser();

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