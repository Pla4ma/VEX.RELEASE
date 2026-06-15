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
import { Text } from '../../../components/primitives/Text';
import { GlassPill } from '../../../components/glass/GlassPill';
import { Icon } from '../../../icons/components/Icon';
import { useStreakSummary } from '../../../features/streaks/hooks';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

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

export function ContextBar({ userId }: ContextBarProps): React.ReactNode {
  const { data: streak } = useStreakSummary(userId || null);
  const greeting = getGreeting();
  const message = getTimeBasedMessage();
  const currentStreak = streak?.currentDays ?? 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.3,
            marginBottom: 4,
          }}
        >
          {greeting}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 14,
          }}
        >
          {message}
        </Text>
      </View>

      {currentStreak > 0 && (
        <GlassPill
          label={`${currentStreak} day streak`}
          leftIcon={
            <Icon color={vexLightGlass.mint[800]} name="flame" size="xs" variant="solid" />
          }
          size="sm"
          variant="success"
        />
      )}
    </View>
  );
}
