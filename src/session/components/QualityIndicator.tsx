import React from "react";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Box } from "../../components/primitives/Box";
import { Text } from "../../components/primitives/Text";
import { useTheme } from "../../theme";
import { launchColors } from "@theme/tokens/launch-colors";
export type QualityGrade = "S" | "A" | "B" | "C" | "D";
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
const gradeConfig: Record<
  QualityGrade,
  { color: string; bgColor: string; label: string; description: string }
> = {
  S: {
    color: launchColors.hex_9333ea,
    bgColor: launchColors.rgb_147_51_234_0_15,
    label: "PERFECT",
    description: "Flawless focus",
  },
  A: {
    color: launchColors.hex_22c55e,
    bgColor: launchColors.rgb_34_197_94_0_15,
    label: "EXCELLENT",
    description: "Great focus",
  },
  B: {
    color: launchColors.hex_3b82f6,
    bgColor: launchColors.rgb_59_130_246_0_15,
    label: "GOOD",
    description: "Solid focus",
  },
  C: {
    color: launchColors.hex_6b7280,
    bgColor: launchColors.rgb_107_114_128_0_15,
    label: "FAIR",
    description: "Some interruptions",
  },
  D: {
    color: launchColors.hex_ef4444,
    bgColor: launchColors.rgb_239_68_68_0_15,
    label: "NEEDS WORK",
    description: "Many interruptions",
  },
};
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
            { height: "100%", borderRadius: 3, backgroundColor: config.color },
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
}: QualityIndicatorProps): JSX.Element {
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
            {isPaused ? "⏸ Paused - quality at risk" : config.description}
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
