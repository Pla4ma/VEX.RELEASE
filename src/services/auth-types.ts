import type { Nullable } from "../types/global";

export type LocalAuthenticationModule = {
  hasHardwareAsync: () => Promise<boolean>;
  isEnrolledAsync: () => Promise<boolean>;
  authenticateAsync: (options: {
    promptMessage: string;
    fallbackLabel: string;
    cancelLabel: string;
    disableDeviceFallback: boolean;
  }) => Promise<{ success: boolean }>;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionInfo {
  isValid: boolean;
  expiresAt: Nullable<number>;
  timeRemaining: number;
  sessionDuration: number;
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth:access_token",
  REFRESH_TOKEN: "auth:refresh_token",
  TOKEN_EXPIRES: "auth:token_expires",
  USER_DATA: "auth:user_data",
  BIOMETRIC_ENABLED: "auth:biometric_enabled",
  SESSION_START: "auth:session_start",
} as const;
