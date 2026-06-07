import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export function LiquidGlassBackdrop(): JSX.Element {
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ left: 0, position: 'absolute', top: 0 }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <Defs>
        <LinearGradient id="strand" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <Stop offset="50%" stopColor="#A9F0DD" stopOpacity="0.14" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient cx="50%" cy="50%" id="pearlGlow" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.54" />
          <Stop offset="58%" stopColor="#D8FBF1" stopOpacity="0.16" />
          <Stop offset="100%" stopColor="#D8FBF1" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path
        d={`M ${width * 0.58} ${-height * 0.08} C ${width * 0.46} ${height * 0.18} ${width * 0.58} ${height * 0.34} ${width * 0.44} ${height * 0.55} C ${width * 0.34} ${height * 0.70} ${width * 0.42} ${height * 0.88} ${width * 0.30} ${height * 1.08}`}
        fill="none"
        opacity={0.34}
        stroke="url(#strand)"
        strokeLinecap="round"
        strokeWidth={34}
      />
      <Path
        d={`M ${width * 0.94} ${-height * 0.02} C ${width * 0.78} ${height * 0.16} ${width * 0.90} ${height * 0.34} ${width * 0.78} ${height * 0.50}`}
        fill="none"
        opacity={0.22}
        stroke="url(#strand)"
        strokeLinecap="round"
        strokeWidth={22}
      />
      <Path
        d={`M ${width * 0.90} ${height * 0.06} C ${width * 0.84} ${height * 0.17} ${width * 0.94} ${height * 0.24} ${width * 0.82} ${height * 0.34}`}
        fill="none"
        opacity={0.30}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <Path
        d={`M ${width * 0.78} ${height * 0.14} C ${width * 0.66} ${height * 0.22} ${width * 0.70} ${height * 0.31} ${width * 0.57} ${height * 0.39}`}
        fill="none"
        opacity={0.22}
        stroke="#79DFC9"
        strokeLinecap="round"
        strokeWidth={1.4}
      />
      <Path
        d={`M ${width * 0.78} ${height * 0.06} a 20 20 0 1 0 0.1 0`}
        fill="url(#pearlGlow)"
      />
    </Svg>
  );
}

export default LiquidGlassBackdrop;
