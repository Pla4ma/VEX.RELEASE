import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '../primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { GlassPillSurface, type GlassPillTone } from './GlassPillSurface';

export type GlassPillVariant =
  | 'neutral'
  | 'mint'
  | 'warning'
  | 'success'
  | 'fire'
  | 'premium';

interface GlassPillProps {
  label: string;
  selected?: boolean;
  variant?: GlassPillVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const SIZE_DIM: Record<'sm' | 'md' | 'lg', { height: number; padH: number; fontSize: number; }> = {
  sm: { height: 28, padH: 12, fontSize: 11 },
  md: { height: 32, padH: 14, fontSize: 12 },
  lg: { height: 36, padH: 16, fontSize: 14 },
};

const TONE_FOR: Record<GlassPillVariant, GlassPillTone> = {
  neutral: 'neutral',
  mint: 'mint',
  success: 'mint',
  warning: 'warning',
  fire: 'fire',
  premium: 'premium',
};

const TEXT_COLOR_FOR: Record<GlassPillVariant, string> = {
  neutral: vexLightGlass.text.primary,
  mint: vexLightGlass.mint[700],
  success: vexLightGlass.mint[700],
  warning: vexLightGlass.semantic.warning,
  fire: vexLightGlass.semantic.fire,
  premium: vexLightGlass.semantic.premium,
};

const SELECTED_TEXT_COLOR = vexLightGlass.text.inverse;

export const GlassPill: React.FC<GlassPillProps> = React.memo(function GlassPill({
  label,
  selected = false,
  variant = 'neutral',
  leftIcon,
  rightIcon,
  size = 'sm',
  testID,
  accessibilityLabel,
  accessibilityHint,
}: GlassPillProps): React.ReactNode {
  const dim = SIZE_DIM[size];
  const tone = TONE_FOR[variant];
  const textColor = selected ? SELECTED_TEXT_COLOR : TEXT_COLOR_FOR[variant];

  return (
    <GlassPillSurface
      height={dim.height}
      selected={selected}
      style={{ alignSelf: 'flex-start' }}
      testID={testID}
      tone={tone}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: dim.padH,
          paddingVertical: 0,
        }}
      >
        {leftIcon}
        <Text
          style={{
            color: textColor,
            fontSize: dim.fontSize,
            fontWeight: '800',
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
        {rightIcon}
      </View>
    </GlassPillSurface>
  );
});

export { GlassPill }