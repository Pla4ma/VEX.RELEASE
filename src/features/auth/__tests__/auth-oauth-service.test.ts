import { Linking } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as repository from '../repository';
import { completeOAuthCallback, startOAuthSignIn } from '../service';

jest.mock('../repository');
jest.mock('expo-apple-authentication', () => ({
  __esModule: true,
  AppleAuthenticationScope: {
    EMAIL: 'email',
    FULL_NAME: 'fullName',
  },
  AppleAuthenticationUserDetectionStatus: {
    UNKNOWN: 1,
  },
  isAvailableAsync: jest.fn(),
  signInAsync: jest.fn(),
}));

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  username: 'vexuser',
  email: 'test@example.com',
  firstName: 'Vex',
  lastName: 'User',
  displayName: 'Vex User',
  verified: true,
  role: 'user' as const,
  status: 'active' as const,
  preferences: {
    theme: 'system' as const,
    language: 'en',
    notifications: {
      push: true,
      email: false,
      sms: false,
      inApp: true,
      digestFrequency: 'daily' as const,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
        timezone: 'UTC',
      },
    },
    privacy: {
      profileVisibility: 'private' as const,
      activityStatus: true,
      readReceipts: false,
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
  metadata: { deviceHistory: [], loginCount: 1 },
};

describe('OAuth auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens provider OAuth URL', async () => {
    jest.mocked(repository.startOAuthSignIn).mockResolvedValue({
      error: null,
      url: 'https://project.supabase.co/auth/v1/authorize',
    });

    const result = await startOAuthSignIn('google');

    expect(result.error).toBeNull();
    expect(result.user).toBeNull();
    expect(repository.startOAuthSignIn).toHaveBeenCalledWith('google');
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/authorize',
    );
  });

  it('uses native Apple sign in token', async () => {
    jest.mocked(AppleAuthentication.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(AppleAuthentication.signInAsync).mockResolvedValue({
      authorizationCode: 'code',
      email: 'test@example.com',
      fullName: null,
      identityToken: 'apple-id-token',
      realUserStatus: AppleAuthentication.AppleAuthenticationUserDetectionStatus.UNKNOWN,
      state: null,
      user: 'apple-user-id',
    });
    jest.mocked(repository.signInWithAppleIdToken).mockResolvedValue({
      error: null,
      user: mockUser,
    });

    const result = await startOAuthSignIn('apple');

    expect(result.error).toBeNull();
    expect(result.user?.id).toBe(mockUser.id);
    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
      nonce: expect.any(String),
      requestedScopes: ['fullName', 'email'],
    });
    expect(repository.signInWithAppleIdToken).toHaveBeenCalledWith(
      'apple-id-token',
      expect.any(String),
    );
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('treats Apple cancellation as a cleared auth attempt', async () => {
    jest.mocked(AppleAuthentication.isAvailableAsync).mockResolvedValue(true);
    jest.mocked(AppleAuthentication.signInAsync).mockRejectedValue(
      new Error('ERR_REQUEST_CANCELED'),
    );

    const result = await startOAuthSignIn('apple');

    expect(result.error).toBeNull();
    expect(result.user).toBeNull();
    expect(repository.signInWithAppleIdToken).not.toHaveBeenCalled();
  });

  it('returns start errors without opening browser', async () => {
    jest.mocked(repository.startOAuthSignIn).mockResolvedValue({
      error: new Error('Provider disabled'),
      url: null,
    });

    const result = await startOAuthSignIn('google');

    expect(result.error?.message).toBe('Provider disabled');
    expect(result.user).toBeNull();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('validates callback user shape', async () => {
    jest.mocked(repository.completeOAuthCallback).mockResolvedValue({
      error: null,
      user: mockUser,
    });

    const result = await completeOAuthCallback('vex://auth/callback?code=abc');

    expect(result.user?.id).toBe(mockUser.id);
    expect(result.error).toBeNull();
  });
});
