import * as repository from './repository';
import { UserSchema } from './schemas';
import type { AuthResult } from './types';

const NONCE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
const NONCE_LENGTH = 32;
type AppleSignInOptions =
  Parameters<typeof import('expo-apple-authentication').signInAsync>[0];
type AppleNoncePair = {
  hashedNonce: string;
  nonce: string;
};

function isMissingAppleModule(error: unknown): boolean {
  return error instanceof Error
    && /Cannot find native module 'ExpoAppleAuthentication'/.test(error.message);
}

function isAppleCancellation(error: unknown): boolean {
  return error instanceof Error && error.message === 'ERR_REQUEST_CANCELED';
}

function createAppleNonceBytes(): Uint8Array | null {
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (!getRandomValues) {
    return null;
  }
  const bytes = new Uint8Array(NONCE_LENGTH);
  getRandomValues(bytes);
  return bytes;
}

function createAppleNonce(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => NONCE_ALPHABET[byte % NONCE_ALPHABET.length]!).join('');
}

async function createAppleNoncePair(): Promise<AppleNoncePair | null> {
  if (!globalThis.crypto?.subtle) {
    return null;
  }
  const bytes = createAppleNonceBytes();
  if (!bytes) {
    return null;
  }
  const nonce = createAppleNonce(bytes);
  const encoded = new TextEncoder().encode(nonce);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
  const hashedNonce = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return { hashedNonce, nonce };
}

export async function signInWithNativeApple(): Promise<AuthResult> {
  try {
    const AppleAuthentication: typeof import('expo-apple-authentication') =
      require('expo-apple-authentication');
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { user: null, error: new Error('Apple sign in is not available on this device.') };
    }

    const noncePair = await createAppleNoncePair();
    const options: AppleSignInOptions = {
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL],
    };
    if (noncePair) {
      options.nonce = noncePair.hashedNonce;
    }
    const credential = await AppleAuthentication.signInAsync(options);

    if (!credential.identityToken) {
      return { user: null, error: new Error('Apple did not return a sign in token.') };
    }

    const result = await repository.signInWithAppleIdToken(
      credential.identityToken,
      noncePair?.nonce ?? null,
    );
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
