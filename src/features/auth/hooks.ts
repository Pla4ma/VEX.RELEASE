import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as service from "./service";
import { useAuthStore } from "../../store/authStore";
import type { AuthCredentials, SignUpMetadata } from "./types";

const AUTH_QUERY_KEYS = {
  currentUser: ["auth", "currentUser"] as const,
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

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      credentials,
      metadata,
    }: {
      credentials: AuthCredentials;
      metadata: SignUpMetadata;
    }) => service.signUp(credentials, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => service.signIn(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => service.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => service.resetPassword(email),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (newPassword: string) => service.updatePassword(newPassword),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => service.resendVerification(email),
  });
}
