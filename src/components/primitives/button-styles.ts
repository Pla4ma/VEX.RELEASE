import type { ViewStyle } from 'react-native';

import type { Theme } from '../../theme/themeCoreTypes';
import type { ButtonProps } from './Button';

interface ButtonSizeConfig {
  py: number;
  px: number;
  minHeight: number;
  fontSize: number;
}

const LIGHT_MINT = {
  300: '#72E0C5',
  400: '#42CFAE',
  500: '#18B894',
  600: '#109779',
  700: '#0C765F',
};

const LIGHT_TEXT = {
  primary: '#10231F',
  secondary: 'rgba(16, 35, 31, 0.68)',
  inverse: '#FFFFFF',
};

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
  _theme: Theme,
): ViewStyle {
  const base: ViewStyle = {
    alignItems: 'center',
    borderRadius: 999,
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
      backgroundColor: pressed ? LIGHT_MINT[600] : LIGHT_MINT[500],
      borderColor: 'rgba(255, 255, 255, 0.55)',
      borderWidth: 1,
      shadowColor: LIGHT_MINT[600],
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.30,
      shadowRadius: 20,
      elevation: 8,
    };
  }
  if (variant === 'danger') {
    return {
      ...base,
      backgroundColor: '#E05E5E',
      borderColor: 'rgba(255, 255, 255, 0.55)',
      borderWidth: 1,
      shadowColor: '#E05E5E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 18,
      elevation: 6,
    };
  }
  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: pressed
        ? 'rgba(66, 207, 174, 0.18)'
        : 'rgba(255, 255, 255, 0.62)',
      borderColor: 'rgba(66, 207, 174, 0.55)',
      borderWidth: 1,
    };
  }
  if (variant === 'ghost') {
    return {
      ...base,
      backgroundColor: pressed ? 'rgba(255, 255, 255, 0.42)' : 'transparent',
      borderColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: 1,
    };
  }
  return {
    ...base,
    backgroundColor: pressed
      ? 'rgba(255, 255, 255, 0.78)'
      : 'rgba(255, 255, 255, 0.62)',
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    shadowColor: 'rgba(13, 76, 65, 0.20)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation: 3,
  };
}

export function getButtonTextColor(
  variant: NonNullable<ButtonProps['variant']>,
  _theme: Theme,
): string {
  if (variant === 'primary' || variant === 'danger') {
    return LIGHT_TEXT.inverse;
  }
  if (variant === 'outline') {
    return LIGHT_MINT[700];
  }
  return LIGHT_TEXT.primary;
}
