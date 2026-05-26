import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

interface BossHealthBarProps {
  currentHealth: number;
  maxHealth: number;
}

export function BossHealthBar({
  currentHealth,
  maxHealth,
}: BossHealthBarProps): JSX.Element {
  const { theme } = useTheme();
  const progress = useSharedValue(maxHealth > 0 ? currentHealth / maxHealth : 0);
  const clamped = maxHealth > 0 ? Math.max(0, Math.min(1, currentHealth / maxHealth)) : 0;

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.colors.background.tertiary,
            borderColor: theme.colors.border.strong,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            { backgroundColor: theme.colors.error.DEFAULT },
          ]}
        />
      </View>
      <Text
        variant="caption"
        color={theme.colors.text.secondary}
        style={styles.label}
      >
        {`${currentHealth.toLocaleString()} / ${maxHealth.toLocaleString()} HP`}
      </Text>
    </View>
  );
}

const styles = createSheet({
  wrapper: {
    gap: 8,
    width: '100%',
  },
  track: {
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
  label: {
    textAlign: 'center',
  },
});

export default BossHealthBar;
