import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

interface GlassTextureOverlayProps {
  radius: number;
  intensity?: 'quiet' | 'normal' | 'hero';
}

const OPACITY = {
  quiet: 0.18,
  normal: 0.28,
  hero: 0.42,
} as const;

export function GlassTextureOverlay({
  radius,
  intensity = 'normal',
}: GlassTextureOverlayProps): React.ReactNode {
  const opacity = OPACITY[intensity];

  return (
    <View
      pointerEvents="none"
      style={{
        borderRadius: radius,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      <LinearGradient
        colors={[
          `rgba(255,255,255,${opacity + 0.18})`,
          'rgba(255,255,255,0)',
          `rgba(114,224,197,${opacity * 0.72})`,
        ]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.54, 1]}
        start={{ x: 0, y: 0 }}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <Svg
        height="100%"
        preserveAspectRatio="none"
        style={{ opacity: opacity * 0.72 }}
        viewBox="0 0 100 100"
        width="100%"
      >
        <Defs>
          <SvgGradient id="glassLine" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="42%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#79DFC9" stopOpacity="0" />
          </SvgGradient>
        </Defs>
        <Path
          d="M -10 76 C 24 48 42 72 72 46 C 88 32 104 37 114 26"
          fill="none"
          stroke="url(#glassLine)"
          strokeLinecap="round"
          strokeWidth="2.6"
        />
        <Path
          d="M -14 18 C 18 6 45 26 74 13 C 92 5 105 8 116 -2"
          fill="none"
          stroke="rgba(255,255,255,0.82)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Path
          d="M 18 102 C 38 84 56 88 73 74 C 91 60 96 43 116 38"
          fill="none"
          stroke="rgba(95,230,197,0.58)"
          strokeLinecap="round"
          strokeWidth="2.7"
        />
        <Path
          d="M -8 84 C 24 62 47 82 77 62 C 94 50 105 53 114 44"
          fill="none"
          stroke="rgba(114,224,197,0.66)"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <Path
          d="M 4 42 C 28 33 48 45 67 32 C 82 22 95 25 108 18"
          fill="none"
          stroke="rgba(255,255,255,0.56)"
          strokeLinecap="round"
          strokeWidth="3.3"
        />
      </Svg>
    </View>
  );
}

export { GlassTextureOverlay }