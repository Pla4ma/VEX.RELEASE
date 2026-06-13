import { saveUserProfile, loadUserProfile, removeUserProfile } from '../authProfileStorage';
import type { User } from '../types/models';

jest.mock('../../../persistence/SecureStorage', () => ({
  getSecureStorage: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  }),
  SecureStorageKeys: {
    AUTH_TOKEN: 'vex_auth_token',
    REFRESH_TOKEN: 'vex_refresh_token',
    USER_PROFILE: 'vex_user_profile',
  },
}));

jest.mock('../../../features/auth/schemas', () => ({
  UserSchema: {
    safeParse: jest.fn((data: unknown) => {
      if (data && typeof data === 'object' && 'id' in data && 'email' in data) {
        return { success: true, data };
      }
      return { success: false, error: { issues: [] } };
    }),
  },
}));

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

const makeValidUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
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

describe('authProfileStorage', () => {
  const validUser = makeValidUser();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveUserProfile', () => {
    it('saves user to secure storage as JSON', async () => {
      const { getSecureStorage } = require('../../../persistence/SecureStorage');
      const storage = getSecureStorage();
      await saveUserProfile(validUser);
      expect(storage.setItem).toHaveBeenCalledWith(
        'vex_user_profile',
        JSON.stringify(validUser),
      );
    });
  });

  describe('loadUserProfile', () => {
    it('returns null when no profile stored', async () => {
      const result = await loadUserProfile();
      expect(result).toBeNull();
    });

    it('returns parsed user when valid profile exists', async () => {
      const { getSecureStorage } = require('../../../persistence/SecureStorage');
      const storage = getSecureStorage();
      (storage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(validUser));
      const result = await loadUserProfile();
      expect(result).toEqual(validUser);
    });

    it('returns null when stored JSON is invalid', async () => {
      const { getSecureStorage } = require('../../../persistence/SecureStorage');
      const storage = getSecureStorage();
      (storage.getItem as jest.Mock).mockResolvedValueOnce('not-json');
      const result = await loadUserProfile();
      expect(result).toBeNull();
    });

    it('returns null when schema validation fails', async () => {
      const { getSecureStorage } = require('../../../persistence/SecureStorage');
      const storage = getSecureStorage();
      (storage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify({ invalid: true }));
      const result = await loadUserProfile();
      expect(result).toBeNull();
    });
  });

  describe('removeUserProfile', () => {
    it('removes profile from secure storage', async () => {
      const { getSecureStorage } = require('../../../persistence/SecureStorage');
      const storage = getSecureStorage();
      await removeUserProfile();
      expect(storage.removeItem).toHaveBeenCalledWith('vex_user_profile');
    });
  });
});