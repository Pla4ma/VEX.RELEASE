import React from 'react';
import { View } from 'react-native';
import { FocusRing } from '../../components/FocusRing';
import { Text } from '../../components/primitives/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { useTheme } from '../../theme/ThemeContext';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

/**
 * Turns a numeric stat (progress + streak) into a one-sentence narrative.
 * The minutes number stays the focal point; this sentence gives the
 * number its meaning instead of leaving it as a stat monument.
 */
export function focusNarrative(
  progressPercent: number,
  streak: number,
): string {
  if (progressPercent >= 100) {
    return streak > 0
      ? 'Daily goal cleared. Today is already a win for the run.'
      : 'Daily goal cleared. VEX will use this to plan tomorrow.';
  }
  if (progressPercent >= 60) {
    return streak > 0
      ? `Past the midpoint of today's goal. Day ${streak} is moving.`
      : 'Past the midpoint of today. The shape of a run is forming.';
  }
  if (progressPercent > 0) {
    return 'Early in today. Each clean block adds to the rest.';
  }
  return streak > 0
    ? `Day ${streak} is active. The first block sets the rest of the day.`
    : 'No focus yet today. One short block is enough to start.';
}

const WHITE_SOFT = rgbaColors.rgb_255_255_255_0_18;

export function HeroLoadingState({
  isUltraNarrow,
}: {
  isUltraNarrow: boolean;
}): React.ReactNode {
  return (
    <View
      style={{
        alignItems: 'center',
        gap: 8,
        alignSelf: 'center',
      }}
    >
      <Skeleton
        width={isUltraNarrow ? 88 : 132}
        height={isUltraNarrow ? 88 : 132}
        variant="circular"
      />
      <Skeleton width={88} height={14} />
    </View>
  );
}

export function HeroOnboardPanel(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: WHITE_SOFT,
          borderColor: rgbaColors.rgb_255_255_255_0_22,
          borderWidth: 1,
          padding: 16,
          gap: 8,
        },
        getPremiumCardStyle('medium'),
      ]}
    >
      <Text variant="h4" color={theme.colors.text.inverse}>
        Welcome to VEX
      </Text>
      <Text variant="bodySmall" color={rgbaColors.rgb_255_255_255_0_72}>
        Start one clean session. VEX will use it to shape tomorrow.
      </Text>
    </View>
  );
}

export function HeroFocusBlock({
  isCompact,
  isUltraNarrow,
  progressPercent,
  todayFocusMinutes,
}: {
  isCompact: boolean;
  isUltraNarrow: boolean;
  progressPercent: number;
  todayFocusMinutes: number;
}): React.ReactNode {
  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: isCompact ? 'center' : undefined,
        gap: 8,
      }}
    >
      <FocusRing
        progressPercent={progressPercent}
        focusMinutes={todayFocusMinutes}
        size={isUltraNarrow ? 96 : 132}
      />
      <Text variant="label" color={rgbaColors.rgb_255_255_255_0_72}>
        Daily Goal
      </Text>
    </View>
  );
}
