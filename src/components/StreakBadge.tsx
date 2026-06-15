import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Text } from './primitives/Text';
import { useTheme } from '../theme/ThemeContext';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { createSheet } from '@/shared/ui/create-sheet';
import { useReducedMotion } from '@/hooks';

type StreakBadgeProps = {
  days: number;
  isAtRisk: boolean;
  variant?: 'default' | 'glass';
  accessibilityLabel?: string;
};

export function StreakBadge({
  days,
  isAtRisk,
  variant = 'default',
  accessibilityLabel,
}: StreakBadgeProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(0);
  const isGlass = variant === 'glass';

  useEffect(() => {
    if (isAtRisk && days > 0) {
      pulse.value = isReducedMotion
        ? 1
        : withRepeat(withTiming(1, { duration: 900 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0.3;
    }
    return () => {
      cancelAnimation(pulse);
    };
  }, [days, isAtRisk, pulse, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: isAtRisk ? 1.5 + pulse.value : 1.5,
    shadowOpacity: isAtRisk ? 0.16 + pulse.value * 0.14 : 0.2,
  }));

  const staticStyle = [
    styles.badge,
    isGlass
      ? styles.glassBadge
      : {
          backgroundColor: isAtRisk
            ? theme.colors.error[50]
            : theme.colors.warning[50],
          borderColor: isAtRisk
            ? theme.colors.error[500]
            : theme.colors.accent.orange,
          shadowColor: isAtRisk
            ? theme.colors.error[500]
            : theme.colors.accent.orange,
          shadowOpacity: isAtRisk ? 0.3 : 0.2,
        },
  ];

  if (days === 0) {
    return (
      <View
        style={[
          styles.badge,
          isGlass
            ? styles.glassBadge
            : {
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.DEFAULT,
              },
        ]}
        accessibilityLabel={accessibilityLabel ?? "Start streak"}
        accessibilityRole="text"
      >
        <Text
          variant="label"
          color={
            isGlass
              ? rgbaColors.rgb_255_255_255_0_92
              : theme.colors.text.secondary
          }
        >
          Start streak
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View
        style={staticStyle}
        accessibilityLabel={accessibilityLabel ?? `${days} day streak${isAtRisk ? ', at risk' : ''}`}
        accessibilityRole="text"
      >
        <Text
          variant="label"
          color={
            isGlass
              ? rgbaColors.rgb_255_255_255_0_96
              : isAtRisk
                ? theme.colors.error.dark
                : theme.colors.accent.orange
          }
        >{`${days} days`}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      accessibilityLabel={accessibilityLabel ?? `${days} day streak${isAtRisk ? ', at risk' : ''}`}
      accessibilityRole="text"
      style={[
        styles.badge,
        animatedStyle,
        isGlass
          ? styles.glassBadge
          : {
              backgroundColor: isAtRisk
                ? theme.colors.error[50]
                : theme.colors.warning[50],
              borderColor: isAtRisk
                ? theme.colors.error[500]
                : theme.colors.accent.orange,
              shadowColor: isAtRisk
                ? theme.colors.error[500]
                : theme.colors.accent.orange,
            },
      ]}
    >
      <Text
        variant="label"
        color={
          isGlass
            ? rgbaColors.rgb_255_255_255_0_96
            : isAtRisk
              ? theme.colors.error.dark
              : theme.colors.accent.orange
        }
      >{`${days} days`}</Text>
    </Animated.View>
  );
}

const styles = createSheet({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  glassBadge: {
    backgroundColor: rgbaColors.rgb_255_255_255_0_15,
    borderColor: rgbaColors.rgb_255_255_255_0_3,
    shadowColor: rgbaColors.rgb_0_0_0_0_2,
  },
});
