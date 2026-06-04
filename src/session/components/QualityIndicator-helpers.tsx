import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';
import { lightColors } from '@/theme/tokens/colors';


export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface QualityIndicatorProps {
  grade: QualityGrade;
  purityScore: number;
  xpEstimate: number;
  xpMultiplier: number;
  isStrictMode: boolean;
  isPaused: boolean;
  qualityDecreased?: boolean;
  isLoading?: boolean;
}

export const gradeConfig: Record<
  QualityGrade,
  { color: string; bgColor: string; label: string; description: string }
> = {
  S: {
    color: lightColors.accent.purple,
    bgColor: 'rgba(147,51,234,0.15)',
    label: 'PERFECT',
    description: 'Flawless focus',
  },
  A: {
    color: lightColors.semantic.success,
    bgColor: 'rgba(34,197,94,0.15)',
    label: 'EXCELLENT',
    description: 'Great focus',
  },
  B: {
    color: lightColors.accent.blue,
    bgColor: 'rgba(59,130,246,0.15)',
    label: 'GOOD',
    description: 'Solid focus',
  },
  C: {
    color: lightColors.text.muted,
    bgColor: 'rgba(107,114,128,0.15)',
    label: 'FAIR',
    description: 'Some interruptions',
  },
  D: {
    color: lightColors.semantic.danger,
    bgColor: 'rgba(239,68,68,0.15)',
    label: 'NEEDS WORK',
    description: 'Many interruptions',
  },
};

export function QualityIndicatorSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap="md"
      py="md"
    >
      <Box
        width={64}
        height={64}
        borderRadius="xl"
        bg={theme.colors.background.tertiary}
      />
      <Box gap="sm">
        <Box
          width={80}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          width={60}
          height={12}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
      </Box>
    </Box>
  );
}

export function StrictModeBadge(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="full"
      bg={`${theme.colors.accent.orange}20`}
      borderWidth={1}
      borderColor={theme.colors.accent.orange}
    >
      <Text fontSize={10}>🔥</Text>
      <Text
        variant="caption"
        color={theme.colors.accent.orange}
        fontWeight="700"
        fontSize={10}
      >
        STRICT MODE
      </Text>
    </Box>
  );
}

export function GradeBadge({
  grade,
  qualityDecreased,
  isPaused,
}: {
  grade: QualityGrade;
  qualityDecreased?: boolean;
  isPaused: boolean;
}): JSX.Element {
  const config = gradeConfig[grade];
  const scaleValue = useSharedValue(1);
  React.useEffect(() => {
    if (qualityDecreased) {
      scaleValue.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 }),
      );
    }
  }, [qualityDecreased, scaleValue]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));
  return (
    <Animated.View style={animatedStyle}>
      <Box
        width={64}
        height={64}
        borderRadius="xl"
        bg={config.bgColor}
        borderWidth={3}
        borderColor={config.color}
        justifyContent="center"
        alignItems="center"
        opacity={isPaused ? 0.6 : 1}
      >
        <Text fontSize={28} fontWeight="800" color={config.color}>
          {grade}
        </Text>
      </Box>
    </Animated.View>
  );
}
