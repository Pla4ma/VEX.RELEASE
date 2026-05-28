import type { ViewStyle } from "react-native";

import type { Theme } from "../../theme/themeCoreTypes";
import type { ButtonProps } from "./Button";

interface ButtonSizeConfig {
  py: number;
  px: number;
  minHeight: number;
  fontSize: number;
}

export function getButtonSizes(
  size: NonNullable<ButtonProps["size"]>,
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
      px: theme.spacing[4],
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
  variant: NonNullable<ButtonProps["variant"]>,
  sizes: ButtonSizeConfig,
  pressed: boolean,
  fullWidth: boolean,
  theme: Theme,
): ViewStyle {
  const semantic = theme.colors.semantic;
  const base: ViewStyle = {
    alignItems: "center",
    borderRadius: theme.borderRadius.xl,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: sizes.minHeight,
    paddingHorizontal: sizes.px,
    paddingVertical: sizes.py,
    width: fullWidth ? "100%" : undefined,
  };
  if (variant === "primary") {
    return {
      ...base,
      backgroundColor: pressed ? semantic.primaryPressed : semantic.primary,
    };
  }
  if (variant === "danger") {
    return { ...base, backgroundColor: semantic.danger };
  }
  if (variant === "outline") {
    return {
      ...base,
      backgroundColor: pressed ? semantic.primarySoft : semantic.surfaceGlass,
      borderColor: semantic.borderStrong,
      borderWidth: 1,
    };
  }
  if (variant === "ghost") {
    return {
      ...base,
      backgroundColor: pressed ? semantic.surfaceGlass : "transparent",
    };
  }
  return {
    ...base,
    backgroundColor: pressed
      ? theme.colors.surface.pressed
      : theme.colors.surface.button,
    borderColor: semantic.border,
    borderWidth: 1,
  };
}

export function getButtonTextColor(
  variant: NonNullable<ButtonProps["variant"]>,
  theme: Theme,
): string {
  if (variant === "primary" || variant === "danger") {
    return theme.colors.text.inverse;
  }
  if (variant === "outline") {
    return theme.colors.primary[300];
  }
  return theme.colors.text.primary;
}
