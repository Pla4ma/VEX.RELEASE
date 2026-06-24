import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { NativeGlassSurface } from './native/NativeGlassSurface';
import { GlassBlurLayer } from './GlassBlurLayer';
export type GlassPillTone = 'neutral' | 'mint' | 'fire' | 'premium' | 'warning';

type AccessibilityRole = 'button' | 'link' | 'header' | 'image' | 'text' | 'none' | undefined;

interface GlassPillSurfaceProps {
  children?: ReactNode;
  tone: GlassPillTone;
  selected?: boolean;
  height: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityHint?: string;
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
    shadowOpacity: 0.85,
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
    shadowOpacity: 0.85,
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
    shadowOpacity: 0.85,
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
    shadowOpacity: 0.85,
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
    shadowOpacity: 0.85,
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
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
}: GlassPillSurfaceProps): React.ReactNode {
  const v = selected ? SELECTED_CONFIG : TONE_CONFIG[tone];
  if (selected) {
    return (
      <NativeGlassSurface
        variant="pill"
        radius={height / 2}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        style={[
          {
            borderColor: v.border,
            borderWidth: 1.2,
            height,
          },
          style,
        ]}
      >
        {children}
      </NativeGlassSurface>
    );
  }
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      style={[
        {
          backgroundColor: v.fill,
          borderColor: v.border,
          borderRadius: height / 2,
          borderWidth: 1.2,
          overflow: 'hidden',
          boxShadow: `0px 4px ${v.shadowRadius * 1.15}px ${v.shadowColor} / ${v.shadowOpacity * 1.3}`,
        },
        style,
      ]}
    >
      <GlassBlurLayer
        intensity={72}
        radius={height / 2}
      />
      {children}
    </View>
  );
}
