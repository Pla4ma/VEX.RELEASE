import React from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';
import { useTheme } from '../../theme/ThemeContext';
import {
  type QualityGrade,
  type QualityIndicatorProps,
  gradeConfig,
  QualityIndicatorSkeleton,
  StrictModeBadge,
  GradeBadge,
} from './QualityIndicator-helpers';

function XpEstimatePreview({
  xpEstimate,
  multiplier,
}: {
  xpEstimate: number;
  multiplier: number;
}): React.ReactNode {
  const { theme } = useTheme();
  const displayXp = Math.round(xpEstimate * multiplier);
  return (
    <Box flexDirection="row" alignItems="center" gap="xs">
      <Text fontSize={14}>✨</Text>
      <Text variant="bodySmall" color="text.secondary">
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

function PurityBar({
  purityScore,
  grade,
}: {
  purityScore: number;
  grade: QualityGrade;
}): React.ReactNode {
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
            { height: '100%', borderRadius: 3, backgroundColor: config.color },
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

export function QualityIndicator({
  grade,
  purityScore,
  xpEstimate,
  xpMultiplier,
  isStrictMode,
  isPaused,
  qualityDecreased,
  isLoading = false,
}: QualityIndicatorProps): React.ReactNode {
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
        {}
        <GradeBadge
          grade={grade}
          qualityDecreased={qualityDecreased}
          isPaused={isPaused}
        />

        {}
        <Box gap="xs" alignItems="flex-start">
          {}
          <Text variant="h4" color={config.color} fontWeight="700">
            {config.label}
          </Text>

          {}
          <Text variant="bodySmall" color="text.secondary">
            {isPaused ? '⏸ Paused - quality at risk' : config.description}
          </Text>

          {}
          <XpEstimatePreview
            xpEstimate={xpEstimate}
            multiplier={xpMultiplier}
          />

          {}
          {isStrictMode && <StrictModeBadge />}
        </Box>
      </Box>

      {}
      <Box alignItems="center" mt="sm">
        <PurityBar purityScore={purityScore} grade={grade} />
      </Box>
    </Animated.View>
  );
}

export default QualityIndicator;
