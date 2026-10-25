const mockGetSession = jest.fn();
const mockSignInAnonymously = jest.fn();

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: mockGetSession,
      signInAnonymously: mockSignInAnonymously,
    },
  }),
  handleSupabaseError: (error: unknown) =>
    error instanceof Error ? error : new Error('Supabase auth failed.'),
}));

import { signInAnonymously } from '../anonymous-auth-repository';

const anonymousUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  app_metadata: { provider: 'anonymous', providers: ['anonymous'] },
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  is_anonymous: true,
};

describe('signInAnonymously repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('creates an authenticated guest session and maps a usable guest profile', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: { user: anonymousUser, session: { access_token: 'guest-token' } },
      error: null,
    });

    const result = await signInAnonymously();

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
    expect(result.user).toMatchObject({
      id: anonymousUser.id,
      username: 'guest-550e8400',
      firstName: 'Guest',
      displayName: 'Guest',
      metadata: { signupSource: 'anonymous' },
    });
  });

  it('reuses the current session instead of creating another guest identity', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: anonymousUser } },
      error: null,
    });

    const result = await signInAnonymously();

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
    expect(result.user?.id).toBe(anonymousUser.id);
  });

  it('does not sign in anonymously when session lookup fails', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: new Error('session lookup failed'),
    });

    const result = await signInAnonymously();

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
    expect(result.user).toBeNull();
    expect(result.error?.message).toBe('session lookup failed');
  });

  it('rejects a response without a persisted authenticated session', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: { user: anonymousUser, session: null },
      error: null,
    });

    const result = await signInAnonymously();

    expect(result.user).toBeNull();
    expect(result.error?.message).toBe(
      'Guest sign-in returned no authenticated session.',
    );
  });

  it('returns the provider error when anonymous sign-in is rejected', async () => {
    mockSignInAnonymously.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Anonymous sign-ins are disabled.'),
    });

    const result = await signInAnonymously();

    expect(result.user).toBeNull();
    expect(result.error?.message).toBe('Anonymous sign-ins are disabled.');
  });
});
