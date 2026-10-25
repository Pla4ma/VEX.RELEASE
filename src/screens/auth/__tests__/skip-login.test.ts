import { skipLogin } from '../skip-login';
import { canSkipLogin } from '../../../config/dev-identity';

describe('skip login', () => {
  it('enables the button in an opted-in release preview', () => {
    expect(canSkipLogin(false, 'staging', '1')).toBe(true);
    expect(canSkipLogin(false, 'staging', undefined)).toBe(false);
    expect(canSkipLogin(true, 'development', undefined)).toBe(true);
    expect(canSkipLogin(false, 'production', '1')).toBe(false);
    expect(canSkipLogin(true, 'production', '1')).toBe(false);
  });

  it('creates guest auth before hydrating and completing onboarding', async () => {
    const guest = { id: 'guest-session-id' };
    const loginAnonymously = jest.fn<Promise<typeof guest | null>, []>(
      async () => guest,
    );
    const hydrateOnboarding = jest.fn<Promise<void>, [string]>(
      async () => undefined,
    );
    const completeOnboarding = jest.fn();

    await skipLogin(loginAnonymously, hydrateOnboarding, completeOnboarding);

    expect(loginAnonymously).toHaveBeenCalledTimes(1);
    expect(hydrateOnboarding).toHaveBeenCalledWith(guest.id);
    expect(completeOnboarding).toHaveBeenCalledWith(guest.id);
    expect(loginAnonymously.mock.invocationCallOrder[0]).toBeLessThan(
      hydrateOnboarding.mock.invocationCallOrder[0] ?? Infinity,
    );
    expect(
      hydrateOnboarding.mock.invocationCallOrder[0],
    ).toBeLessThan(completeOnboarding.mock.invocationCallOrder[0] ?? Infinity);
  });

  it('does not complete onboarding when guest auth fails', async () => {
    const hydrateOnboarding = jest.fn<Promise<void>, [string]>(
      async () => undefined,
    );
    const completeOnboarding = jest.fn();

    await expect(
      skipLogin(async () => null, hydrateOnboarding, completeOnboarding),
    ).rejects.toThrow('Guest sign-in failed');

    expect(hydrateOnboarding).not.toHaveBeenCalled();
    expect(completeOnboarding).not.toHaveBeenCalled();
  });

});
