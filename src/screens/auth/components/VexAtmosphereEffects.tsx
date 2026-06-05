import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);

export function FlowCurves() {
  const { width } = useWindowDimensions();
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: EASE_AMBIENT }), -1, true);
  }, [drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 24 - 12 }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -40, left: 0, right: 0, height: 280 }, animatedStyle]}>
      <Svg width={width} height={280} viewBox={`0 0 ${width} 280`}>
        <Defs>
          <SvgLinearGradient id="curveGold" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={rgbaColors.rgb_224_184_112_0} />
            <Stop offset="50%" stopColor={rgbaColors.rgb_224_184_112_0_20} />
            <Stop offset="100%" stopColor={rgbaColors.rgb_224_184_112_0} />
          </SvgLinearGradient>
          <SvgLinearGradient id="curveTeal" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={rgbaColors.rgb_94_234_212_0} />
            <Stop offset="50%" stopColor={rgbaColors.rgb_94_234_212_0_12} />
            <Stop offset="100%" stopColor={rgbaColors.rgb_94_234_212_0} />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={`M -40 180 Q ${width * 0.25} 60, ${width * 0.5} 140 T ${width + 40} 110`}
          stroke="url(#curveGold)" strokeWidth={0.8} fill="none"
        />
        <Path
          d={`M -40 210 Q ${width * 0.3} 100, ${width * 0.55} 175 T ${width + 40} 150`}
          stroke="url(#curveTeal)" strokeWidth={0.6} fill="none"
        />
        <Path
          d={`M -40 90 Q ${width * 0.2} 30, ${width * 0.45} 80 T ${width + 40} 50`}
          stroke="url(#curveGold)" strokeWidth={0.5} fill="none" opacity={0.5}
        />
      </Svg>
    </Animated.View>
  );
}

export function SoftOrb({ cx, cy, r, color, dur, delay }: {
  cx: number; cy: number; r: number; color: string; dur: number; delay: number;
}) {
  const op = useSharedValue(0.4);
  const sc = useSharedValue(1);

  useEffect(() => {
    op.value = withDelay(delay, withRepeat(
      withTiming(0.7, { duration: dur, easing: EASE_AMBIENT }),
      -1, true,
    ));
    sc.value = withDelay(delay, withRepeat(
      withTiming(1.15, { duration: dur * 1.3, easing: EASE_AMBIENT }),
      -1, true,
    ));
  }, [op, sc, dur, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ scale: sc.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: cx - r, top: cy - r }, style]}>
      <Svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}>
        <Defs>
          <RadialGradient id={`orb-${cx}-${cy}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Path d={`M ${r} 0 a ${r} ${r} 0 1 0 0 ${r * 2} a ${r} ${r} 0 1 0 0 -${r * 2}`} fill={`url(#orb-${cx}-${cy})`} />
      </Svg>
    </Animated.View>
  );
}
