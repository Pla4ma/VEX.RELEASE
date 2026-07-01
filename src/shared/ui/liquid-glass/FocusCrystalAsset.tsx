import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { liquidGlassAssetSize } from './liquidGlassTokens';

type FocusCrystalAssetProps = {
  tone?: 'teal' | 'amber';
  size?: keyof typeof liquidGlassAssetSize;
};

export function FocusCrystalAsset({
  tone = 'teal',
  size = 'md',
}: FocusCrystalAssetProps): React.JSX.Element {
  const width = liquidGlassAssetSize[size];
  const accent = tone === 'amber' ? '#FF8B2A' : '#12BFA0';
  const deep = tone === 'amber' ? '#9E4B16' : '#0C765F';

  return (
    <Svg
      width={width}
      height={width}
      viewBox="0 0 96 96"
      accessibilityRole="image"
      accessibilityLabel="Prismatic focus crystal"
    >
      <Defs>
        <LinearGradient id="shell" x1="12" y1="10" x2="84" y2="86">
          <Stop offset="0" stopColor="theme.glassColors.vexWhite" stopOpacity="0.96" />
          <Stop offset="0.48" stopColor={accent} stopOpacity="0.34" />
          <Stop offset="1" stopColor="theme.glassColors.vexWhite" stopOpacity="0.74" />
        </LinearGradient>
        <LinearGradient id="core" x1="24" y1="18" x2="72" y2="78">
          <Stop offset="0" stopColor="theme.glassColors.vexWhite" stopOpacity="0.88" />
          <Stop offset="0.56" stopColor={accent} stopOpacity="0.42" />
          <Stop offset="1" stopColor={deep} stopOpacity="0.72" />
        </LinearGradient>
      </Defs>
      <Circle cx="48" cy="48" r="38" fill="url(#shell)" opacity="0.78" />
      <Circle cx="48" cy="48" r="30" fill="theme.glassColors.vexWhite" opacity="0.28" />
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d="M48 18 70 36 63 69 48 80 33 69 26 36 48 18Z"
          fill="url(#core)"
          stroke="theme.glassColors.vexWhite"
          strokeOpacity="0.86"
          strokeWidth="2"
        />
        <Path d="M48 18v62M26 36l37 33M70 36 33 69" stroke={deep} strokeOpacity="0.34" />
        <Path d="M38 42 48 30l10 12-10 24-10-24Z" stroke="theme.glassColors.vexWhite" strokeOpacity="0.82" strokeWidth="3" />
        <Path d="M30 31c9-10 24-14 37-4" stroke="theme.glassColors.vexWhite" strokeOpacity="0.86" strokeWidth="3" />
        <Path d="M68 56c-3 10-10 16-21 19" stroke={accent} strokeOpacity="0.66" strokeWidth="3" />
      </G>
    </Svg>
  );
}
