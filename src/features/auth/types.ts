import type { z } from 'zod';
import type { UserRoleSchema, UserStatusSchema, UserSchema } from './schemas';

export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuthOAuthProvider = 'apple' | 'google';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpMetadata {
  firstName: string;
  lastName: string;
}

export interface AuthResult {
  user: User | null;
  error: Error | null;
}

export interface OAuthStartResult {
  url: string | null;
  error: Error | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  newPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
}
