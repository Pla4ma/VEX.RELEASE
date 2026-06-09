import React from 'react';
import { createSheet } from '@/shared/ui/create-sheet';
import {
  Pressable,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';
import { StandardHitSlops } from '@/utils/touchTarget';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends PressableProps {
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const iconButtonStyles = createSheet({
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  smIconButton: { width: 32, height: 32 },
  mdIconButton: { width: 44, height: 44 },
  lgIconButton: { width: 56, height: 56 },
  primaryIconButton: { backgroundColor: lightColors.accent.teal },
  secondaryIconButton: { backgroundColor: lightColors.success[50] },
  outlineIconButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: lightColors.accent.teal,
  },
  ghostIconButton: { backgroundColor: 'transparent' },
  dangerIconButton: { backgroundColor: lightColors.semantic.danger },
});

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  ...props
}: IconButtonProps) {
  const { isReducedMotion } = useReducedMotion();
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isReducedMotion ? 1 : withSpring(1 - pressed.value * 0.05) },
    ],
  }));

  return (
    <AnimatedPressable
      accessibilityHint="Activates the coach menu"
      accessibilityLabel="Open coach menu"
      accessibilityRole="button"
      disabled={disabled || loading}
      style={[
        iconButtonStyles.iconButton,
        iconButtonStyles[`${size}IconButton`],
        iconButtonStyles[`${variant}IconButton`],
        animatedStyle,
      ]}
      hitSlop={size === 'sm' ? StandardHitSlops.ICON : undefined}
      onPressIn={() => (pressed.value = 1)}
      onPressOut={() => (pressed.value = 0)}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" /> : icon}
    </AnimatedPressable>
  );
}
