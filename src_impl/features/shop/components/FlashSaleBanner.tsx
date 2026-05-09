/**
 * Flash Sale Banner Component
 *
 * Phase 15.6 - Shows active flash sale in the shop.
 *
 * Features:
 * - FLASH SALE banner with countdown
 * - Item details with 50% off
 * - Countdown timer showing remaining time
 * - Urgent styling with pulsing animation
 */

import React, { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, interpolate } from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { Box, Text, Card } from '../../../components/primitives';
import { Icon } from '../../../icons';
import type { FlashSale } from '../FlashSaleSystem';
import { formatFlashSaleCountdown, getFlashSaleTimeRemaining } from '../FlashSaleSystem';

interface FlashSaleBannerProps {
  flashSale: FlashSale | null;
  onPress: () => void;
}

export const FlashSaleBanner: React.FC<FlashSaleBannerProps> = ({ flashSale, onPress }) => {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState('');

  // Animations
  const pulse = useSharedValue(1);
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    if (flashSale) {
      // Pulsing animation for urgency
      pulse.value = withRepeat(withSequence(withTiming(1.02, { duration: 500, easing: Easing.inOut(Easing.ease) }), withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })), -1, true);

      // Shimmer animation
      shimmer.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);

      // Update countdown every second
      const interval = setInterval(() => {
        const remaining = getFlashSaleTimeRemaining(flashSale);
        setTimeRemaining(formatFlashSaleCountdown(remaining));
      }, 1000);

      // Initial update
      const initialRemaining = getFlashSaleTimeRemaining(flashSale);
      setTimeRemaining(formatFlashSaleCountdown(initialRemaining));

      return () => clearInterval(interval);
    }
    return undefined;
  }, [flashSale, pulse, shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  if (!flashSale) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        <Box
          mx={16}
          mb={20}
          borderRadius={16}
          overflow="hidden"
          style={{
            backgroundColor: '#1A1A2E',
            borderWidth: 2,
            borderColor: '#EF4444',
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* Flash Sale Header */}
          <Box
            p={12}
            style={{
              backgroundColor: '#EF4444',
            }}
          >
            <Box flexDirection="row" justifyContent="space-between" alignItems="center">
              <Box flexDirection="row" alignItems="center">
                <Animated.View
                  style={[
                    {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#FFF',
                      marginRight: 8,
                    },
                    shimmerStyle,
                  ]}
                />
                <Text
                  style={{
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: 16,
                    letterSpacing: 1,
                  }}
                >
                  ⚡ FLASH SALE
                </Text>
              </Box>

              {/* Countdown */}
              <Box
                px={10}
                py={4}
                borderRadius={8}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <Box flexDirection="row" alignItems="center">
                  <Icon name="clock" size={12} color="#FFF" />
                  <Text
                    style={{
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: 14,
                      marginLeft: 4,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {timeRemaining}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Item Content */}
          <Box p={16} flexDirection="row" alignItems="center">
            {/* Item Icon */}
            <Box
              width={64}
              height={64}
              borderRadius={16}
              justifyContent="center"
              alignItems="center"
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderWidth: 2,
                borderColor: theme.colors.border.light,
              }}
            >
              <Text style={{ fontSize: 32 }}>{flashSale.itemIcon}</Text>
            </Box>

            {/* Item Details */}
            <Box flex={1} ml={16}>
              <Text
                variant="body"
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 4,
                  color: theme.colors.text.primary,
                }}
              >
                {flashSale.itemName}
              </Text>

              <Text variant="caption" color="text.secondary" numberOfLines={1} style={{ marginBottom: 8 }}>
                {flashSale.itemDescription}
              </Text>

              {/* Price Row */}
              <Box flexDirection="row" alignItems="center">
                <Text
                  variant="caption"
                  style={{
                    textDecorationLine: 'line-through',
                    color: theme.colors.text.tertiary,
                    marginRight: 10,
                  }}
                >
                  {flashSale.originalPrice}
                </Text>

                <Box
                  px={10}
                  py={4}
                  borderRadius={8}
                  style={{
                    backgroundColor: flashSale.currency === 'GEMS' ? '#8B5CF6' + '20' : '#F59E0B' + '20',
                  }}
                >
                  <Box flexDirection="row" alignItems="center">
                    <Icon name={flashSale.currency === 'GEMS' ? 'gem' : 'coins'} size={14} color={flashSale.currency === 'GEMS' ? '#8B5CF6' : '#F59E0B'} />
                    <Text
                      style={{
                        fontWeight: '800',
                        fontSize: 16,
                        color: flashSale.currency === 'GEMS' ? '#8B5CF6' : '#F59E0B',
                        marginLeft: 4,
                      }}
                    >
                      {flashSale.discountedPrice}
                    </Text>
                  </Box>
                </Box>

                {/* Discount Badge */}
                <Box
                  ml={10}
                  px={8}
                  py={3}
                  borderRadius={6}
                  style={{
                    backgroundColor: '#EF4444',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFF',
                      fontWeight: '700',
                      fontSize: 11,
                    }}
                  >
                    -{flashSale.discountPercent}%
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Arrow */}
            <Box ml={12}>
              <Icon name="arrow-right" size={24} color="#EF4444" />
            </Box>
          </Box>

          {/* Urgency Footer */}
          <Box
            p={10}
            style={{
              backgroundColor: '#EF4444' + '10',
              borderTopWidth: 1,
              borderTopColor: '#EF4444' + '20',
            }}
          >
            <Box flexDirection="row" justifyContent="center" alignItems="center">
              <Icon name="alert-circle" size={14} color="#EF4444" />
              <Text
                variant="caption"
                style={{
                  color: '#EF4444',
                  fontWeight: '600',
                  marginLeft: 6,
                }}
              >
                Limited time - Buy now before it's gone!
              </Text>
            </Box>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
};

export default FlashSaleBanner;
