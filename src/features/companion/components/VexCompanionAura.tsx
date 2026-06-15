import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface VexCompanionAuraProps {
  size?: number;
  laneColor?: string;
  testID?: string;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export function VexCompanionAura({
  size = 56,
  laneColor,
  testID,
}: VexCompanionAuraProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(1);
  const drift = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    pulse.value = withRepeat(
      withTiming(1.12, { duration: 3000 }),
      -1,
      true,
    );
    drift.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true,
    );
  }, [isReducedMotion, pulse, drift]);

  const auraStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isReducedMotion ? 1 : pulse.value },
      {
        translateY: isReducedMotion
          ? 0
          : (drift.value - 0.5) * 4,
      },
    ],
    opacity: 0.6 + (isReducedMotion ? 0 : (pulse.value - 1) * 0.3),
  }));

  const coreColor = laneColor ?? theme.colors.semantic.vexCyan;
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  return (
    <View
      testID={testID}
      accessibilityLabel="Companion aura"
      style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}
    >
      <AnimatedSvg
        width={s}
        height={s}
        style={[
          { position: 'absolute', left: 0, top: 0 },
          auraStyle,
        ]}
      >
        <Defs>
          <RadialGradient id="aura-grad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={coreColor} stopOpacity="0.35" />
            <Stop offset="60%" stopColor={coreColor} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={s * 0.48} fill="url(#aura-grad)" />
      </AnimatedSvg>
      <View
        style={{
          width: s * 0.35,
          height: s * 0.35,
          borderRadius: (s * 0.35) / 2,
          backgroundColor: `${coreColor}40`,
          borderWidth: 1,
          borderColor: `${coreColor}60`,
        }}
      />
    </View>
  );
}
