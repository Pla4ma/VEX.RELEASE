/**
 * FocusRingSvg — pure SVG ring component (presentation only).
 */
import React from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export const RING_SIZE = 280;
export const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface FocusRingSvgProps {
  animatedProps: ReturnType<typeof useAnimatedProps<{ strokeDashoffset: number }>>;
}

export function FocusRingSvg({
  animatedProps,
}: FocusRingSvgProps): React.JSX.Element {
  return (
    <Svg height={RING_SIZE + 36} width={RING_SIZE + 36}>
      <Defs>
        <LinearGradient
          id="ring-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor={vexLightGlass.mint[400]} />
          <Stop offset="60%" stopColor={vexLightGlass.mint[600]} />
          <Stop offset="100%" stopColor={vexLightGlass.mint[800]} />
        </LinearGradient>
      </Defs>
      <Circle
        cx={(RING_SIZE + 36) / 2}
        cy={(RING_SIZE + 36) / 2}
        r={RADIUS + 8}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1.5}
        fill="none"
      />
      <Circle
        cx={(RING_SIZE + 36) / 2}
        cy={(RING_SIZE + 36) / 2}
        r={RADIUS}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      <AnimatedCircle
        cx={(RING_SIZE + 36) / 2}
        cy={(RING_SIZE + 36) / 2}
        r={RADIUS}
        stroke="url(#ring-gradient)"
        strokeWidth={STROKE_WIDTH}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={animatedProps}
        strokeLinecap="round"
        transform={`rotate(-90 ${(RING_SIZE + 36) / 2} ${(RING_SIZE + 36) / 2})`}
      />
    </Svg>
  );
}
