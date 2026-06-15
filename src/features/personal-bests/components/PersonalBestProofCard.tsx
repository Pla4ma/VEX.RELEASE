import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Box, Text } from '../../../components/primitives/Box';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';

type PersonalBestProofCardProps = {
  achievedAt: string;
  durationBucket: string;
  mode: string;
  newValue: number;
  oldValue: number | null;
};

export function PersonalBestProofCard({
  achievedAt,
  durationBucket,
  mode,
  newValue,
  oldValue,
}: PersonalBestProofCardProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(isReducedMotion ? 1 : 0.98);
  const achievedDate = new Date(achievedAt).toLocaleDateString();

  useEffect(() => {
    scale.value = isReducedMotion
      ? 1
      : withSpring(1, { damping: 18, stiffness: 160 });
  }, [isReducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box
        mx={6}
        mb={5}
        p={5}
        borderRadius={theme.borderRadius.md}
        borderWidth={1}
        borderColor={theme.colors.border.DEFAULT}
        bg={theme.colors.background.secondary}
        accessibilityLabel={`Personal best: ${mode} ${durationBucket} minutes, ${newValue} purity`}
      >
        <Text variant="label" color={theme.colors.primary[400]}>
          Personal best
        </Text>
        <Text variant="h3" color={theme.colors.text.primary} mt={2}>
          {mode} - {durationBucket} min
        </Text>
        <Text variant="display" color={theme.colors.primary[500]} mt={3}>
          {oldValue === null ? `${newValue}` : `${oldValue} -> ${newValue}`}
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary} mt={2}>
          Achieved {achievedDate}
        </Text>
      </Box>
    </Animated.View>
  );
}
