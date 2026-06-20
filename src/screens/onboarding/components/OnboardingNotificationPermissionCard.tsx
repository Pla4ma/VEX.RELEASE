import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme/ThemeContext';
import { createDebugger } from '../../../utils/debug';
import {
  hasRequestedOnboardingNotificationPrompt,
  markOnboardingNotificationPromptRequested,
} from '../../../features/ai-coach/service/notification-permissions';
import { scheduleOnboardingNotifications } from '../../../features/notifications/retention-strategy';
import { trackNotificationPermission } from '../../../features/notifications/analytics';
import { registerPushToken } from '../../../features/notifications/service';
import { createSheet } from '@/shared/ui/create-sheet';
import { Text as VexText } from '../../../components/primitives/Text';
type PermissionCardState =
  | 'loading'
  | 'idle'
  | 'submitting'
  | 'complete'
  | 'hidden';
const debug = createDebugger('onboarding:notifications');
interface OnboardingNotificationPermissionCardProps {
  userId: string;
}
export function OnboardingNotificationPermissionCard({
  userId,
}: OnboardingNotificationPermissionCardProps): JSX.Element | null {
  const { theme } = useTheme();
  const [state, setState] = useState<PermissionCardState>('loading');
  const [statusMessage, setStatusMessage] = useState<string>('');
  useEffect(() => {
    let isMounted = true;
    const loadPromptState = async () => {
      const hasRequested =
        await hasRequestedOnboardingNotificationPrompt(userId);
      if (!isMounted) {
        return;
      }
      setState(hasRequested ? 'hidden' : 'idle');
    };
    loadPromptState();
    return () => {
      isMounted = false;
    };
  }, [userId]);
  const handleMaybeLater = async () => {
    setState('submitting');
    try {
      await markOnboardingNotificationPromptRequested(userId);
      setStatusMessage(
        'No pressure. You can turn reminders on later in settings.',
      );
    } catch (error) {
      debug.warn(
        'Failed to update notification prompt state after deferral',
        error,
      );
      setStatusMessage(
        'We could not save that preference just now. You can try again later.',
      );
    }
    setState('complete');
  };
  const handleEnableReminders = async () => {
    setState('submitting');
    try {
      const existingPermissions = await Notifications.getPermissionsAsync();
      const alreadyGranted =
        existingPermissions.granted ||
        existingPermissions.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL;
      let granted = alreadyGranted;
      if (!alreadyGranted) {
        const permissions = await Notifications.requestPermissionsAsync();
        granted =
          permissions.granted ||
          permissions.ios?.status ===
            Notifications.IosAuthorizationStatus.PROVISIONAL;
      }
      trackNotificationPermission(userId, granted, 'onboarding');
      if (granted) {
        try {
          const pushToken = await Notifications.getExpoPushTokenAsync();
          if (pushToken.data) {
            await registerPushToken({
              userId,
              token: pushToken.data,
              platform: Platform.OS,
            });
            debug.info('Push token stored for user: %s', userId);
          }
          await scheduleOnboardingNotifications(userId);
          debug.info('Onboarding notifications scheduled for user: %s', userId);
        } catch (tokenError) {
          debug.warn(
            'Failed to store push token or schedule notifications',
            tokenError,
          );
        }
      }
      await markOnboardingNotificationPromptRequested(userId);
      setStatusMessage(
        granted
          ? 'Reminders are on. We will only send one streak reminder per day.'
          : 'Notifications stayed off for now. You can enable them later in settings.',
      );
    } catch (error) {
      debug.warn(
        'Notification permission request failed during onboarding',
        error,
      );
      setStatusMessage(
        'We could not enable reminders just now. You can try again later.',
      );
    } finally {
      setState('complete');
    }
  };
  if (state === 'hidden') {
    return null;
  }
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.DEFAULT,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          gap: theme.spacing[3],
        },
      ]}
    >
      <View style={{ gap: theme.spacing[2] }}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Protect your streak
        </Text>
        <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
          Get a reminder when your streak is at risk. We&apos;ll only send 1 per
          day.
        </Text>
      </View>

      {state === 'loading' ? (
        <View style={{ paddingVertical: 16, alignItems: 'center', gap: 8 }}>
          <Skeleton width="80%" height={16} />
          <Skeleton width="60%" height={16} />
        </View>
      ) : state === 'complete' ? (
        <Text style={[styles.status, { color: theme.colors.text.secondary }]}>
          {statusMessage}
        </Text>
      ) : (
        <View style={[styles.actions, { gap: theme.spacing[3] }]}>
          <Button variant="primary"
            onPress={() => {
              handleEnableReminders();
            }}
            isDisabled={state === 'submitting'}
            isLoading={state === 'submitting'}
            fullWidth
            accessibilityLabel="Enable notification reminders"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Yes, remind me</VexText>
          </Button>
          <Button variant="ghost"
            onPress={() => {
              handleMaybeLater();
            }}
            isDisabled={state === 'submitting'}
            fullWidth
            accessibilityLabel="Skip notification setup"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Maybe later</VexText>
          </Button>
        </View>
      )}
    </View>
  );
}
const styles = createSheet({
  card: { borderWidth: 1, marginTop: 12 },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  body: { fontSize: 14, lineHeight: 20 },
  status: { fontSize: 14, lineHeight: 20 },
  actions: { width: '100%' },
});
