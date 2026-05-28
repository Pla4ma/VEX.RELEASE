import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import * as service from "../service";
import {
  type Setting,
  type UserPreferences,
  type NotificationSettings,
  type CoachSettings,
  type AppearanceSettings,
  type PrivacySettings,
} from "../types";
import { settingsKeys } from "./queryKeys";

export function useSetting(
  userId: string,
  key: string,
  options?: Omit<UseQueryOptions<Setting | null>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.setting(userId, key),
    queryFn: () => service.getSetting(userId, key),
    enabled: !!userId && !!key,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAllSettings(
  userId: string,
  options?: Omit<UseQueryOptions<Setting[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.user(userId),
    queryFn: () => service.getAllSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUserPreferences(
  userId: string,
  options?: Omit<UseQueryOptions<UserPreferences>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.preferences(userId),
    queryFn: () => service.getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useNotificationSettings(
  userId: string,
  options?: Omit<UseQueryOptions<NotificationSettings>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.notifications(userId),
    queryFn: () => service.getNotificationSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCoachSettings(
  userId: string,
  options?: Omit<UseQueryOptions<CoachSettings>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.coach(userId),
    queryFn: () => service.getCoachSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useAppearanceSettings(
  userId: string,
  options?: Omit<UseQueryOptions<AppearanceSettings>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.appearance(userId),
    queryFn: () => service.getAppearanceSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePrivacySettings(
  userId: string,
  options?: Omit<UseQueryOptions<PrivacySettings>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsKeys.privacy(userId),
    queryFn: () => service.getPrivacySettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
