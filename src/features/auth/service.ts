import { requireOptionalNativeModule } from 'expo-modules-core';
import type {
  AuthOAuthProvider,
  User,
  AuthCredentials,
  SignUpMetadata,
  AuthResult,
} from './types';
import * as repository from './repository';
import { UserSchema } from './schemas';
import { signInWithNativeApple } from './apple-oauth';

function isMissingWebBrowserModule(error: unknown): boolean {
  return error instanceof Error
    && /Cannot find native module 'ExpoWebBrowser'/.test(error.message);
}

async function openSystemAuthSession(url: string): Promise<AuthResult> {
  if (!requireOptionalNativeModule('ExpoWebBrowser')) {
    return {
      user: null,
      error: new Error('Google sign in needs a rebuilt app before it can run in app.'),
    };
  }
  try {
    // SAFETY: require() defers native WebBrowser module access until OAuth runtime flow.
    const WebBrowser: typeof import('expo-web-browser') = require('expo-web-browser');
    const authResult = await WebBrowser.openAuthSessionAsync(
      url,
      'vex://auth/callback',
    );
    if (authResult.type === 'success') {
      return completeOAuthCallback(authResult.url);
    }
    return { user: null, error: null };
  } catch (error) {
    if (isMissingWebBrowserModule(error)) {
      return {
        user: null,
        error: new Error('Google sign in needs a rebuilt app before it can run in app.'),
      };
    }
    return {
      user: null,
      error: error instanceof Error
        ? error
        : new Error('Unable to open social sign in.'),
    };
  }
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

  return openSystemAuthSession(result.url);
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
