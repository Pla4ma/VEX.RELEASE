import { Linking } from 'react-native';
import type {
  AuthOAuthProvider,
  User,
  AuthCredentials,
  SignUpMetadata,
  AuthResult,
} from './types';
import * as repository from './repository';
import { UserSchema } from './schemas';

const NONCE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
const NONCE_LENGTH = 32;

function isMissingAppleModule(error: unknown): boolean {
  return error instanceof Error
    && /Cannot find native module 'ExpoAppleAuthentication'/.test(error.message);
}

function createAppleNonce(): string {
  const bytes = new Uint8Array(NONCE_LENGTH);
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Apple sign in needs secure random values on this device.');
  }
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => NONCE_ALPHABET[byte % NONCE_ALPHABET.length]!).join('');
}

async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Apple sign in needs secure hashing on this device.');
  }
  const data = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function signUp(
  credentials: AuthCredentials,
  metadata: SignUpMetadata,
): Promise<AuthResult> {
  if (!credentials.email || !credentials.password) {
    return { user: null, error: new Error('Email and password are required') };
  }

  const result = await repository.signUpWithEmail(
    credentials.email,
    credentials.password,
    metadata,
  );

  if (result.user) {
    UserSchema.parse(result.user);
  }

  return result;
}

export async function signIn(credentials: AuthCredentials): Promise<AuthResult> {
  if (!credentials.email || !credentials.password) {
    return { user: null, error: new Error('Email and password are required') };
  }

  const result = await repository.signInWithEmail(
    credentials.email,
    credentials.password,
  );

  if (result.user) {
    UserSchema.parse(result.user);
  }

  return result;
}

export async function startOAuthSignIn(
  provider: AuthOAuthProvider,
): Promise<AuthResult> {
  if (provider === 'apple') {
    return signInWithNativeApple();
  }

  const result = await repository.startOAuthSignIn(provider);
  if (result.error || !result.url) {
    return {
      user: null,
      error: result.error ?? new Error('Unable to start social sign in.'),
    };
  }

  try {
    await Linking.openURL(result.url);
    return { user: null, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error
        ? error
        : new Error('Unable to open social sign in.'),
    };
  }
}

async function signInWithNativeApple(): Promise<AuthResult> {
  try {
    const AppleAuthentication: typeof import('expo-apple-authentication') =
      require('expo-apple-authentication');
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { user: null, error: new Error('Apple sign in is not available on this device.') };
    }

    const nonce = createAppleNonce();
    const hashedNonce = await sha256Hex(nonce);
    const credential = await AppleAuthentication.signInAsync({
      nonce: hashedNonce,
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });

    if (!credential.identityToken) {
      return { user: null, error: new Error('Apple did not return a sign in token.') };
    }

    const result = await repository.signInWithAppleIdToken(credential.identityToken, nonce);
    if (result.user) {
      UserSchema.parse(result.user);
    }
    return result;
  } catch (error) {
    if (isMissingAppleModule(error)) {
      return {
        user: null,
        error: new Error('Apple sign in needs a rebuilt app before it can run.'),
      };
    }
    return {
      user: null,
      error: error instanceof Error
        ? error
        : new Error('Unable to start Apple sign in.'),
    };
  }
}

export async function completeOAuthCallback(url: string): Promise<AuthResult> {
  const result = await repository.completeOAuthCallback(url);

  if (result.user) {
    UserSchema.parse(result.user);
  }

  return result;
}

export async function signOut(): Promise<void> {
  await repository.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const user = await repository.getSessionUser();
  if (user) {
    UserSchema.parse(user);
  }
  return user;
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    await repository.sendPasswordResetEmail(email);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to send reset email') };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  if (newPassword.length < 8) {
    return { error: new Error('Password must be at least 8 characters') };
  }
  try {
    await repository.updateUserPassword(newPassword);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to update password') };
  }
}

export async function resendVerification(email: string): Promise<{ error: Error | null }> {
  try {
    await repository.resendVerificationEmail(email);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error('Failed to resend verification') };
  }
}
