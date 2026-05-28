import { useUserPreferences } from "./useSettingsQueries";
import { useNotificationSettings } from "./useSettingsQueries";
import { useCoachSettings } from "./useSettingsQueries";
import { useAppearanceSettings } from "./useSettingsQueries";
import { usePrivacySettings } from "./useSettingsQueries";

export function useSettingsUIState(userId: string) {
  const preferencesQuery = useUserPreferences(userId);
  const notificationsQuery = useNotificationSettings(userId);
  const coachQuery = useCoachSettings(userId);
  const appearanceQuery = useAppearanceSettings(userId);
  const privacyQuery = usePrivacySettings(userId);
  const isLoading =
    preferencesQuery.isLoading ||
    notificationsQuery.isLoading ||
    coachQuery.isLoading ||
    appearanceQuery.isLoading ||
    privacyQuery.isLoading;
  const isError =
    preferencesQuery.isError ||
    notificationsQuery.isError ||
    coachQuery.isError ||
    appearanceQuery.isError ||
    privacyQuery.isError;
  const error =
    preferencesQuery.error ||
    notificationsQuery.error ||
    coachQuery.error ||
    appearanceQuery.error ||
    privacyQuery.error;
  return {
    isLoading,
    isError,
    error,
    preferences: preferencesQuery.data,
    notifications: notificationsQuery.data,
    coach: coachQuery.data,
    appearance: appearanceQuery.data,
    privacy: privacyQuery.data,
    refetch: () => {
      preferencesQuery.refetch();
      notificationsQuery.refetch();
      coachQuery.refetch();
      appearanceQuery.refetch();
      privacyQuery.refetch();
    },
  };
}
