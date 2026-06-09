/**
 * UUID Utility
 *
 * ID generation for non-sensitive application records.
 * Uses platform crypto when available.
 */

/**
 * Generate a UUID v4.
 */
export function v4(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = getRandomBytes(16);
  const versionByte = bytes[6];
  const variantByte = bytes[8];
  if (versionByte !== undefined) {
    bytes[6] = (versionByte & 0x0f) | 0x40;
  }
  if (variantByte !== undefined) {
    bytes[8] = (variantByte & 0x3f) | 0x80;
  }

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  );
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

function getRandomBytes(length: number): Uint8Array {
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (getRandomValues) {
    const buf = new Uint8Array(length);
    getRandomValues(buf);
    return buf;
  }
  const buf = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buf[i] = (Date.now() * Math.random() * 100000) % 256 | 0;
  }
  return buf;
}

/**
 * Generate a short ID.
 * Suitable for internal use where UUID is overkill but uniqueness is required.
 */
export function shortId(length: number = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = getRandomBytes(length);
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
