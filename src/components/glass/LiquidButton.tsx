import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { springPresets } from '../../theme/tokens/motion';
import { useTheme } from '../../theme/ThemeContext';
import { buttonTap, triggerHaptic } from '../../utils/haptics';
import { Text } from '../primitives/Text';
import { LIQUID_SIZE, type LiquidButtonSize, type LiquidButtonVariant } from './LiquidButton.tokens';

export type { LiquidButtonSize, LiquidButtonVariant };

interface LiquidButtonProps {
  label: string;
  onPress: () => void;
  subLabel?: string;
  variant?: LiquidButtonVariant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  size?: LiquidButtonSize;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

function isFilledVariant(variant: LiquidButtonVariant): boolean {
  return variant === 'primary' || variant === 'fire' || variant === 'ocean' || variant === 'secondary';
}

export function LiquidButton({
  label,
  onPress,
  subLabel,
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: LiquidButtonProps): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const sizeToken = LIQUID_SIZE[size];
  const filled = isFilledVariant(variant);
  const backgroundColor =
    variant === 'ocean' || variant === 'secondary'
      ? theme.colors.semantic.secondary
      : variant === 'outline' || variant === 'ghost'
        ? 'transparent'
        : theme.colors.semantic.primary;
  const foregroundColor = filled
    ? theme.colors.semantic.liquidButtonText
    : variant === 'ghost'
      ? theme.colors.text.secondary
      : theme.colors.semantic.secondary;

  const onPressIn = (): void => {
    buttonTap();
    if (!isReducedMotion) {
      scale.value = withSpring(0.98, springPresets.tactile);
    }
  };
  const onPressOut = (): void => {
    if (!isReducedMotion) {
      scale.value = withSpring(1, springPresets.settle);
    }
  };
  const onActualPress = (): void => {
    if (!disabled) {
      triggerHaptic('impactLight');
      onPress();
    }
  };

  return (
    <Animated.View
      style={[{ width: fullWidth ? '100%' : undefined }, animatedStyle]}
    >
      <Pressable
        accessibilityHint={accessibilityHint ?? `Activates ${label}`}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onActualPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID={testID}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: pressed && !disabled ? theme.colors.surface.pressed : backgroundColor,
          borderColor:
            variant === 'outline'
              ? theme.colors.semantic.secondary
              : filled
                ? backgroundColor
                : theme.colors.border.DEFAULT,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          flexDirection: 'row',
          gap: theme.spacing[2],
          justifyContent: 'center',
          minHeight: Math.max(sizeToken.minHeight, 44),
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: sizeToken.paddingH,
          paddingVertical: sizeToken.paddingV,
        })}
      >
        {leftIcon}
        <Text
          style={{
            color: foregroundColor,
            fontSize: sizeToken.fontSize,
            fontWeight: theme.fontWeights.bold,
          }}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text style={{ color: foregroundColor, fontSize: theme.typography.ui.caption.fontSize, opacity: 0.78 }}>
            {subLabel}
          </Text>
        ) : null}
        {rightIcon}
      </Pressable>
    </Animated.View>
  );
}
