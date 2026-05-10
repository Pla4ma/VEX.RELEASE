/**
 * BossNearDeath Component
 *
 * Pulsing red border on boss cards when < 15% health.
 * "BOSS ESCAPE IMMINENT" warning for < 10%.
 * Used on boss cards everywhere they appear.
 *
 * @phase 3A.2
 */

<<<<<<< HEAD
import React from "react";
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring } from "react-native-reanimated";
=======
import React from 'react';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, withSpring, interpolateColor } from 'react-native-reanimated';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface BossNearDeathProps {
  /** Current boss health percentage (0-100) */
  healthPercent: number;
  /** Hours remaining until boss escape */
  hoursRemaining: number;
  /** Boss name for warning message */
  bossName: string;
  /** Show as compact banner (true) or full card overlay (false) */
  compact?: boolean;
}

/**
 * Near-death pulsing border wrapper
 */
export function BossNearDeath({ healthPercent, hoursRemaining, bossName, compact = false }: BossNearDeathProps): JSX.Element | null {
  const { theme } = useTheme();

  // Only show when boss is near death
  const isNearDeath = healthPercent <= 15;
  const isCritical = healthPercent <= 10 && hoursRemaining <= 6;

  const pulseStyle = useAnimatedStyle(() => ({
    borderColor: withRepeat(withSequence(withTiming(theme.colors.error.DEFAULT, { duration: 500 }), withTiming(theme.colors.error.light, { duration: 500 })), -1, true),
    transform: [
      {
        scale: isCritical ? withRepeat(withSequence(withSpring(1.02, { damping: 10 }), withSpring(1, { damping: 10 })), -1, true) : 1,
      },
    ],
  }));

  if (!isNearDeath) {
    return null;
  }

  if (compact) {
    return (
      <Animated.View
        style={[
          {
            borderWidth: 2,
            borderRadius: 12,
            overflow: 'hidden',
          },
          pulseStyle,
        ]}
      >
        {/* ESCAPE IMMINENT banner */}
        {isCritical && (
          <Box
            bg="error.DEFAULT"
            px="md"
            py="xs"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <Text variant="caption" color="text.inverse" fontWeight="700" textAlign="center">
              🚨 BOSS ESCAPE IMMINENT — {hoursRemaining}h left!
            </Text>
          </Box>
        )}

        {/* FINISH HIM badge */}
        {!isCritical && (
          <Box
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              zIndex: 10,
            }}
          >
            <Box px="sm" py="xs" borderRadius="full" bg="error.DEFAULT">
              <Text variant="caption" color="text.inverse" fontWeight="700" fontSize={10}>
                FINISH HIM!
              </Text>
            </Box>
          </Box>
        )}
      </Animated.View>
    );
  }

  // Full warning overlay
  return (
    <Animated.View
      style={[
        {
          borderWidth: 3,
          borderRadius: 16,
          overflow: 'hidden',
        },
        pulseStyle,
      ]}
    >
      {/* Critical warning banner */}
      {isCritical && (
        <Box bg="error.DEFAULT" px="lg" py="md">
          <Text variant="h4" color="text.inverse" fontWeight="700" textAlign="center">
            🚨 LAST CHANCE
          </Text>
          <Text variant="body" color="text.inverse" textAlign="center">
            {bossName} escapes in {hoursRemaining} hours!
          </Text>
        </Box>
      )}

      {/* Near-death badge */}
      {!isCritical && (
        <Box
          bg={`${theme.colors.error.DEFAULT}20`}
          px="lg"
          py="md"
          style={{
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.error.DEFAULT,
          }}
        >
          <Box flexDirection="row" alignItems="center" gap="sm" justifyContent="center">
            <Text fontSize={20}>⚔️</Text>
            <Text variant="h4" color="error.DEFAULT" fontWeight="700">
              FINISH HIM!
            </Text>
          </Box>
          <Text variant="body" color="text.secondary" textAlign="center">
            Only {healthPercent.toFixed(0)}% health remaining
          </Text>
        </Box>
      )}
    </Animated.View>
  );
}

/**
 * Boss escape warning banner (for session screen)
 */
export function BossEscapeWarning({ bossName, hoursRemaining }: { bossName: string; hoursRemaining: number }): JSX.Element {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    backgroundColor: withRepeat(withSequence(withTiming(`${theme.colors.error.DEFAULT}40`, { duration: 600 }), withTiming(`${theme.colors.error.DEFAULT}20`, { duration: 600 })), -1, true),
  }));

  return (
    <Animated.View
      style={[
        {
          borderRadius: 12,
          borderWidth: 2,
          borderColor: theme.colors.error.DEFAULT,
          overflow: 'hidden',
        },
        pulseStyle,
      ]}
    >
      <Box px="lg" py="md" alignItems="center">
        <Text variant="h4" color="error.DEFAULT" fontWeight="700">
          🚨 BOSS ESCAPE IMMINENT
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center">
          {bossName} will escape in {hoursRemaining} hours! Start a session now to defeat them.
        </Text>
      </Box>
    </Animated.View>
  );
}

export default BossNearDeath;
