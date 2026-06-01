import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { timingPresets } from '../../../theme/tokens/motion';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface VexFocusMarkProps {
  size?: number;
}

export function VexFocusMark({ size = 120 }: VexFocusMarkProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(1);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 2600 }),
      -1,
      true,
    );
    breathe.value = withRepeat(
      withTiming(1, { duration: 3200 }),
      -1,
      true,
    );
  }, [isReducedMotion, pulse, breathe]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + breathe.value * 0.15,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + breathe.value * 0.1,
  }));

  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <View style={{ width: s, height: s }} accessibilityLabel="VEX focus mark">
      {/* Outer breathing ring */}
      <AnimatedSvg
        width={s}
        height={s}
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
          },
          ringStyle,
        ]}
      >
        <Defs>
          <LinearGradient id="vm-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.semantic.vexCyan} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={theme.colors.semantic.secondary} stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={s * 0.42}
          stroke="url(#vm-ring)"
          strokeWidth={1.5}
          fill="none"
        />
      </AnimatedSvg>

      {/* Core mark */}
      <AnimatedSvg
        width={s}
        height={s}
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
          },
          coreStyle,
        ]}
      >
        <Defs>
          <LinearGradient id="vm-core" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.semantic.vexCyan} />
            <Stop offset="100%" stopColor={theme.colors.semantic.secondary} />
          </LinearGradient>
        </Defs>
        {/* V-shaped shield glyph */}
        <Path
          d={`M ${cx} ${cy - s * 0.28}
             L ${cx - s * 0.22} ${cy - s * 0.06}
             L ${cx - s * 0.12} ${cy + s * 0.16}
             L ${cx} ${cy + s * 0.08}
             L ${cx + s * 0.12} ${cy + s * 0.16}
             L ${cx + s * 0.22} ${cy - s * 0.06}
             Z`}
          fill="url(#vm-core)"
          stroke={theme.colors.semantic.vexCyan}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        {/* Inner protected-block dot */}
        <Circle
          cx={cx}
          cy={cy + s * 0.04}
          r={s * 0.06}
          fill={theme.colors.text.primary}
        />
      </AnimatedSvg>
    </View>
  );
}

export default VexFocusMark;
