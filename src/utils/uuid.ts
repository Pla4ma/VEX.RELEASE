/**
 * UUID Utility
 *
 * Simple UUID generation for the application.
 * Uses a lightweight implementation for React Native compatibility.
 */

/**
 * Generate a UUID v4
 */
export function v4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a short ID (for internal use where UUID is overkill)
 */
export function shortId(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
