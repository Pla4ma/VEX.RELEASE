/**
 * AnimatedVexMark — the VEX brand mark as a static SVG.
 * Motion stripped for performance.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const MARK_PATH = 'M 20 8 L 50 92 L 80 8';
const WING_PATH = 'M 50 8 C 58 18, 64 28, 50 32';

type AnimatedVexMarkProps = {
  size?: number;
  startDelayMs?: number;
};

export function AnimatedVexMark({
  size = 120,
  startDelayMs: _startDelayMs = 500,
}: AnimatedVexMarkProps): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg height={size} viewBox="0 0 100 100" width={size}>
        <Path
          d={MARK_PATH}
          stroke="#0A0A0A"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={6}
        />
        <Path
          d={WING_PATH}
          stroke="#0A0A0A"
          strokeLinecap="round"
          strokeWidth={3}
        />
      </Svg>
    </View>
  );
}
