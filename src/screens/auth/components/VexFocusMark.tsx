import React from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface VexFocusMarkProps {
  size?: number;
}

export function VexFocusMark({ size = 120 }: VexFocusMarkProps): JSX.Element {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const isWeb = Platform.OS === 'web';

  const MarkSvg = (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <LinearGradient id="vm-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#22D3EE" stopOpacity="0.15" />
        </LinearGradient>
        <LinearGradient id="vm-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00E5FF" />
          <Stop offset="100%" stopColor="#38BDF8" />
        </LinearGradient>
        <LinearGradient id="vm-inner" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
        </LinearGradient>
      </Defs>

      {/* Outer glow ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={s * 0.46}
        stroke="url(#vm-outer)"
        strokeWidth={1}
        fill="none"
        opacity={0.5}
      />

      {/* Main ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={s * 0.38}
        stroke="url(#vm-core)"
        strokeWidth={1.5}
        fill="none"
      />

      {/* Shield/V shape */}
      <Path
        d={`
          M ${cx} ${cy - s * 0.24}
          L ${cx - s * 0.2} ${cy - s * 0.05}
          L ${cx - s * 0.1} ${cy + s * 0.18}
          L ${cx} ${cy + s * 0.1}
          L ${cx + s * 0.1} ${cy + s * 0.18}
          L ${cx + s * 0.2} ${cy - s * 0.05}
          Z
        `}
        fill="url(#vm-core)"
        stroke="#00E5FF"
        strokeWidth={1}
        strokeLinejoin="round"
      />

      {/* Inner dot */}
      <Circle
        cx={cx}
        cy={cy + s * 0.04}
        r={s * 0.055}
        fill="#F8FAFC"
      />

      {/* Inner glow */}
      <Circle
        cx={cx}
        cy={cy + s * 0.04}
        r={s * 0.1}
        fill="url(#vm-inner)"
        opacity={0.3}
      />
    </Svg>
  );

  return (
    <View
      style={{
        width: s,
        height: s,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isWeb ? 0.25 : 0.35,
        shadowRadius: isWeb ? 16 : 20,
      }}
      accessibilityLabel="VEX focus mark"
    >
      {MarkSvg}
    </View>
  );
}

export default VexFocusMark;
