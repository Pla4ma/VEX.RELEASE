/**
 * UUID Utility
 *
 * Cryptographically secure ID generation for the application.
 * Uses expo-crypto for secure random bytes in React Native.
 */

import * as ExpoCrypto from 'expo-crypto';

/**
 * Generate a UUID v4 using cryptographically secure random bytes.
 * Delegates to expo-crypto which uses the platform's CSPRNG.
 */
export function v4(): string {
  return ExpoCrypto.randomUUID();
}

/**
 * Generate a short ID using cryptographically secure random bytes.
 * Suitable for internal use where UUID is overkill but uniqueness is required.
 */
export function shortId(length: number = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = ExpoCrypto.getRandomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length]!)
    .join('');
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Generate a session-specific ID
 */
export function generateSessionId(): string {
  return `sess-${Date.now()}-${shortId(6)}`;
}

/**
 * Generate a transaction ID
 */
export function generateTransactionId(): string {
  return `tx-${Date.now()}-${shortId(8)}`;
}

/**
 * Generate a reward ID
 */
export function generateRewardId(): string {
  return `rw-${Date.now()}-${shortId(8)}`;
}
