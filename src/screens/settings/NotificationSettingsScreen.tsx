import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useState } from 'react';
import { ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { Box, Text, Card } from '../../components/primitives/Box';
import { Icon } from '../../icons/components/Icon';
import { useUIStore } from '../../store/index';
import type { SettingsStackParams } from '../../navigation';
import { lightColors } from '@/theme/tokens/colors';

import { NotificationCategoryToggle } from './NotificationCategoryToggle';
import { NotificationScheduleSection } from './NotificationScheduleSection';
import { notificationGroups } from './notification-groups';
import {
  LiquidGlassHeader,
  LiquidGlassScreen,
  liquidGlassSpacing,
} from $1../../shared/ui/liquid-glass/LiquidGlassHeader$1;

type Props = NativeStackScreenProps<
  SettingsStackParams,
  'NotificationSettings'
>;

export const NotificationSettingsScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast: _showToast } = useUIStore();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    streakReminders: true,
    bossAlerts: true,
    squadNotifications: true,
    rivalNotifications: true,
    weeklyReport: true,
    coachMessages: true,
    achievementUnlocks: true,
    sessionReminders: true,
    dailyChallenge: true,
  });

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSendTestNotification = useCallback(() => {
    Alert.alert(
      'Test Notification',
      'A test notification has been scheduled.',
      [{ text: 'OK' }],
    );
  }, []);

  return (
    <LiquidGlassScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={liquidGlassSpacing.screenX}
          pb={16}
          pt={insets.top + liquidGlassSpacing.screenTop}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Notification setting"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <LiquidGlassHeader
            eyebrow="Signal"
            title="Notifications"
            body="Choose which focus signals are allowed to reach you."
          />
        </Box>

        <NotificationScheduleSection />

        {notificationGroups.map((group) => (
          <Box key={group.title} px={16} mb={24}>
            <Text
              variant="caption"
              color="text.secondary"
              style={{
                marginLeft: 12,
                marginBottom: 8,
                fontWeight: '600',
                letterSpacing: 0.5,
              }}
            >
              {group.title.toUpperCase()}
            </Text>
            <Card size="sm" style={{ overflow: 'hidden' }}>
              {group.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <NotificationCategoryToggle
                    item={item}
                    value={toggles[item.id] ?? false}
                    onToggle={handleToggle}
                  />
                  {index < group.items.length - 1 && (
                    <Box
                      height={1}
                      ml={68}
                      style={{ backgroundColor: theme.colors.border.light }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </Box>
        ))}

        <Box px={16} mb={24}>
          <Pressable
            onPress={handleSendTestNotification}
            style={{
              backgroundColor: theme.colors.primary[500],
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            accessibilityLabel="Send test notification"
            accessibilityRole="button"
            accessibilityHint="Double tap to change setting"
          >
            <Box flexDirection="row" alignItems="center">
              <Icon name="bell" size={18} color={lightColors.text.inverse} />
              <Text
                style={{
                  color: lightColors.text.inverse,
                  fontWeight: '600',
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                Send Test Notification
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </LiquidGlassScreen>
  );
};

export default withScreenErrorBoundary(
  NotificationSettingsScreen,
  'NotificationSettings',
);
