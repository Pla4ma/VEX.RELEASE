/**
 * Deep Link Guards
 *
 * Validation utilities for deep link parameters.
 */

export function validateInviteCode(code: string): boolean {
  const pattern = /^[A-Z0-9]{8}$/;
  return pattern.test(code);
}
