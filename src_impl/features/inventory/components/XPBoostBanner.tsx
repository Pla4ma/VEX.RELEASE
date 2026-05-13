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
            backgroundColor: 'theme.colors.primary[500]',
            shadowColor: 'theme.colors.primary[500]',
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
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Icon name="zap" size={22} color="theme.colors.background.primary" />
          </Box>

          {/* Text Content */}
          <Box flex={1} ml={12}>
            <Box flexDirection="row" alignItems="center">
              <Text
                style={{
                  color: 'theme.colors.background.primary',
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
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                <Text
                  style={{
                    color: 'theme.colors.background.primary',
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
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {timeRemaining} remaining
            </Text>
          </Box>

          {/* Arrow */}
          <Icon name="arrow-right" size={20} color="rgba(255, 255, 255, 0.8)" />
        </Box>
      </Pressable>
    </Animated.View>
  );
};

export default XPBoostBanner;
