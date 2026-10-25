import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/primitives/Text';
import type { SettingsStackParams } from '../../navigation';
import { useDeleteAccount } from '../../features/account-deletion/hooks';
import { useAuthStore, useUIStore } from '../../store/index';
import { useSettingsStore } from '../../features/settings/store';
import { usePrivacySettings, useUpdatePrivacySettings } from '../../features/settings/hooks';
import { usePaywall } from '../../shared/monetization/use-revenuecat-derived';
import { captureSilentFailure } from '../../utils/silent-failure';
import { ErrorState } from '../../components/states/ErrorState';
import { applyAnalyticsPreference } from '../../features/settings/analytics-preference';
import { PrivacyToggleRow } from './PrivacyToggleRow';
import { PrivacySettingsSkeleton } from './PrivacySettingsSkeleton';
import { TOGGLE_ROWS } from './privacy-toggle-data';
import type { ToggleKey } from './privacy-toggle-data';
import { LiquidGlassCard } from '../../shared/ui/liquid-glass/LiquidGlassCard';
import { LiquidGlassHeader, liquidGlassSpacing } from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';
import { vexFire } from '../../theme/tokens/vex-fire';

type Props = NativeStackScreenProps<SettingsStackParams, 'PrivacySettings'>;

const PrivacySettingsScreen: React.ComponentType<Props> = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const showToast = useUIStore((state) => state.showToast);
  const { restore } = usePaywall();
  const deleteAccountMutation = useDeleteAccount();
  const privacyQuery = usePrivacySettings(user?.id ?? '');
  const updatePrivacy = useUpdatePrivacySettings(user?.id ?? '');
  const analyticsEnabled = useSettingsStore((state) => state.analyticsEnabled);
  useEffect(() => {
    if (privacyQuery.data) applyAnalyticsPreference(!privacyQuery.data.analyticsOptOut);
  }, [privacyQuery.data]);
  const analyticsOptOut = privacyQuery.data?.analyticsOptOut ?? false;
  const toggleValue = useCallback((_key: ToggleKey): void => {
    if (!user?.id) return;
    const nextOptOut = !analyticsOptOut;
    applyAnalyticsPreference(!nextOptOut);
    updatePrivacy.mutate({ analyticsOptOut: nextOptOut }, {
      onError: () => applyAnalyticsPreference(analyticsEnabled),
    });
  }, [analyticsEnabled, analyticsOptOut, updatePrivacy, user?.id]);

  const confirmDelete = useCallback((): void => {
    if (!user?.id) {
      return;
    }
    Alert.alert(
      'Delete account permanently?',
      'This removes your VEX account, signs out purchases, and clears local private data from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            deleteAccountMutation
              .deleteAccountAsync({ userId: user.id })
              .then(() => {
                clearUser();
              })
              .catch(() => {
                showToast({
                  message: 'Account deletion failed. Please try again.',
                  type: 'error',
                  duration: 5000,
                });
              });
          },
        },
      ],
    );
  }, [clearUser, deleteAccountMutation, showToast, user?.id]);

  const restorePurchases = useCallback((): void => {
    restore()
      .then((result) => {
        showToast({
          message: result.success
            ? 'Purchases restored.'
            : 'No active purchases were found to restore.',
          type: result.success ? 'success' : 'warning',
          duration: 5000,
        });
      })
      .catch((error: unknown) => {
        captureSilentFailure(error, { feature: 'settings', operation: 'restorePurchases', type: 'network' });
        showToast({
          message:
            'Restore failed. Try again from the App Store account that purchased VEX.',
          type: 'error',
          duration: 5000,
        });
      });
  }, [restore, showToast]);

  return (
    <LiquidGlassScreen>
      {deleteAccountMutation.isPending || Boolean(user?.id && privacyQuery.isPending) ? (
        <PrivacySettingsSkeleton />
      ) : privacyQuery.isError ? (
        <ErrorState
          title="Privacy settings are unavailable"
          description="Your privacy controls did not load. Try again."
          retryLabel="Retry"
          onRetry={() => { void privacyQuery.refetch(); }}
        />
      ) : (
        <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + theme.spacing[6],
          paddingHorizontal: liquidGlassSpacing.screenX,
          paddingTop: insets.top + liquidGlassSpacing.screenTop,
        }}
      >
        <LiquidGlassHeader
          eyebrow="Privacy"
          title="Control room"
          body="Manage what leaves your device and account recovery actions."
        />

        <LiquidGlassCard
          emphasized
          style={{ marginBottom: theme.spacing[4] }}
        >
          {TOGGLE_ROWS.map((row) => (
            <PrivacyToggleRow
              key={row.key}
              row={row}
              value={!analyticsOptOut}
              disabled={updatePrivacy.isPending || !user?.id}
              onToggle={toggleValue}
            />
          ))}
        </LiquidGlassCard>


        <Pressable
          accessibilityHint="Restores App Store purchases through the shared purchase layer."
          accessibilityLabel="Restore purchases"
          accessibilityRole="button"
          onPress={restorePurchases}
          style={{
            alignItems: 'center',
            borderColor: vexFire.border,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            marginBottom: theme.spacing[3],
            minHeight: 56,
            justifyContent: 'center',
          }}
        >
          <Text variant="button" color={vexFire.cream}>
            Restore Purchases
          </Text>
        </Pressable>

        <Pressable
          accessibilityHint="Permanently deletes your VEX account and clears local private data."
          accessibilityLabel="Delete account"
          accessibilityRole="button"
          disabled={deleteAccountMutation.isPending || !user?.id}
          onPress={confirmDelete}
          style={{
            alignItems: 'center',
            backgroundColor: vexFire.danger,
            borderRadius: theme.borderRadius.lg,
            minHeight: 56,
            justifyContent: 'center',
            opacity: deleteAccountMutation.isPending
              ? theme.opacity[50]
              : theme.opacity[100],
          }}
        >
          <Text variant="button" color={vexFire.cream}>
            {deleteAccountMutation.isPending
              ? 'Deleting Account...'
              : 'Delete Account'}
          </Text>
        </Pressable>
      </ScrollView>
      )}
    </LiquidGlassScreen>
  );
};

const PrivacySettingsScreenWithBoundary = withScreenErrorBoundary(PrivacySettingsScreen, "PrivacySettings");
export { PrivacySettingsScreenWithBoundary as PrivacySettingsScreen };
