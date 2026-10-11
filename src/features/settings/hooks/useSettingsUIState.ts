import {
  useAppearanceSettings,
  useCoachSettings,
  useNotificationSettings,
  usePrivacySettings,
  useUserPreferences,
} from './useSettingsQueries';
import { useResetSettings } from './useCategoryMutations';
import { useSyncSettings } from './useSettingMutations';

export function useSettingsUIState(userId: string) {
  const preferencesQuery = useUserPreferences(userId);
  const notificationsQuery = useNotificationSettings(userId);
  const coachQuery = useCoachSettings(userId);
  const appearanceQuery = useAppearanceSettings(userId);
  const privacyQuery = usePrivacySettings(userId);
  const queries = [
    preferencesQuery,
    notificationsQuery,
    coachQuery,
    appearanceQuery,
    privacyQuery,
  ];
  return {
    isLoading: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
    error: queries.find((query) => query.error)?.error ?? null,
    preferences: preferencesQuery.data,
    notifications: notificationsQuery.data,
    coach: coachQuery.data,
    appearance: appearanceQuery.data,
    privacy: privacyQuery.data,
    refetch: async (): Promise<void> => {
      await Promise.all(queries.map((query) => query.refetch()));
    },
  };
}

export { useResetSettings, useSyncSettings };
