import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { ref } from './referenceTokens';

export function ReferenceChart(): React.ReactNode {
  return (
    <Svg height={56} viewBox="0 0 260 56" width="100%">
      <Defs>
        <LinearGradient id="referenceChartFill" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={ref.mint} stopOpacity="0.24" />
          <Stop offset="1" stopColor={ref.mint} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M0 38 C20 31 28 25 44 28 C61 31 67 17 88 19 C110 22 118 39 137 33 C156 27 160 11 181 15 C199 19 197 39 216 31 C232 25 238 34 260 36 L260 56 L0 56 Z"
        fill="url(#referenceChartFill)"
      />
      <Path
        d="M0 38 C20 31 28 25 44 28 C61 31 67 17 88 19 C110 22 118 39 137 33 C156 27 160 11 181 15 C199 19 197 39 216 31 C232 25 238 34 260 36"
        fill="none"
        stroke={ref.mint}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M0 48 C44 41 76 45 116 41 C154 37 202 45 260 42"
        fill="none"
        opacity={0.36}
        stroke={ref.mint}
        strokeLinecap="round"
        strokeWidth={4}
      />
    </Svg>
  );
}
