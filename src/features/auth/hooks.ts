import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as service from './service';
import { useAuthStore } from '../../store/authStore';
import { saveUserProfile } from '../../store/authProfileStorage';
import { setSentryUser } from '../../config/sentry';
import { initializeServicesAfterAuth } from '../../store/authStoreIntegrations';
import type { AuthCredentials, SignUpMetadata, User } from './types';

export const AUTH_QUERY_KEYS = {
  currentUser: ['auth', 'currentUser'] as const,
};

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: () => service.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

function setupUserServices(user: User): void {
  saveUserProfile(user).catch((err) => {
    Sentry.captureException(err, { tags: { feature: 'auth-save-profile' } });
  });
  setSentryUser(user.id, user.email, user.username);
  initializeServicesAfterAuth(user);
}

export function useSignUp() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: ({
      credentials,
      metadata,
    }: {
      credentials: AuthCredentials;
      metadata: SignUpMetadata;
    }) => service.signUp(credentials, metadata),
    onSuccess: ({ user }) => {
      if (user) {
        queryClient.clear();
        login(user);
        setupUserServices(user);
      }
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-signup' } });
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => service.signIn(credentials),
    onSuccess: ({ user }) => {
      if (user) {
        queryClient.clear();
        login(user);
        setupUserServices(user);
      }
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-signin' } });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => service.signOut(),
    onSuccess: async () => {
      queryClient.clear();
      await logout();
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-logout' } });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => service.resetPassword(email),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-reset-password' } });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => service.updatePassword(newPassword),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-update-password' } });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => service.resendVerification(email),
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'auth-resend-verification' },
      });
    },
  });
}
