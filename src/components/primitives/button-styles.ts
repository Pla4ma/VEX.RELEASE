import type { ViewStyle } from 'react-native';

import type { Theme } from '../../theme/themeCoreTypes';
import type { ButtonProps } from './Button';


interface ButtonSizeConfig {
  py: number;
  px: number;
  minHeight: number;
  fontSize: number;
}

export function getButtonSizes(
  size: NonNullable<ButtonProps['size']>,
  theme: Theme,
): ButtonSizeConfig {
  return {
    sm: {
      py: theme.spacing[2],
      px: theme.spacing[3],
      minHeight: 44,
      fontSize: 14,
    },
    small: {
      py: theme.spacing[2],
      px: theme.spacing[3],
      minHeight: 44,
      fontSize: 14,
    },
    md: {
      py: theme.spacing[3],
      px: theme.spacing[5],
      minHeight: 48,
      fontSize: 16,
    },
    lg: {
      py: theme.spacing[4],
      px: theme.spacing[6],
      minHeight: 56,
      fontSize: 17,
    },
  }[size];
}

export function getButtonVariantStyle(
  variant: NonNullable<ButtonProps['variant']>,
  sizes: ButtonSizeConfig,
  pressed: boolean,
  fullWidth: boolean,
  theme: Theme,
): ViewStyle {
  const base: ViewStyle = {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: sizes.minHeight,
    paddingHorizontal: sizes.px,
    paddingVertical: sizes.py,
    width: fullWidth ? '100%' : undefined,
  };
  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: pressed ? theme.colors.primary[600] : theme.colors.primary[500],
      borderColor: theme.colors.primary[400],
      borderWidth: 1,
    };
  }
  if (variant === 'danger') {
    return {
      ...base,
      backgroundColor: pressed ? theme.colors.error.dark : theme.colors.error.DEFAULT,
      borderColor: theme.colors.error.light,
      borderWidth: 1,
    };
  }
  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: pressed ? theme.colors.surface.pressed : 'transparent',
      borderColor: theme.colors.border.strong,
      borderWidth: 1,
    };
  }
  if (variant === 'ghost') {
    return {
      ...base,
      backgroundColor: pressed ? theme.colors.surface.hover : 'transparent',
      borderColor: theme.colors.border.light,
      borderWidth: 1,
    };
  }
  if (variant === 'premium') {
    return {
      ...base,
      backgroundColor: theme.colors.accent.purple,
      borderColor: theme.colors.accent.purple,
      borderWidth: 1,
    };
  }
  return {
    ...base,
    backgroundColor: pressed ? theme.colors.surface.pressed : theme.colors.surface.button,
    borderColor: theme.colors.border.DEFAULT,
    borderWidth: 1,
  };
}

export function getButtonTextColor(
  variant: NonNullable<ButtonProps['variant']>,
  theme: Theme,
): string {
  if (variant === 'primary' || variant === 'danger') {
    return theme.colors.text.inverse;
  }
  if (variant === 'premium') {
    return theme.colors.text.inverse;
  }
  if (variant === 'outline') {
    return theme.colors.accent.purple;
  }
  return theme.colors.text.primary;
}
