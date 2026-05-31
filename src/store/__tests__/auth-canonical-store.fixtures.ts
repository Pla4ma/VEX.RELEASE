import type { User } from "../../types/models";

jest.mock("../../services/supabaseAuth", () => ({
  getCurrentUser: jest.fn(),
  signInWithEmail: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
}));
jest.mock("../../config/sentry", () => ({
  captureException: jest.fn(),
  clearSentryUser: jest.fn(),
  setSentryUser: jest.fn(),
}));
jest.mock("../../shared/monetization/revenuecat-service", () => ({
  revenueCatService: {
    clearUserId: jest.fn(),
    setUserId: jest.fn(),
  },
}));
jest.mock("../../persistence/SecureStorage", () => ({
  getSecureStorage: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
  SecureStorageKeys: {
    AUTH_TOKEN: "vex_auth_token",
    REFRESH_TOKEN: "vex_refresh_token",
    USER_PROFILE: "vex_user_profile",
  },
}));
jest.mock("../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock("../../services/streakService", () => ({
  streakService: { reset: jest.fn(), setUserId: jest.fn() },
}));
jest.mock("../../utils/debug", () => ({
  createDebugger: () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }),
}));

export const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  displayName: "Test User",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  verified: true,
  role: "user",
  status: "active",
  preferences: {
    accessibility: {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      screenReaderOptimized: false,
    },
    language: "en",
    notifications: {
      digestFrequency: "daily",
      email: false,
      inApp: true,
      push: true,
      quietHours: {
        enabled: false,
        end: "07:00",
        start: "22:00",
        timezone: "UTC",
      },
      sms: false,
    },
    privacy: {
      activityStatus: true,
      allowMentions: true,
      allowTagging: true,
      dataSharing: false,
      profileVisibility: "private",
      readReceipts: false,
    },
    theme: "system",
  },
  metadata: { deviceHistory: [], loginCount: 1 },
};
