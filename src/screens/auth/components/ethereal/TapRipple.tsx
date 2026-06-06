/**
 * TapRipple — a pressable button with no animated ripple.
 * Static (motion stripped for performance).
 */
import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { getMinTouchTargetStyle } from '@/utils/touchTarget';

type TapRippleProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  rippleColor?: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  children?: React.ReactNode;
};

export function TapRipple({
  onPress,
  disabled = false,
  style,
  height = 56,
  borderRadius = 28,
  backgroundColor = '#0A0A0A',
  rippleColor: _rippleColor = 'rgba(255, 255, 255, 0.55)',
  accessibilityLabel,
  accessibilityHint,
  children,
}: TapRippleProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        style,
        {
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
          opacity: disabled ? 0.6 : pressed ? 0.94 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
