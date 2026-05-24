/**
 * Focus Potion Buff Indicator
 *
 * Phase 15.1 - Shows on Active Session screen when Focus Potion is active.
 *
 * Features:
 * - Buff icon in session screen
 * - Indicates +10% quality bonus
 * - Subtle glow animation
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { launchColors } from '@theme/tokens/launch-colors';


interface FocusPotionBuffProps {
  style?: ViewStyle;
}

export const FocusPotionBuff: React.FC<FocusPotionBuffProps> = ({ style }) => {
  const { theme } = useTheme();

  // Glow animation
  const glow = useSharedValue(0.5);

  React.useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value * 0.6,
  }));

  return (
    <Animated.View
      style={[
        {
          shadowColor: launchColors.hex_3b82f6,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 12,
          elevation: 4,
        },
        glowStyle,
        style,
      ]}
    >
      <Box
        p={10}
        borderRadius={12}
        flexDirection="row"
        alignItems="center"
        style={{
          backgroundColor: launchColors.hex_3b82f6,
        }}
      >
        <Box
          width={28}
          height={28}
          borderRadius={14}
          justifyContent="center"
          alignItems="center"
          style={{
            backgroundColor: launchColors.rgb_255_255_255_0_2,
          }}
        >
          <Icon name="target" size={16} color={launchColors.hex_fff} />
        </Box>

        <Box ml={8}>
          <Text
            style={{
              color: launchColors.hex_fff,
              fontWeight: '700',
              fontSize: 12,
            }}
          >
            Focus Potion
          </Text>
          <Text
            style={{
              color: launchColors.rgb_255_255_255_0_85,
              fontSize: 11,
            }}
          >
            +10% Quality
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
};

export default FocusPotionBuff;
