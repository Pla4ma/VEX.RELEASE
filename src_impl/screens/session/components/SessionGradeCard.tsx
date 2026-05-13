import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedProps,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Box, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type SessionGradeCardProps = {
  durationLabel: string;
  gradeColor: string;
  gradeLabel: string;
  gradeLetter: string;
  purityColor: string;
  purityLabel: string;
  purityScore: number;
  width: number;
  xpEarned: number;
};

function withAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#')) {return color;}
  const hex = color.length === 4 ? color.slice(1).split('').map((part) => `${part}${part}`).join('') : color.slice(1);
  const [red, green, blue] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

async function pulseCompleteHaptic(): Promise<void> {
  try {
    const dynamicImport = new Function('modulePath', 'return import(modulePath);') as (
      modulePath: string
    ) => Promise<{
      impactAsync: (style: unknown) => Promise<void>;
      ImpactFeedbackStyle: { Medium: unknown };
    }>;
    const haptics = await dynamicImport('expo-haptics');
    await haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
  } catch (error) { captureSilentFailure(error, { feature: 'screens', operation: 'ui-fallback', type: 'ui' });
    // Haptics are optional at runtime.
  }
}

export function SessionGradeCard({
  durationLabel,
  gradeColor,
  gradeLabel,
  gradeLetter,
  purityColor,
  purityLabel,
  purityScore,
  width,
  xpEarned,
}: SessionGradeCardProps) {
  const { theme } = useTheme();
  const ringProgress = useSharedValue(0);
  const size = Math.min(width - 72, 280);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPurity = Math.max(0, Math.min(100, purityScore));

  useEffect(() => {
    ringProgress.value = withSequence(
      withTiming(Math.min(100, clampedPurity + 4), {
        duration: 820,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(clampedPurity, { duration: 180, easing: Easing.out(Easing.cubic) }),
    );
    const timeoutId = setTimeout(() => void pulseCompleteHaptic(), 1000);
    return () => clearTimeout(timeoutId);
  }, [clampedPurity, ringProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (circumference * ringProgress.value) / 100,
  }));

  return (
    <Box width="100%" minHeight={440} justifyContent="center" alignItems="center" px={24} py={24}>
      <Animated.View entering={FadeIn.duration(220)} style={StyleSheet.absoluteFillObject}>
        <View style={{ flex: 1, backgroundColor: 'theme.colors.primary[500]' }} />
      </Animated.View>
      <Animated.View entering={FadeInDown.springify().damping(13).stiffness(180)}>
        <Box px={16} py={10} borderRadius={999} style={{ backgroundColor: withAlpha(theme.colors.primary[500], 0.9) }}>
          <Text variant="label" color={theme.colors.text.inverse}>+{xpEarned} XP</Text>
        </Box>
      </Animated.View>
      <Box mt={22} alignItems="center">
        <Animated.View entering={FadeIn.duration(220)}>
          <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
              <Defs>
                <LinearGradient id="session-grade-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={withAlpha(gradeColor, 0.55)} />
                  <Stop offset="100%" stopColor={gradeColor} />
                </LinearGradient>
              </Defs>
              <Circle cx={size / 2} cy={size / 2} r={radius} stroke={withAlpha(theme.colors.text.inverse, 0.08)} strokeWidth={strokeWidth} fill="none" />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#session-grade-ring)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                rotation="-90"
                originX={size / 2}
                originY={size / 2}
                fill="none"
              />
            </Svg>
            <View pointerEvents="none" style={styles.center}>
              <Animated.View entering={FadeInDown.delay(180).springify().damping(11).stiffness(180)}>
                <Text variant="hero" color={gradeColor} style={{ fontSize: 96, lineHeight: 102 }}>{gradeLetter}</Text>
              </Animated.View>
              <Animated.View entering={FadeInUp.delay(320).springify()}>
                <Text variant="body" color={theme.colors.text.secondary} textAlign="center">{gradeLabel}</Text>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(380).springify()}>
          <Box mt={24} px={24} py={20} alignItems="center" style={{ backgroundColor: withAlpha(theme.colors.background.secondary, 0.92), borderWidth: 1, borderColor: withAlpha(gradeColor, 0.34), ...getPremiumCardStyle('hero') }}>
            <Text variant="h3" color={theme.colors.text.primary}>{clampedPurity}% purity</Text>
            <Text variant="body" color={purityColor} mt={8}>{purityLabel}</Text>
            <Text variant="caption" color={theme.colors.text.secondary} mt={14}>{durationLabel}</Text>
          </Box>
        </Animated.View>
      </Box>
    </Box>
  );
}

const styles = createSheet({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
