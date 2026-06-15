import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '../../../theme/ThemeContext';

export type SessionGlyphName =
  | 'casual'
  | 'focused'
  | 'deep'
  | 'study'
  | 'creative'
  | 'sprint'
  | 'stake';

type SessionGlyphProps = {
  name: SessionGlyphName;
  size?: number;
};

export function SessionGlyph({
  name,
  size = 52,
}: SessionGlyphProps): React.JSX.Element {
  const { theme } = useTheme();
  const teal = theme.colors.semantic.secondary;
  const deep = theme.colors.semantic.primary;
  const amber = theme.colors.semantic.accent;
  const muted = theme.colors.semantic.border;

  const stroke = name === 'deep' || name === 'sprint' ? amber : deep;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      accessibilityRole="image"
      accessibilityLabel={`${name} session glyph`}
    >
      <Defs>
        <LinearGradient id="g" x1="10" y1="6" x2="62" y2="66">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.92" />
          <Stop offset="0.55" stopColor={teal} stopOpacity="0.22" />
          <Stop offset="1" stopColor={amber} stopOpacity="0.18" />
        </LinearGradient>
      </Defs>
      <Circle cx="36" cy="36" r="30" fill="url(#g)" stroke={muted} />
      {name === 'casual' ? (
        <Path
          d="M22 42c16 0 24-8 28-22 4 16-1 30-20 34m0-12c2 6 6 10 12 12"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'focused' ? (
        <Path
          d="M41 14 24 39h13l-5 19 18-27H36l5-17Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'deep' ? (
        <Path
          d="M36 14c8 9 13 16 13 25 0 11-7 18-13 18s-13-7-13-18c0-8 5-14 13-25Zm0 18c-5 6-7 10-7 15 0 5 3 8 7 8s7-3 7-8c0-5-2-9-7-15Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'study' ? (
        <Path
          d="M20 20h21c6 0 11 5 11 11v21H31c-6 0-11-5-11-11V20Zm11 10h12M31 40h12"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'creative' ? (
        <Path
          d="M22 47c9-21 29-26 30-10 0 9-8 17-19 14m-11-4 8 8"
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'sprint' ? (
        <Path
          d="M18 42h18L30 58l24-28H36l7-16-25 28Z"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
      {name === 'stake' ? (
        <Path
          d="M36 14 56 26v20L36 58 16 46V26l20-12Zm0 0v44M16 26l20 12 20-12"
          fill="none"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ) : null}
    </Svg>
  );
}
