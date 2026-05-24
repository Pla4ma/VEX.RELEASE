/**
 * XP Boost Banner Component
 *
 * Phase 15.1 - Shows on Home screen when XP Boost is active.
 *
 * Features:
 * - Small banner with countdown
 * - Indicates active +25% XP bonus
 * - Pulsing animation
 */

import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { launchColors } from '@theme/tokens/launch-colors';


interface XPBoostBannerProps {
  expiresAt: number;
  onPress?: () => void;
}

const formatTimeRemaining = (expiresAt: number): string => {
  const now = Date.now();
  const remaining = Math.max(0, expiresAt - now);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const XPBoostBanner: React.FC<XPBoostBannerProps> = ({
  expiresAt,
  onPress,
}) => {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(expiresAt));

  // Pulsing animation
  const pulse = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    // Pulse animation
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Shimmer animation
    translateX.value = withRepeat(
      withTiming(100, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Update timer every second
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, pulse, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        <Box
          mx={16}
          mb={16}
          p={12}
          borderRadius={12}
          flexDirection="row"
          alignItems="center"
          style={{
            backgroundColor: launchColors.hex_f59e0b,
            shadowColor: launchColors.hex_f59e0b,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Icon */}
          <Box
            width={40}
            height={40}
            borderRadius={20}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: launchColors.rgb_255_255_255_0_2,
            }}
          >
            <Icon name="zap" size={22} color={launchColors.hex_fff} />
          </Box>

          {/* Text Content */}
          <Box flex={1} ml={12}>
            <Box flexDirection="row" alignItems="center">
              <Text
                style={{
                  color: launchColors.hex_fff,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                XP Boost Active
              </Text>
              <Box
                ml={8}
                px={8}
                py={2}
                borderRadius={8}
                style={{
                  backgroundColor: launchColors.rgb_255_255_255_0_25,
                }}
              >
                <Text
                  style={{
                    color: launchColors.hex_fff,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  +25%
                </Text>
              </Box>
            </Box>
            <Text
              style={{
                color: launchColors.rgb_255_255_255_0_9,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {timeRemaining} remaining
            </Text>
          </Box>

          {/* Arrow */}
          <Icon name="arrow-right" size={20} color={launchColors.rgb_255_255_255_0_8} />
        </Box>
      </Pressable>
    </Animated.View>
  );
};

export default XPBoostBanner;
