import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';

const EASE_CINEMATIC = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * EditorialFlourish — the hand-drawn flourish above the VEX wordmark.
 * Asymmetric three-segment stroke with a center diamond emblem and two
 * end-cap dots. Drawn in (not a generic smooth curve).
 */
export function EditorialFlourish({ isReducedMotion }: { isReducedMotion: boolean }): React.JSX.Element {
  const draw = useSharedValue(isReducedMotion ? 1 : 0);
  useEffect(() => {
    if (isReducedMotion) return;
    draw.value = withDelay(120, withTiming(1, { duration: 1200, easing: EASE_CINEMATIC }));
  }, [draw, isReducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: draw.value }));
  return (
    <Animated.View style={[{ width: 220, height: 24, alignItems: 'center' }, style]}>
      <Svg width={220} height={24} viewBox="0 0 220 24">
        <Defs>
          <SvgLinearGradient id="flourishGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="rgba(224,184,112,0)" />
            <Stop offset="20%" stopColor="rgba(224,184,112,0.5)" />
            <Stop offset="50%" stopColor="rgba(242,234,217,0.95)" />
            <Stop offset="80%" stopColor="rgba(224,184,112,0.5)" />
            <Stop offset="100%" stopColor="rgba(224,184,112,0)" />
          </SvgLinearGradient>
        </Defs>
        <Path d="M 8 12 Q 40 4, 70 12 T 132 12" stroke="url(#flourishGrad)" strokeWidth={1} fill="none" strokeLinecap="round" />
        <Path d="M 88 10 Q 100 4, 112 10" stroke="url(#flourishGrad)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <Path d="M 150 12 Q 180 20, 212 12" stroke="url(#flourishGrad)" strokeWidth={1} fill="none" strokeLinecap="round" />
        <Path d="M 110 6 L 113 12 L 110 18 L 107 12 Z" fill="rgba(242,234,217,0.85)" />
        <Path d="M 110 9 L 111.5 12 L 110 15 L 108.5 12 Z" fill="rgba(110, 75, 30, 0.9)" />
        <Path d="M 4 12 a 1.4 1.4 0 1 0 0.01 0" fill="rgba(224,184,112,0.7)" />
        <Path d="M 216 12 a 1.4 1.4 0 1 0 0.01 0" fill="rgba(224,184,112,0.7)" />
      </Svg>
    </Animated.View>
  );
}
