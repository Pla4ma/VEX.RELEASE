import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { Icon } from '../../../icons';
import type { CompanionMood } from '../../companion/types';
import {
  CompanionHeaderAvatar,
  GreetingHeaderSkeleton,
  LevelBadge,
  ProfileAvatar,
  StreakIndicator,
} from './GreetingHeaderParts';


export interface GreetingHeaderProps {
  userName?: string;
  avatarUrl?: string;
  level: number;
  streakDays: number;
  streakHoursRemaining?: number | null;
  isLoading?: boolean;
  companionMood?: CompanionMood;
  onPressCompanion?: () => void;
  onPressProfile?: () => void;
  onPressNotifications?: () => void;
  unreadNotificationCount?: number;
}

function getGreeting(hour: number): string {
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  if (hour < 21) {
    return 'Good evening';
  }
  return 'Good night';
}

export function GreetingHeader({
  userName,
  avatarUrl,
  level,
  streakDays,
  streakHoursRemaining,
  isLoading = false,
  companionMood,
  onPressCompanion,
  onPressProfile,
  onPressNotifications,
  unreadNotificationCount = 0,
}: GreetingHeaderProps): JSX.Element {
  const { theme } = useTheme();
  const hour = new Date().getHours();
  const greeting = useMemo(() => getGreeting(hour), [hour]);

  if (isLoading) {
    return <GreetingHeaderSkeleton />;
  }

  const displayName = userName || 'Focus Warrior';
  const hasUnread = unreadNotificationCount > 0;

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(100)}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        px="lg"
        py="md"
      >
        <Box flexDirection="row" alignItems="center" gap="md" flex={1}>
          <ProfileAvatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            onPressProfile={onPressProfile}
          />
          <Box gap="xs">
            <Text
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {greeting}
            </Text>
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Text
                variant="h4"
                color="text.primary"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>
              <CompanionHeaderAvatar
                mood={companionMood}
                onPress={onPressCompanion}
              />
            </Box>
          </Box>
        </Box>
        <Box flexDirection="row" alignItems="center" gap="sm">
          {/* Notification Bell */}
          {onPressNotifications && (
            <Pressable
              onPress={onPressNotifications}
              accessibilityLabel={`Notifications${hasUnread ? `, ${unreadNotificationCount} unread` : ''}`}
              accessibilityRole="button"
              accessibilityHint="View your notifications"
              style={{ padding: 8, position: 'relative' }}
            >
              <Icon
                name={hasUnread ? 'notification' : 'notification-bing'}
                size={24}
                color={
                  hasUnread
                    ? theme.colors.error.DEFAULT
                    : theme.colors.text.secondary
                }
              />
              {hasUnread && (
                <Box
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: theme.colors.error.DEFAULT,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: theme.colors.background.primary,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: '700',
                      lineHeight: 14,
                    }}
                  >
                    {unreadNotificationCount > 9
                      ? '9+'
                      : unreadNotificationCount}
                  </Text>
                </Box>
              )}
            </Pressable>
          )}
          <LevelBadge level={level} />
          {streakDays > 0 ? (
            <StreakIndicator
              days={streakDays}
              hoursRemaining={streakHoursRemaining}
            />
          ) : null}
        </Box>
      </Box>
    </Animated.View>
  );
}

export default GreetingHeader;
