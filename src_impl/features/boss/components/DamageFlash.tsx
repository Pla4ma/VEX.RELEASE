/**
 * DamageFlash Component
 *
 * Red flash overlay that appears when boss takes damage.
 * Intensity scales with damage amount.
 *
 * @phase 3.2
 */

import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';

export interface DamageFlashProps {
  /** Damage amount to display */
  damage: number;
  /** Whether flash is currently showing */
  isVisible: boolean;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Critical hit (low health finisher) */
  isCritical?: boolean;
}

export function DamageFlash({
  damage,
  isVisible,
  onComplete,
  isCritical = false,
}: DamageFlashProps): JSX.Element | null {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      // Flash sequence: quick bright flash, then fade
      opacity.value = withSequence(
        withTiming(isCritical ? 0.6 : 0.4, { duration: 50 }),
        withTiming(isCritical ? 0.3 : 0.2, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );

      // Scale pop for damage number
      scale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withTiming(1, { duration: 200 }),
        withTiming(0.8, { duration: 100 })
      );

      // Trigger completion callback
      const timer = setTimeout(() => {
        if (onComplete) {
          runOnJS(onComplete)();
        }
      }, 400);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, isCritical, damage, onComplete, opacity, scale]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value * 2, // Make number more visible
  }));

  if (!isVisible && opacity.value === 0) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      justifyContent="center"
      alignItems="center"
      pointerEvents="none"
    >
      {/* Red flash overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isCritical ? 'theme.colors.primary[500]' : 'theme.colors.primary[500]', // Red flash
          },
          flashStyle,
        ]}
      />

      {/* Damage number */}
      <Animated.View style={numberStyle}>
        <Box
          px="lg"
          py="md"
          borderRadius="xl"
          bg="rgba(0,0,0,0.6)"
        >
          <Text
            variant="h1"
            color={isCritical ? 'theme.colors.primary[500]' : 'theme.colors.error.DEFAULT'}
            fontWeight="900"
            style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}
          >
            -{damage}
          </Text>
          {isCritical && (
            <Text
              variant="caption"
              color="theme.colors.primary[500]"
              textAlign="center"
              fontWeight="700"
            >
              CRITICAL!
            </Text>
          )}
        </Box>
      </Animated.View>

      {/* Screen shake effect lines */}
      {isCritical && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: 2,
              backgroundColor: 'theme.colors.primary[500]',
              top: '40%',
            },
            flashStyle,
          ]}
        />
      )}
    </Box>
  );
}

export default DamageFlash;
