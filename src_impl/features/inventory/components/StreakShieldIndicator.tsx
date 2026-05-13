/**
 * Streak Shield Indicator
 *
 * Phase 15.1 - Shows shield icon over streak flame when active.
 *
 * Features:
 * - Shield icon overlay on streak widget
 * - Indicates streak protection
 * - Gentle pulse animation
 */

import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box } from '../../../components/primitives';
import { Icon } from '../../../icons';

interface StreakShieldIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { container: 24, icon: 14 },
  md: { container: 32, icon: 18 },
  lg: { container: 40, icon: 22 },
};

export const StreakShieldIndicator: React.FC<StreakShieldIndicatorProps> = ({
  size = 'md',
}) => {
  const { theme } = useTheme();
  const config = SIZE_CONFIG[size];

  // Pulse animation
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glow.value = withRepeat(
      withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [scale, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: -config.container * 0.2,
          right: -config.container * 0.2,
          zIndex: 10,
          shadowColor: 'theme.colors.primary[500]',
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
          elevation: 4,
        },
        glowStyle,
      ]}
    >
      <Animated.View style={animatedStyle}>
        <Box
          width={config.container}
          height={config.container}
          borderRadius={config.container / 2}
          justifyContent="center"
          alignItems="center"
          style={{
            backgroundColor: 'theme.colors.primary[500]',
            borderWidth: 2,
            borderColor: 'theme.colors.background.primary',
          }}
        >
          <Icon name="shield" size={config.icon} color="theme.colors.background.primary" />
        </Box>
      </Animated.View>
    </Animated.View>
  );
};

export default StreakShieldIndicator;
