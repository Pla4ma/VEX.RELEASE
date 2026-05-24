/**
 * PerfectSessionBanner
 *
 * Shown when session is perfect: S grade + no pauses + 30min+
 * Renders BETWEEN GradeRevealAnimation settling and ChestReveal
 */

import React from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Box } from '../../../components/primitives';
import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';

interface PerfectSessionBannerProps {
  isPerfect: boolean;
}

export function PerfectSessionBanner({ isPerfect }: PerfectSessionBannerProps): JSX.Element | null {
  const { theme } = useTheme();

  if (!isPerfect) {return null;}

  return (
    <Animated.View
      entering={ZoomIn.delay(300).duration(400).springify()}
      style={{ marginHorizontal: theme.spacing[6], marginTop: theme.spacing[6] }}
    >
      <Box
        borderRadius="xl"
        overflow="hidden"
        borderWidth={2}
        borderColor="warning.500"
        style={{
          shadowColor: theme.colors.warning.DEFAULT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
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
              No pauses. Full focus. Maximum quality.
            </Text>
          </Box>
        </LinearGradient>
      </Box>
    </Animated.View>
  );
}

export default PerfectSessionBanner;
