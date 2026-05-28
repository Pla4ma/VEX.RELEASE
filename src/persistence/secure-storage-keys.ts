/**
 * Predefined secure storage keys
 */
export const SecureStorageKeys = {
  AUTH_TOKEN: "vex_auth_token",
  REFRESH_TOKEN: "vex_refresh_token",
  USER_PROFILE: "vex_user_profile",
  USER_CREDENTIALS: "vex_user_credentials",
  ENCRYPTION_KEY: "vex_encryption_key",
  BIOMETRIC_TOKEN: "vex_biometric_token",
} as const;

export type SecureStorageKey =
  (typeof SecureStorageKeys)[keyof typeof SecureStorageKeys];
