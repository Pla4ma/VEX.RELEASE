import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as repository from '../repository';
import { completeOAuthCallback, startOAuthSignIn } from '../service';
import { authTestUser } from './auth-test-user';

jest.mock('../repository');
jest.mock('expo-web-browser', () => ({
  __esModule: true,
  openAuthSessionAsync: jest.fn(),
}));
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

describe('OAuth auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens provider OAuth URL inside an auth session', async () => {
    jest.mocked(repository.startOAuthSignIn).mockResolvedValue({
      error: null,
      url: 'https://project.supabase.co/auth/v1/authorize',
    });
    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: 'cancel',
    });

    const result = await startOAuthSignIn('google');

    expect(result.error).toBeNull();
    expect(result.user).toBeNull();
    expect(repository.startOAuthSignIn).toHaveBeenCalledWith('google');
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/authorize',
      'vex://auth/callback',
    );
  });

  it('finishes Google OAuth when the auth session returns a callback URL', async () => {
    jest.mocked(repository.startOAuthSignIn).mockResolvedValue({
      error: null,
      url: 'https://project.supabase.co/auth/v1/authorize',
    });
    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: 'success',
      url: 'vex://auth/callback?code=abc',
    });
    jest.mocked(repository.completeOAuthCallback).mockResolvedValue({
      error: null,
      user: authTestUser,
    });

    const result = await startOAuthSignIn('google');

    expect(result.error).toBeNull();
    expect(result.user?.id).toBe(authTestUser.id);
    expect(repository.completeOAuthCallback).toHaveBeenCalledWith(
      'vex://auth/callback?code=abc',
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
      user: authTestUser,
    });

    const result = await startOAuthSignIn('apple');

    expect(result.error).toBeNull();
    expect(result.user?.id).toBe(authTestUser.id);
    expect(AppleAuthentication.signInAsync).toHaveBeenCalledWith({
      nonce: expect.any(String),
      requestedScopes: ['fullName', 'email'],
    });
    expect(repository.signInWithAppleIdToken).toHaveBeenCalledWith(
      'apple-id-token',
      expect.any(String),
    );
    expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
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
    expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  it('validates callback user shape', async () => {
    jest.mocked(repository.completeOAuthCallback).mockResolvedValue({
      error: null,
      user: authTestUser,
    });

    const result = await completeOAuthCallback('vex://auth/callback?code=abc');

    expect(result.user?.id).toBe(authTestUser.id);
    expect(result.error).toBeNull();
  });
});
