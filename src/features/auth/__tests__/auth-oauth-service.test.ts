import { Linking } from 'react-native';
import * as repository from '../repository';
import { completeOAuthCallback, startOAuthSignIn } from '../service';

jest.mock('../repository');

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
    expect(repository.startOAuthSignIn).toHaveBeenCalledWith('google');
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/authorize',
    );
  });

  it('returns start errors without opening browser', async () => {
    jest.mocked(repository.startOAuthSignIn).mockResolvedValue({
      error: new Error('Provider disabled'),
      url: null,
    });

    const result = await startOAuthSignIn('apple');

    expect(result.error?.message).toBe('Provider disabled');
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
