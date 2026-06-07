import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface LiquidGlassObjectProps {
  size?: number;
  style?: ViewStyle;
  variant?: 'swirl' | 'orb';
}

export function LiquidGlassObject({
  size = 96,
  style,
  variant = 'orb',
}: LiquidGlassObjectProps): JSX.Element {
  const isSwirl = variant === 'swirl';

  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: size,
          shadowColor: 'rgba(13, 76, 65, 0.22)',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.34,
          shadowRadius: 18,
          width: size,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox="0 0 100 100" width={size}>
        <Defs>
          <RadialGradient cx="34%" cy="26%" id="liquidCore" r="72%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
            <Stop offset="34%" stopColor="#D9FFF7" stopOpacity="0.78" />
            <Stop offset="70%" stopColor="#79DFC9" stopOpacity="0.32" />
            <Stop offset="100%" stopColor="#0C765F" stopOpacity="0.10" />
          </RadialGradient>
          <LinearGradient id="edgeShine" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#42CFAE" stopOpacity="0.42" />
          </LinearGradient>
        </Defs>
        {isSwirl ? (
          <Path
            d="M 55 6 C 82 8 95 30 86 50 C 78 69 56 76 39 90 C 30 98 16 91 22 78 C 29 62 50 58 58 44 C 64 33 54 28 39 37 C 25 45 8 38 13 24 C 18 10 35 3 55 6 Z"
            fill="url(#liquidCore)"
            stroke="url(#edgeShine)"
            strokeWidth="1.6"
          />
        ) : (
          <Circle
            cx="50"
            cy="50"
            fill="url(#liquidCore)"
            r="39"
            stroke="url(#edgeShine)"
            strokeWidth="1.5"
          />
        )}
        <Path
          d={isSwirl
            ? 'M 32 22 C 48 9 70 15 78 32'
            : 'M 28 29 C 40 15 65 15 77 31'}
          fill="none"
          opacity="0.82"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Path
          d={isSwirl
            ? 'M 28 75 C 46 66 64 60 75 43'
            : 'M 26 67 C 42 76 63 73 75 59'}
          fill="none"
          opacity="0.44"
          stroke="#42CFAE"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
        <Circle cx="35" cy="25" fill="#FFFFFF" opacity="0.90" r="4" />
      </Svg>
    </View>
  );
}

export default LiquidGlassObject;
