import * as repository from './repository';
import { UserSchema } from './schemas';
import type { AuthResult } from './types';

const NONCE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
const NONCE_LENGTH = 32;

function isMissingAppleModule(error: unknown): boolean {
  return error instanceof Error
    && /Cannot find native module 'ExpoAppleAuthentication'/.test(error.message);
}

function isAppleCancellation(error: unknown): boolean {
  return error instanceof Error && error.message === 'ERR_REQUEST_CANCELED';
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

export async function signInWithNativeApple(): Promise<AuthResult> {
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
    if (isAppleCancellation(error)) {
      return { user: null, error: null };
    }
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
