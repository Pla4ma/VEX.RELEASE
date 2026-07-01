import React, { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { NativeGlassSurface } from './native/NativeGlassSurface';

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
  tint: string;
  border: string;
}

const TONE_CONFIG: Record<GlassPillTone, ToneConfig> = {
  neutral: { tint: 'transparent', border: 'rgba(255, 255, 255, 0.18)' },
  mint: { tint: 'rgba(66, 207, 174, 0.10)', border: 'rgba(66, 207, 174, 0.22)' },
  fire: { tint: 'rgba(240, 138, 75, 0.10)', border: 'rgba(240, 138, 75, 0.22)' },
  warning: { tint: 'rgba(223, 164, 74, 0.10)', border: 'rgba(223, 164, 74, 0.22)' },
  premium: { tint: 'rgba(121, 223, 201, 0.10)', border: 'rgba(121, 223, 201, 0.22)' },
};

const SELECTED_CONFIG: ToneConfig = {
  tint: 'rgba(66, 207, 174, 0.14)',
  border: 'rgba(255, 255, 255, 0.30)',
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

  return (
    <NativeGlassSurface
      variant={selected ? 'pill' : 'subtle'}
      radius={height / 2}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      style={[
        {
          borderColor: v.border,
          borderWidth: selected ? 0.8 : 0.5,
          height,
        },
        style,
      ]}
    >
      {children}
    </NativeGlassSurface>
  );
}
