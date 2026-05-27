export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityLevel: "low" | "medium" | "high";
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface TokenData {
  token: string;
  type: "access" | "refresh" | "reset" | "verification";
  userId?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorData {
  code: string;
  backupCode?: string;
  method: "totp" | "sms" | "email" | "backup";
}
