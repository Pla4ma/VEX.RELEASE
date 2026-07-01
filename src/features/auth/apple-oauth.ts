import { UserSchema } from './schemas';
import type { AuthResult } from './types';
import * as repository from './repository';

type AppleSignInOptions = Parameters<
  typeof import('expo-apple-authentication').signInAsync
>[0];

type AppleNoncePair = {
  rawNonce: string;
  hashedNonce: string;
};

const nonceAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';

function isMissingAppleModule(error: unknown): boolean {
  return error instanceof Error
    && /Cannot find native module 'ExpoAppleAuthentication'/.test(error.message);
}

function isAppleCancellation(error: unknown): boolean {
  return error instanceof Error
    && (error.message === 'ERR_REQUEST_CANCELED'
      || error.message === 'The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)');
}

function createAppleNonceBytes(): Uint8Array | null {
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (!getRandomValues) {
    return null;
  }

  const bytes = new Uint8Array(32);
  getRandomValues(bytes);
  return bytes;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function createAppleNoncePair(): Promise<AppleNoncePair | null> {
  const bytes = createAppleNonceBytes();
  const digest = globalThis.crypto?.subtle?.digest?.bind(globalThis.crypto.subtle);
  if (!bytes || !digest) {
    return null;
  }

  const rawNonce = Array.from(bytes, byte => nonceAlphabet[byte % nonceAlphabet.length]).join('');
  const encodedNonce = new TextEncoder().encode(rawNonce);
  const hashedNonce = bytesToHex(await digest('SHA-256', encodedNonce));

  return { rawNonce, hashedNonce };
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
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      ...(noncePair ? { nonce: noncePair.hashedNonce } : {}),
    };
    const credential = await AppleAuthentication.signInAsync(options);

    if (!credential.identityToken) {
      return { user: null, error: new Error('Apple did not return a sign in token.') };
    }

    const result = await repository.signInWithAppleIdToken(
      credential.identityToken,
      noncePair?.rawNonce ?? null,
    );
    if (result.user) {
      return { ...result, user: UserSchema.parse(result.user) };
    }
    return result;
  } catch (error) {
    if (isAppleCancellation(error)) {
      return { user: null, error: null };
    }
    if (isMissingAppleModule(error)) {
      return {
        user: null,
        error: new Error('Apple sign in needs a rebuilt app before it can run in app.'),
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
