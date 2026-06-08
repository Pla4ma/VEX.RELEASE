import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBlurLayer } from './GlassBlurLayer';

export type GlassPillTone = 'neutral' | 'mint' | 'fire' | 'premium' | 'warning';

interface GlassPillSurfaceProps {
  children?: ReactNode;
  tone: GlassPillTone;
  selected?: boolean;
  height: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

interface ToneConfig {
  fill: string;
  border: string;
  highlight: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  gradientTop: string;
  gradientBottom: string;
}

const TONE_CONFIG: Record<GlassPillTone, ToneConfig> = {
  neutral: {
    fill: 'rgba(255, 255, 255, 0.74)',
    border: 'rgba(255, 255, 255, 1)',
    highlight: 'rgba(255, 255, 255, 1)',
    shadowColor: 'rgba(13, 76, 65, 0.10)',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
    gradientTop: 'rgba(255, 255, 255, 0.80)',
    gradientBottom: 'rgba(255, 255, 255, 0.46)',
  },
  mint: {
    fill: 'rgba(255, 255, 255, 0.66)',
    border: 'rgba(66, 207, 174, 0.74)',
    highlight: 'rgba(255, 255, 255, 0.96)',
    shadowColor: 'rgba(18, 184, 148, 0.28)',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    gradientTop: 'rgba(95, 230, 197, 0.36)',
    gradientBottom: 'rgba(255, 255, 255, 0.48)',
  },
  fire: {
    fill: 'rgba(240, 138, 75, 0.18)',
    border: 'rgba(240, 138, 75, 0.55)',
    highlight: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(240, 138, 75, 0.30)',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    gradientTop: 'rgba(240, 138, 75, 0.30)',
    gradientBottom: 'rgba(240, 138, 75, 0.10)',
  },
  warning: {
    fill: 'rgba(223, 164, 74, 0.18)',
    border: 'rgba(223, 164, 74, 0.55)',
    highlight: 'rgba(255, 255, 255, 0.45)',
    shadowColor: 'rgba(223, 164, 74, 0.30)',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
    gradientTop: 'rgba(223, 164, 74, 0.30)',
    gradientBottom: 'rgba(223, 164, 74, 0.10)',
  },
  premium: {
    fill: 'rgba(255, 255, 255, 0.68)',
    border: 'rgba(121, 223, 201, 0.78)',
    highlight: 'rgba(255, 255, 255, 0.98)',
    shadowColor: 'rgba(18, 184, 148, 0.28)',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 3,
    gradientTop: 'rgba(121, 223, 201, 0.38)',
    gradientBottom: 'rgba(255, 255, 255, 0.48)',
  },
};

const SELECTED_CONFIG: ToneConfig = {
  fill: 'rgba(66, 207, 174, 1.0)',
  border: 'rgba(255, 255, 255, 0.85)',
  highlight: 'rgba(255, 255, 255, 0.55)',
  shadowColor: 'rgba(18, 184, 148, 0.45)',
  shadowOpacity: 0.4,
  shadowRadius: 14,
  elevation: 6,
  gradientTop: 'rgba(95, 230, 197, 1.0)',
  gradientBottom: 'rgba(18, 184, 148, 1.0)',
};

export function GlassPillSurface({
  children,
  tone,
  selected = false,
  height,
  style,
}: GlassPillSurfaceProps): JSX.Element {
  const v = selected ? SELECTED_CONFIG : TONE_CONFIG[tone];
  return (
    <View
      style={[
        {
          backgroundColor: v.fill,
          borderColor: v.border,
          borderRadius: height / 2,
          borderWidth: 1,
          elevation: v.elevation,
          overflow: 'hidden',
          shadowColor: v.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: v.shadowOpacity,
          shadowRadius: v.shadowRadius,
        },
        style,
      ]}
    >
      <GlassBlurLayer
        intensity={selected ? 82 : 72}
        radius={height / 2}
      />
      <LinearGradient
        colors={[v.gradientTop, v.gradientBottom]}
        end={{ x: 0, y: 1 }}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <LinearGradient
        colors={[v.highlight, 'rgba(255, 255, 255, 0)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.6]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: height / 2,
          borderTopRightRadius: height / 2,
          height: '55%',
          left: 1,
          position: 'absolute',
          right: 1,
          top: 1,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderTopLeftRadius: height / 2,
          borderTopRightRadius: height / 2,
          height: 1,
          left: 8,
          position: 'absolute',
          right: 8,
          top: 1,
        }}
      />
      {children}
    </View>
  );
}

export default GlassPillSurface;
