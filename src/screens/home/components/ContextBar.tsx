/**
 * ContextBar
 *
 * Time-based greeting + streak status at top of Home screen.
 * Subtle, emotional context setting.
 *
 * @phase 1 - Foundation
 */

import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useStreakSummary } from '../../../features/streaks/hooks';

interface ContextBarProps {
  userId: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) {
    return 'Early start';
  }
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  if (hour < 21) {
    return 'Good evening';
  }
  return 'Night owl';
}

function getTimeBasedMessage(): string {
  const hour = new Date().getHours();
  if (hour < 6) {
    return 'The quiet hours are powerful';
  }
  if (hour < 12) {
    return 'Start the day with intention';
  }
  if (hour < 17) {
    return 'Keep the momentum going';
  }
  if (hour < 21) {
    return 'Finish strong today';
  }
  return 'One session before rest';
}

export function ContextBar({ userId }: ContextBarProps): JSX.Element {
  const { theme } = useTheme();
  const { data: streak } = useStreakSummary(userId || null);

  const containerStyle = {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  };

  const greetingSectionStyle = {
    flex: 1,
  };

  const greetingStyle = {
    marginBottom: theme.spacing[1],
  };

  const messageStyle = {
    opacity: 0.8,
  };

  const streakBadgeStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: streak?.currentDays
      ? `${theme.colors.success[500]}15`
      : theme.colors.background.secondary,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: streak?.currentDays
      ? `${theme.colors.success[500]}30`
      : theme.colors.border.light,
  };

  const streakIconStyle = {
    marginRight: theme.spacing[1],
  };

  const streakTextStyle = {
    fontWeight: '600' as const,
  };

  const greeting = getGreeting();
  const message = getTimeBasedMessage();
  const currentStreak = streak?.currentDays ?? 0;

  return (
    <View style={containerStyle}>
      <View style={greetingSectionStyle}>
        <Text
          variant="h3"
          color={theme.colors.text.primary}
          style={greetingStyle}
        >
          {greeting}
        </Text>
        <Text
          variant="body"
          color={theme.colors.text.secondary}
          style={messageStyle}
        >
          {message}
        </Text>
      </View>

      {currentStreak > 0 && (
        <View style={streakBadgeStyle}>
          <Icon
            name="flame"
            size={16}
            color={theme.colors.success[500]}
            style={streakIconStyle}
          />
          <Text
            variant="caption"
            color={theme.colors.success[500]}
            style={streakTextStyle}
          >
            {currentStreak} day streak
          </Text>
        </View>
      )}
    </View>
  );
}
