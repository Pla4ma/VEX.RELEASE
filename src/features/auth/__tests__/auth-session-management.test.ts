import * as repository from '../repository';
import {
  signOut,
  getCurrentUser,
  resetPassword,
  updatePassword,
  resendVerification,
} from '../service';

jest.mock('../repository');

// ── Fixtures ───────────────────────────────────────────────────────────────

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
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

// ── signOut ────────────────────────────────────────────────────────────────

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to repository.signOut', async () => {
    jest.mocked(repository.signOut).mockResolvedValue(undefined);

    await expect(signOut()).resolves.toBeUndefined();
    expect(repository.signOut).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from repository', async () => {
    jest.mocked(repository.signOut).mockRejectedValue(new Error('Network error'));

    await expect(signOut()).rejects.toThrow('Network error');
  });
});

// ── getCurrentUser ─────────────────────────────────────────────────────────

describe('getCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mapped user when session exists', async () => {
    jest.mocked(repository.getSessionUser).mockResolvedValue(mockUser);

    const user = await getCurrentUser();
    expect(user).toEqual(mockUser);
  });

  it('returns null when no session exists', async () => {
    jest.mocked(repository.getSessionUser).mockResolvedValue(null);

    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});

// ── resetPassword ──────────────────────────────────────────────────────────

describe('resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no error on success', async () => {
    jest
      .mocked(repository.sendPasswordResetEmail)
      .mockResolvedValue(undefined);

    const result = await resetPassword('test@example.com');
    expect(result.error).toBeNull();
    expect(repository.sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('returns error when repository throws', async () => {
    jest
      .mocked(repository.sendPasswordResetEmail)
      .mockRejectedValue(new Error('Rate limited'));

    const result = await resetPassword('test@example.com');
    expect(result.error).toBeTruthy();
    expect(result.error?.message).toBe('Rate limited');
  });
});

// ── updatePassword ─────────────────────────────────────────────────────────

describe('updatePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error when password is too short', async () => {
    const result = await updatePassword('short');
    expect(result.error).toBeTruthy();
    expect(result.error?.message).toContain('at least 8 characters');
    expect(repository.updateUserPassword).not.toHaveBeenCalled();
  });

  it('returns no error on success', async () => {
    jest.mocked(repository.updateUserPassword).mockResolvedValue(undefined);

    const result = await updatePassword('NewSecurePass123!');
    expect(result.error).toBeNull();
    expect(repository.updateUserPassword).toHaveBeenCalledWith(
      'NewSecurePass123!',
    );
  });

  it('returns error when repository throws', async () => {
    jest
      .mocked(repository.updateUserPassword)
      .mockRejectedValue(new Error('Session expired'));

    const result = await updatePassword('NewSecurePass123!');
    expect(result.error?.message).toBe('Session expired');
  });
});

// ── resendVerification ─────────────────────────────────────────────────────

describe('resendVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no error on success', async () => {
    jest
      .mocked(repository.resendVerificationEmail)
      .mockResolvedValue(undefined);

    const result = await resendVerification('test@example.com');
    expect(result.error).toBeNull();
    expect(repository.resendVerificationEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('returns error when repository throws', async () => {
    jest
      .mocked(repository.resendVerificationEmail)
      .mockRejectedValue(new Error('Already verified'));

    const result = await resendVerification('test@example.com');
    expect(result.error?.message).toBe('Already verified');
  });
});
