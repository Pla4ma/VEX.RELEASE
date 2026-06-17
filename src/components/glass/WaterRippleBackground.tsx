import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  Path,
  Pattern,
  RadialGradient,
  Stop,
  Rect,
  G,
  Ellipse,
} from 'react-native-svg';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export function WaterRippleBackground(): React.ReactNode {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  return (
    <View
      pointerEvents="none"
      style={{
        height: SCREEN_H,
        left: 0,
        position: 'absolute',
        top: 0,
        width: SCREEN_W,
      }}
    >
      {/* Base atmospheric gradient */}
      <LinearGradient
        colors={[vexLightGlass.background.pageTop, vexLightGlass.background.pageMid, 'rgba(132, 228, 229, 0.16)', 'rgba(95, 230, 197, 0.16)']}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.4, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        style={{
          height: SCREEN_H,
          left: 0,
          position: 'absolute',
          top: 0,
          width: SCREEN_W,
        }}
      />

      {/* Water ripple texture overlay */}
      <Svg
        height={SCREEN_H}
        style={{ opacity: 0.85, position: 'absolute' }}
        width={SCREEN_W}
      >
        <Defs>
          <Pattern height="40" id="ripplePattern" patternUnits="userSpaceOnUse" width="60">
            <Path
              d="M 0 20 Q 15 10, 30 20 Q 45 30, 60 20"
              fill="none"
              opacity="0.35"
              stroke="#18B894"
              strokeLinecap="round"
              strokeWidth="0.5"
            />
            <Path
              d="M 0 30 Q 15 20, 30 30 Q 45 40, 60 30"
              fill="none"
              opacity="0.22"
              stroke="#5FEDC7"
              strokeLinecap="round"
              strokeWidth="0.4"
            />
            <Path
              d="M 15 8 Q 30 0, 45 8"
              fill="none"
              opacity="0.18"
              stroke="#84E4E5"
              strokeLinecap="round"
              strokeWidth="0.3"
            />
          </Pattern>

          <RadialGradient cx="30%" cy="20%" id="lightBeam1" r="60%">
            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
            <Stop offset="40%" stopColor="rgba(132, 228, 229, 0.12)" />
            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </RadialGradient>

          <RadialGradient cx="70%" cy="35%" id="lightBeam2" r="50%">
            <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.38)" />
            <Stop offset="50%" stopColor="rgba(95, 237, 199, 0.08)" />
            <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </RadialGradient>

          <RadialGradient cx="45%" cy="65%" id="softGlow1" r="45%">
            <Stop offset="0%" stopColor="rgba(95, 237, 199, 0.15)" />
            <Stop offset="100%" stopColor="rgba(95, 237, 199, 0)" />
          </RadialGradient>

          <RadialGradient cx="60%" cy="80%" id="softGlow2" r="40%">
            <Stop offset="0%" stopColor="rgba(132, 228, 229, 0.12)" />
            <Stop offset="100%" stopColor="rgba(132, 228, 229, 0)" />
          </RadialGradient>
        </Defs>

        <G>
          {/* Ripple pattern fill */}
          <Rect fill="url(#ripplePattern)" height={SCREEN_H} width={SCREEN_W} />

          {/* Light beam from top-left */}
          <Path
            d={`M 0 0 L ${SCREEN_W * 0.25} 0 L ${SCREEN_W * 0.15} ${SCREEN_H} L 0 ${SCREEN_H} Z`}
            fill="url(#lightBeam1)"
            opacity={0.65}
          />

          {/* Light beam from top-right */}
          <Path
            d={`M ${SCREEN_W * 0.75} 0 L ${SCREEN_W} 0 L ${SCREEN_W} ${SCREEN_H} L ${SCREEN_W * 0.85} ${SCREEN_H} Z`}
            fill="url(#lightBeam2)"
            opacity={0.65}
          />

          {/* Soft glow areas */}
          <Ellipse cx={SCREEN_W * 0.3} cy={SCREEN_H * 0.6} fill="url(#softGlow1)" rx={SCREEN_W * 0.25} ry={SCREEN_H * 0.2} />
          <Ellipse cx={SCREEN_W * 0.7} cy={SCREEN_H * 0.75} fill="url(#softGlow2)" rx={SCREEN_W * 0.2} ry={SCREEN_H * 0.15} />

          {/* Floating tiny bubbles */}
          <Circle cx={SCREEN_W * 0.15} cy={SCREEN_H * 0.18} fill="rgba(255, 255, 255, 0.25)" r={3} />
          <Circle cx={SCREEN_W * 0.72} cy={SCREEN_H * 0.28} fill="rgba(132, 228, 229, 0.18)" r={2.5} />
          <Circle cx={SCREEN_W * 0.45} cy={SCREEN_H * 0.08} fill="rgba(255, 255, 255, 0.2)" r={4} />
          <Circle cx={SCREEN_W * 0.82} cy={SCREEN_H * 0.42} fill="rgba(95, 237, 199, 0.15)" r={2} />
          <Circle cx={SCREEN_W * 0.22} cy={SCREEN_H * 0.55} fill="rgba(255, 255, 255, 0.12)" r={3.5} />
          <Circle cx={SCREEN_W * 0.88} cy={SCREEN_H * 0.15} fill="rgba(132, 228, 229, 0.12)" r={2} />
          <Circle cx={SCREEN_W * 0.35} cy={SCREEN_H * 0.72} fill="rgba(255, 255, 255, 0.18)" r={3} />
          <Circle cx={SCREEN_W * 0.65} cy={SCREEN_H * 0.88} fill="rgba(95, 237, 199, 0.1)" r={2.5} />
        </G>
      </Svg>
    </View>
  );
}

export default WaterRippleBackground;

