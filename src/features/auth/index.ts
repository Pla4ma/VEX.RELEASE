export { useCurrentUser, useSignUp, useSignIn, useSignOut, useResetPassword, useUpdatePassword, useResendVerification, AUTH_QUERY_KEYS } from './hooks';
export { signUp, signIn, startOAuthSignIn, completeOAuthCallback, signOut, getCurrentUser, resetPassword, updatePassword, resendVerification } from './service';
export { UserSchema, UserRoleSchema, UserStatusSchema } from './schemas';
export type { AuthCredentials, AuthOAuthProvider, AuthResult, SignUpMetadata, User, UserRole, UserStatus } from './types';
