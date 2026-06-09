import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';

interface VexProofRingProps {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | string;
  size?: number;
  delay?: number;
  testID?: string;
}

const GRADE_COLORS: Record<string, string> = {
  S: lightColors.semantic.vexGold,
  A: lightColors.semantic.vexCyan,
  B: lightColors.surface.button,
  C: lightColors.surface.button,
  D: lightColors.semantic.gradeMuted,
};

const _AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function VexProofRing({
  grade,
  size = 200,
  delay = 400,
  testID,
}: VexProofRingProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const ringProgress = useSharedValue(0);
  const gradeScale = useSharedValue(0);

  const s = size;
  const strokeWidth = 8;
  const radius = (s - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = s / 2;
  const cy = s / 2;

  const gradeColor = GRADE_COLORS[grade] ?? theme.colors.semantic.textPrimary;

  useEffect(() => {
    if (isReducedMotion) {
      ringProgress.value = 1;
      gradeScale.value = 1;
      return;
    }
    ringProgress.value = withTiming(1, { duration: 800 });
    gradeScale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 200 }));
  }, [isReducedMotion, ringProgress, gradeScale, delay]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - ringProgress.value),
  }));

  const gradeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: gradeScale.value }],
    opacity: gradeScale.value,
  }));

  const isWeb = Platform.OS === 'web';

  return (
    <View
      testID={testID}
      accessibilityLabel={`Grade ${grade}`}
      style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={s} height={s} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <LinearGradient id="proof-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradeColor} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={gradeColor} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(240,240,245,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated ring — static on web, animated on native */}
        {isWeb ? (
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="url(#proof-grad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ) : (
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="url(#proof-grad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={ringAnimatedProps}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
      </Svg>

      {/* Grade letter */}
      <Animated.View style={[{ alignItems: 'center' }, isWeb ? undefined : gradeStyle]}>
        <Text
          variant="display"
          style={{
            fontSize: s * 0.35,
            fontWeight: '800',
            color: gradeColor,
            textShadowColor: gradeColor,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}
        >
          {grade}
        </Text>
      </Animated.View>
    </View>
  );
}
