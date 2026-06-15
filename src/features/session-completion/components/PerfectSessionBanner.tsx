/**
 * PerfectSessionBanner
 *
 * Shown when session is perfect: S grade + no pauses + 30min+
 * Renders BETWEEN GradeRevealAnimation settling and ChestReveal
 */

import React from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface PerfectSessionBannerProps {
  isPerfect: boolean;
}

export function PerfectSessionBanner({
  isPerfect,
}: PerfectSessionBannerProps): JSX.Element | null {
  const { theme } = useTheme();

  if (!isPerfect) {
    return null;
  }

  return (
    <Animated.View
      entering={ZoomIn.delay(300).duration(400).springify()}
      style={{
        marginHorizontal: theme.spacing[6],
        marginTop: theme.spacing[6],
      }}
    >
      <Box
        borderRadius="xl"
        overflow="hidden"
        borderWidth={2}
        borderColor="warning.500"
        style={{
          boxShadow: `0px 4px 8px ${theme.colors.warning.DEFAULT} / 0.3`,
        }}
      >
        <LinearGradient
          colors={[
            theme.colors.warning.DEFAULT + '40', // 25% opacity
            theme.colors.warning.light + '20', // 12% opacity
            theme.colors.background.elevated,
          ]}
          locations={[0, 0.3, 1]}
          style={{
            padding: theme.spacing[5],
          }}
        >
          <Box alignItems="center" gap="xs">
            <Text
              style={{
                fontSize: 28,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              🌟
            </Text>
            <Text
              variant="h3"
              color="warning.DEFAULT"
              weight="bold"
              style={{ textAlign: 'center' }}
            >
              PERFECT SESSION
            </Text>
            <Text
              variant="body"
              color="text.secondary"
              style={{ textAlign: 'center', marginTop: theme.spacing[2] }}
            >
              Flawless block. Zero interruptions. VEX will carry this pattern forward.
            </Text>
          </Box>
        </LinearGradient>
      </Box>
    </Animated.View>
  );
}

export default PerfectSessionBanner;