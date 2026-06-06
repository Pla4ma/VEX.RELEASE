/**
 * ShimmerSweep — a pressable button with no animated shimmer.
 * Static (motion stripped for performance).
 */
import React from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { getMinTouchTargetStyle } from '@/utils/touchTarget';

type ShimmerSweepProps = {
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle | ViewStyle[];
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  children?: React.ReactNode;
};

export function ShimmerSweep({
  onPress,
  disabled = false,
  selected = false,
  style,
  height = 56,
  borderRadius = 28,
  backgroundColor = '#0A0A0A',
  borderColor,
  borderWidth = 0,
  accessibilityLabel,
  accessibilityHint,
  children,
}: ShimmerSweepProps): React.JSX.Element {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        style,
        {
          height,
          borderRadius,
          backgroundColor,
          borderColor,
          borderWidth,
          overflow: 'hidden',
          opacity: disabled ? 0.6 : pressed ? 0.94 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
