import { createDevBypassUser, skipLogin } from '../dev-bypass';
import { useAuthStore } from '../../../store';
import { isDevUser } from '../../../utils/supabase-resilience';
import { canSkipLogin } from '../../../config/dev-identity';

describe('development login bypass', () => {
  it('enables the button in an opted-in release preview', () => {
    expect(canSkipLogin(false, 'staging', '1')).toBe(true);
    expect(canSkipLogin(false, 'staging', undefined)).toBe(false);
    expect(canSkipLogin(true, 'development', undefined)).toBe(true);
    expect(canSkipLogin(false, 'production', '1')).toBe(false);
    expect(canSkipLogin(true, 'production', '1')).toBe(false);
  });
  it('creates a complete local development user', () => {
    const user = createDevBypassUser();

    expect(user).toMatchObject({
      id: '00000000-0000-4000-8000-000000000001',
      username: 'localdev',
      email: 'local-dev@vex.app',
      displayName: 'Local Dev',
      verified: true,
      role: 'user',
      status: 'active',
      onboardingCompletedAt: user.createdAt,
    });
    expect(user.metadata.signupSource).toBe('dev-bypass');
  });
  it('logs in, hydrates the local user scope, then completes onboarding', async () => {
    const login = jest.fn();
    const hydrateOnboarding = jest.fn<Promise<void>, [string]>(
      async () => undefined,
    );
    const completeOnboarding = jest.fn();

    await skipLogin(login, hydrateOnboarding, completeOnboarding);

    expect(login).toHaveBeenCalledTimes(1);
    const [user] = login.mock.calls[0] ?? [];
    expect(user?.id).toBe('00000000-0000-4000-8000-000000000001');
    expect(hydrateOnboarding).toHaveBeenCalledWith(user?.id);
    expect(completeOnboarding).toHaveBeenCalledWith(user?.id);
    expect(
      hydrateOnboarding.mock.invocationCallOrder[0],
    ).toBeLessThan(completeOnboarding.mock.invocationCallOrder[0] ?? Infinity);
  });

  it('recognizes the persisted bypass identity when metadata is absent', () => {
    const user = createDevBypassUser();
    useAuthStore.setState({ user: { ...user, metadata: { loginCount: 1, deviceHistory: [] } } });

    expect(isDevUser()).toBe(true);

    useAuthStore.getState().clearUser();
  });
});
