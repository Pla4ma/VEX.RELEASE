import React from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

const svgStyle: ViewStyle = {
  left: 0,
  position: 'absolute',
  top: 0,
};

export function LiquidGlassBackdrop(): React.ReactNode {
  const { width, height } = useWindowDimensions();
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={svgStyle}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <Defs>
        <LinearGradient id="strand" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.86" />
          <Stop offset="42%" stopColor="#A9F0DD" stopOpacity="0.20" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="glassTube" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
          <Stop offset="54%" stopColor="#79DFC9" stopOpacity="0.26" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </LinearGradient>
        <RadialGradient cx="50%" cy="50%" id="pearlGlow" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.84" />
          <Stop offset="52%" stopColor="#D8FBF1" stopOpacity="0.30" />
          <Stop offset="100%" stopColor="#D8FBF1" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path
        d={`M ${-width * 0.12} ${height * 0.03} C ${width * 0.22} ${height * 0.16} ${width * 0.08} ${height * 0.34} ${width * 0.34} ${height * 0.46} C ${width * 0.62} ${height * 0.58} ${width * 0.40} ${height * 0.78} ${width * 0.84} ${height * 0.96}`}
        fill="none"
        opacity={0.76}
        stroke="url(#glassTube)"
        strokeLinecap="round"
        strokeWidth={30}
      />
      <Path
        d={`M ${width * 0.58} ${-height * 0.08} C ${width * 0.46} ${height * 0.18} ${width * 0.58} ${height * 0.34} ${width * 0.44} ${height * 0.55} C ${width * 0.34} ${height * 0.70} ${width * 0.42} ${height * 0.88} ${width * 0.30} ${height * 1.08}`}
        fill="none"
        opacity={0.68}
        stroke="url(#strand)"
        strokeLinecap="round"
        strokeWidth={52}
      />
      <Path
        d={`M ${width * 0.94} ${-height * 0.02} C ${width * 0.78} ${height * 0.16} ${width * 0.90} ${height * 0.34} ${width * 0.78} ${height * 0.50}`}
        fill="none"
        opacity={0.48}
        stroke="url(#strand)"
        strokeLinecap="round"
        strokeWidth={34}
      />
      <Path
        d={`M ${width * 0.20} ${-height * 0.10} C ${width * 0.18} ${height * 0.20} ${width * 0.24} ${height * 0.48} ${width * 0.18} ${height * 1.08}`}
        fill="none"
        opacity={0.65}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={18}
      />
      <Path
        d={`M ${width * 0.56} ${-height * 0.06} C ${width * 0.52} ${height * 0.18} ${width * 0.58} ${height * 0.40} ${width * 0.52} ${height * 0.72}`}
        fill="none"
        opacity={0.65}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={20}
      />
      <Path
        d={`M ${width * 0.64} ${-height * 0.04} C ${width * 0.62} ${height * 0.20} ${width * 0.68} ${height * 0.42} ${width * 0.62} ${height * 0.78}`}
        fill="none"
        opacity={0.65}
        stroke="#79DFC9"
        strokeLinecap="round"
        strokeWidth={12}
      />
      <Path
        d={`M ${width * 0.90} ${height * 0.06} C ${width * 0.84} ${height * 0.17} ${width * 0.94} ${height * 0.24} ${width * 0.82} ${height * 0.34}`}
        fill="none"
        opacity={0.82}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={2.6}
      />
      <Path
        d={`M ${width * 0.78} ${height * 0.14} C ${width * 0.66} ${height * 0.22} ${width * 0.70} ${height * 0.31} ${width * 0.57} ${height * 0.39}`}
        fill="none"
        opacity={0.58}
        stroke="#79DFC9"
        strokeLinecap="round"
        strokeWidth={1.8}
      />
      <Circle
        cx={width * 0.18}
        cy={height * 0.33}
        fill="url(#pearlGlow)"
        opacity={0.72}
        r={42}
      />
      <Circle
        cx={width * 0.82}
        cy={height * 0.18}
        fill="url(#pearlGlow)"
        opacity={0.58}
        r={54}
      />
      <Path
        d={`M ${width * 0.78} ${height * 0.06} a 20 20 0 1 0 0.1 0`}
        fill="url(#pearlGlow)"
      />
    </Svg>
  );
}

export default LiquidGlassBackdrop;
