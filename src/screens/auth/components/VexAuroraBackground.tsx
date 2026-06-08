import React, { memo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';

const AURORA_CYCLE_MS = 18000;
const EASE_SINE = Easing.inOut(Easing.sin);

function ControlledGlows(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const s = theme.colors.semantic;

  return (
    <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id="violetGlow" cx="30%" cy="25%" r="65%">
          <Stop offset="0%" stopColor={s.liquidViolet} stopOpacity="0.28" />
          <Stop offset="45%" stopColor={s.liquidViolet} stopOpacity="0.10" />
          <Stop offset="100%" stopColor={s.liquidAbyss} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="orangeGlow" cx="70%" cy="72%" r="55%">
          <Stop offset="0%" stopColor={s.liquidOrange} stopOpacity="0.22" />
          <Stop offset="40%" stopColor={s.liquidAmber} stopOpacity="0.08" />
          <Stop offset="100%" stopColor={s.liquidAbyss} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="coolRim" cx="85%" cy="15%" r="50%">
          <Stop offset="0%" stopColor={s.liquidCyan} stopOpacity="0.08" />
          <Stop offset="100%" stopColor={s.liquidAbyss} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={width * 0.25} cy={height * 0.22} r={width * 0.65} fill="url(#violetGlow)" />
      <Circle cx={width * 0.65} cy={height * 0.78} r={width * 0.55} fill="url(#orangeGlow)" />
      <Circle cx={width * 0.88} cy={height * 0.14} r={width * 0.42} fill="url(#coolRim)" />
    </Svg>
  );
}

function AuroraVeil(): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const drift = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) {
      return;
    }
    drift.value = withRepeat(
      withTiming(1, { duration: AURORA_CYCLE_MS, easing: EASE_SINE }),
      -1,
      true,
    );
  }, [drift, isReducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.55,
    transform: [
      { translateX: -24 + drift.value * 48 },
      { translateY: -10 + drift.value * 20 },
      { rotate: `${-6 + drift.value * 3}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: '18%',
          left: -60,
          right: -60,
          height: 260,
          borderRadius: 160,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.semantic.liquidGlassClear,
          theme.colors.semantic.liquidViolet,
          theme.colors.semantic.liquidOrange,
          theme.colors.semantic.liquidGlassClear,
        ]}
        locations={[0, 0.38, 0.68, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, opacity: 0.85 }}
      />
    </Animated.View>
  );
}

function OrbitalLines(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const s = theme.colors.semantic;
  const cx = width * 0.5;
  const cy = height * 0.42;

  return (
    <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute' }}>
      <Circle
        cx={cx}
        cy={cy}
        r={width * 0.38}
        stroke={s.liquidGlassBorder}
        strokeWidth={0.5}
        fill="none"
        opacity={0.65}
      />
      <Circle
        cx={cx}
        cy={cy + 6}
        r={width * 0.24}
        stroke={s.liquidViolet}
        strokeWidth={0.5}
        fill="none"
        opacity={0.65}
      />
    </Svg>
  );
}

export const VexAuroraBackground = memo(function VexAuroraBackground(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const s = theme.colors.semantic;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height }}>
      <LinearGradient
        colors={[s.liquidNight, s.liquidAbyss, s.obsidian]}
        locations={[0, 0.52, 1]}
        style={{ position: 'absolute', width, height }}
      />
      <ControlledGlows />
      <OrbitalLines />
      <AuroraVeil />
      <LinearGradient
        colors={[s.liquidGlassClear, s.liquidNight]}
        locations={[0.45, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.44 }}
      />
    </View>
  );
});
