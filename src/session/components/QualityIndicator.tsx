/**
 * QualityIndicator Component
 *
 * Live quality score shown as letter grade: S / A / B / C / D
 * Updates when user pauses (score decreases) or maintains focus (score holds).
 * Shows XP preview and strict mode badge.
 *
 * @phase 1C.6
 */

import React, { useMemo } from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';

import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme';

export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface QualityIndicatorProps {
  /** Current quality grade */
  grade: QualityGrade;
  /** Numeric purity score (0-100) */
  purityScore: number;
  /** Estimated XP at current pace */
  xpEstimate: number;
  /** XP multiplier from streaks/other bonuses */
  xpMultiplier: number;
  /** Whether strict mode is enabled */
  isStrictMode: boolean;
  /** Whether session is currently paused (affects grade display) */
  isPaused: boolean;
  /** Whether quality decreased recently (trigger animation) */
  qualityDecreased?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Grade configuration with colors and descriptions
 */
const gradeConfig: Record<
  QualityGrade,
  {
    color: string;
    bgColor: string;
    label: string;
    description: string;
  }
> = {
  S: {
    color: '#9333EA', // Purple
    bgColor: 'rgba(147, 51, 234, 0.15)',
    label: 'PERFECT',
    description: 'Flawless focus',
  },
  A: {
    color: '#22C55E', // Green
    bgColor: 'rgba(34, 197, 94, 0.15)',
    label: 'EXCELLENT',
    description: 'Great focus',
  },
  B: {
    color: '#3B82F6', // Blue
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'GOOD',
    description: 'Solid focus',
  },
  C: {
    color: '#6B7280', // Gray
    bgColor: 'rgba(107, 114, 128, 0.15)',
    label: 'FAIR',
    description: 'Some interruptions',
  },
  D: {
    color: '#EF4444', // Red
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'NEEDS WORK',
    description: 'Many interruptions',
  },
};

/**
 * Skeleton loading state
 */
function QualityIndicatorSkeleton(): JSX.Element {
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

/**
 * Strict mode badge
 */
function StrictModeBadge(): JSX.Element {
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

/**
 * Grade badge with animation
 */
function GradeBadge({
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

  // Animate when grade changes
  React.useEffect(() => {
    if (qualityDecreased) {
      scaleValue.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
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
        <Text
          fontSize={28}
          fontWeight="800"
          color={config.color}
        >
          {grade}
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * XP estimate preview
 */
function XpEstimatePreview({
  xpEstimate,
  multiplier,
}: {
  xpEstimate: number;
  multiplier: number;
}): JSX.Element {
  const { theme } = useTheme();
  const displayXp = Math.round(xpEstimate * multiplier);

  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={14}>✨</Text>
      <Text
        variant="bodySmall"
        color="text.secondary"
      >
        ~{displayXp} XP
      </Text>
      {multiplier > 1 && (
        <Box
          px="xs"
          py="xs"
          borderRadius="sm"
          bg={`${theme.colors.accent.purple}20`}
        >
          <Text
            variant="caption"
            color={theme.colors.accent.purple}
            fontWeight="700"
            fontSize={10}
          >
            {multiplier.toFixed(1)}×
          </Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * Purity progress bar
 */
function PurityBar({
  purityScore,
  grade,
}: {
  purityScore: number;
  grade: QualityGrade;
}): JSX.Element {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);

  React.useEffect(() => {
    progressValue.value = withSpring(purityScore / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [purityScore, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  const config = gradeConfig[grade];

  return (
    <Box width={120} gap="xs">
      <Box
        height={6}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 3,
              backgroundColor: config.color,
            },
            animatedStyle,
          ]}
        />
      </Box>
      <Text variant="caption" color="text.tertiary" textAlign="center">
        Focus purity: {purityScore}%
      </Text>
    </Box>
  );
}

/**
 * Main quality indicator component
 */
export function QualityIndicator({
  grade,
  purityScore,
  xpEstimate,
  xpMultiplier,
  isStrictMode,
  isPaused,
  qualityDecreased,
  isLoading = false,
}: QualityIndicatorProps): JSX.Element {
  const { theme } = useTheme();
  const config = gradeConfig[grade];

  if (isLoading) {
    return <QualityIndicatorSkeleton />;
  }

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="lg"
        py="md"
        px="lg"
      >
        {/* Grade Badge */}
        <GradeBadge
          grade={grade}
          qualityDecreased={qualityDecreased}
          isPaused={isPaused}
        />

        {/* Info Column */}
        <Box gap="xs" alignItems="flex-start">
          {/* Grade Label */}
          <Text
            variant="h4"
            color={config.color}
            fontWeight="700"
          >
            {config.label}
          </Text>

          {/* Description */}
          <Text
            variant="bodySmall"
            color="text.secondary"
          >
            {isPaused ? '⏸ Paused - quality at risk' : config.description}
          </Text>

          {/* XP Estimate */}
          <XpEstimatePreview xpEstimate={xpEstimate} multiplier={xpMultiplier} />

          {/* Strict Mode Badge */}
          {isStrictMode && <StrictModeBadge />}
        </Box>
      </Box>

      {/* Purity Progress Bar */}
      <Box alignItems="center" mt="sm">
        <PurityBar purityScore={purityScore} grade={grade} />
      </Box>
    </Animated.View>
  );
}

export default QualityIndicator;
