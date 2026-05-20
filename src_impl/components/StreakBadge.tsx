import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Text } from './primitives/Text';
import { useTheme } from '../theme';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';


type StreakBadgeProps = { days: number; isAtRisk: boolean; variant?: 'default' | 'glass' };

export function StreakBadge({ days, isAtRisk, variant = 'default' }: StreakBadgeProps): JSX.Element {
  const { theme } = useTheme();
  const pulse = useSharedValue(0);
  const isGlass = variant === 'glass';

  useEffect(() => {
    if (isAtRisk && days > 0) {
      pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0.3;
    }
    return () => {
      cancelAnimation(pulse);
    };
  }, [days, isAtRisk, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: isAtRisk ? 1.5 + pulse.value : 1.5,
    shadowOpacity: isAtRisk ? 0.16 + pulse.value * 0.14 : 0.2,
  }));

  if (days === 0) {
    return (
      <View style={[styles.badge, isGlass ? styles.glassBadge : { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.DEFAULT }]}>
        <Text variant="label" color={isGlass ? launchColors.rgb_255_255_255_0_92 : theme.colors.text.secondary}>Start streak</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.badge,
        animatedStyle,
        isGlass
          ? styles.glassBadge
          : {
              backgroundColor: isAtRisk ? theme.colors.error[50] : theme.colors.warning[50],
              borderColor: isAtRisk ? theme.colors.error[500] : theme.colors.accent.orange,
              shadowColor: isAtRisk ? theme.colors.error[500] : theme.colors.accent.orange,
            },
      ]}
    >
      <Text variant="label" color={isGlass ? launchColors.rgb_255_255_255_0_96 : isAtRisk ? theme.colors.error.dark : theme.colors.accent.orange}>{`🔥 ${days} days`}</Text>
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
    backgroundColor: launchColors.rgb_255_255_255_0_15,
    borderColor: launchColors.rgb_255_255_255_0_3,
    shadowColor: launchColors.rgb_0_0_0_0_2,
  },
});
