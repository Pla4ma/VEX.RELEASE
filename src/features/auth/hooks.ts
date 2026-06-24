import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../shared/ui/components/Toast';
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
  const { show } = useToast();

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
      show({
        title: 'Sign Up Failed',
        message: error?.message ?? 'Unable to sign up.',
        type: 'error',
      });
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();
  const { show } = useToast();

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
      show({
        title: 'Sign In Failed',
        message: error?.message ?? 'Unable to sign in.',
        type: 'error',
      });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const { show } = useToast();

  return useMutation({
    mutationFn: () => service.signOut(),
    onSuccess: async () => {
      queryClient.clear();
      await logout();
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-logout' } });
      show({
        title: 'Sign Out Failed',
        message: error?.message ?? 'Unable to sign out.',
        type: 'error',
      });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => service.resetPassword(email),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-reset-password' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newPassword: string) => service.updatePassword(newPassword),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'auth-update-password' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => service.resendVerification(email),
    onError: (error) => {
      Sentry.captureException(error, {
        tags: { feature: 'auth-resend-verification' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
