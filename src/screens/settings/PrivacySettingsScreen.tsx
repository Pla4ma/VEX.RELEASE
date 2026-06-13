import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Box, Card, Text } from '../../components/primitives';
import type { SettingsStackParams } from '../../navigation';
import { useDeleteAccount } from '../../features/account-deletion/hooks';
import { useAuthStore, useUIStore } from '../../store/index';
import { usePaywall } from '../../shared/monetization';
import { captureSilentFailure } from '../../utils/silent-failure';
import { PrivacyToggleRow } from './PrivacyToggleRow';
import { PrivacySettingsSkeleton } from './PrivacySettingsSkeleton';
import { TOGGLE_ROWS } from './privacy-toggle-data';
import type { ToggleKey } from './privacy-toggle-data';
import {
  LiquidGlassCard,
  LiquidGlassHeader,
  LiquidGlassScreen,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass';

type Props = NativeStackScreenProps<SettingsStackParams, 'PrivacySettings'>;

export const PrivacySettingsScreen: React.FC<Props> = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const showToast = useUIStore((state) => state.showToast);
  const { restore } = usePaywall();
  const deleteAccountMutation = useDeleteAccount();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    activitySharing: false,
    squadFeed: false,
    analytics: true,
  });

  const toggleValue = useCallback((key: ToggleKey): void => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }, []);

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
      {deleteAccountMutation.isPending ? (
        <PrivacySettingsSkeleton />
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
              value={toggles[row.key]}
              onToggle={toggleValue}
            />
          ))}
        </LiquidGlassCard>

        <Card
          variant="outlined"
          size="md"
          style={{ marginBottom: theme.spacing[4] }}
        >
          <Text variant="body" color="text.primary">
            Data Export
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginTop: theme.spacing[1] }}
          >
            Export is disabled until the verified export pipeline is live. No
            fake request is shown.
          </Text>
        </Card>

        <Pressable
          accessibilityHint="Restores App Store purchases through the shared purchase layer."
          accessibilityLabel="Restore purchases"
          accessibilityRole="button"
          onPress={restorePurchases}
          style={{
            alignItems: 'center',
            borderColor: theme.colors.border.DEFAULT,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            marginBottom: theme.spacing[3],
            minHeight: 56,
            justifyContent: 'center',
          }}
        >
          <Text variant="button" color="text.primary">
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
            backgroundColor: theme.colors.error.DEFAULT,
            borderRadius: theme.borderRadius.lg,
            minHeight: 56,
            justifyContent: 'center',
            opacity: deleteAccountMutation.isPending
              ? theme.opacity[50]
              : theme.opacity[100],
          }}
        >
          <Text variant="button" color="text.inverse">
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

export default withScreenErrorBoundary(
  PrivacySettingsScreen,
  'PrivacySettings',
);
