import React, { memo, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme/ThemeContext';

function FocusRings(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;
  const cx = width * 0.5;
  const cy = height * 0.36;

  return (
    <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id="focusCore" cx="50%" cy="36%" r="58%">
          <Stop offset="0%" stopColor={semantic.liquidAmber} stopOpacity="0.34" />
          <Stop offset="38%" stopColor={semantic.liquidOrange} stopOpacity="0.14" />
          <Stop offset="100%" stopColor={semantic.liquidGlassClear} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={width * 0.72} fill="url(#focusCore)" />
      <Circle cx={cx} cy={cy + 8} r={width * 0.44} stroke={semantic.liquidGlassBorder} strokeWidth={1} fill="none" opacity={0.65} />
      <Circle cx={cx} cy={cy + 8} r={width * 0.28} stroke={semantic.liquidViolet} strokeWidth={1} fill="none" opacity={0.65} />
      <Line x1={width * 0.16} y1={cy} x2={width * 0.84} y2={cy} stroke={semantic.liquidGlassHighlight} strokeWidth={1} opacity={0.65} />
    </Svg>
  );
}

function AuroraVeil(): React.JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    drift.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift, isReducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.72,
    transform: [
      { translateX: -18 + drift.value * 36 },
      { translateY: -8 + drift.value * 16 },
      { rotate: `${-9 + drift.value * 4}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 82,
          left: -42,
          right: -42,
          height: 220,
          borderRadius: 140,
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
        locations={[0, 0.34, 0.68, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, opacity: 0.85 }}
      />
    </Animated.View>
  );
}

export const LiquidGlassBackground = memo(function LiquidGlassBackground(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height }}>
      <LinearGradient
        colors={[semantic.liquidNight, semantic.liquidAbyss, semantic.obsidian]}
        locations={[0, 0.48, 1]}
        style={{ position: 'absolute', width, height }}
      />
      <FocusRings />
      <AuroraVeil />
      <LinearGradient
        colors={[semantic.liquidGlassClear, semantic.liquidNight]}
        locations={[0.42, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.46 }}
      />
    </View>
  );
});

