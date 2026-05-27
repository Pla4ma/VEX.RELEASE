import React, { type ReactNode, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme";
import { buttonTap, triggerHaptic } from "../../utils/haptics";
import { Text } from "./Text";
import type { SpacingValue } from "./types";
import { resolveSpacingValue } from "./theme-values";

export interface ButtonProps extends Omit<
  PressableProps,
  "style" | "disabled"
> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "small";
  fullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: "none" | "light" | "medium" | "success" | "warning";
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  mt?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mr?: SpacingValue;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  isDisabled = false,
  disabled = false,
  leftIcon,
  rightIcon,
  haptic = "medium",
  children,
  style,
  mt,
  mb,
  ml,
  mr,
  ...props
}: ButtonProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);
  const isUnavailable = isDisabled || disabled || isLoading;
  const label = typeof children === "string" ? children : "Action";
  const sizes = {
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

  const variantStyle = (pressed: boolean): ViewStyle => {
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
  };

  const textColor =
    variant === "primary" || variant === "danger"
      ? theme.colors.text.inverse
      : variant === "outline"
        ? theme.colors.primary[300]
        : theme.colors.text.primary;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = isReducedMotion
        ? 1
        : withSpring(0.98, { damping: 16, stiffness: 420 });
      if (haptic !== "none") {
        void buttonTap();
      }
      props.onPressIn?.(event);
    },
    [haptic, isReducedMotion, props, scale],
  );

  const onPressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = isReducedMotion
        ? 1
        : withSpring(1, { damping: 14, stiffness: 260 });
      props.onPressOut?.(event);
    },
    [isReducedMotion, props, scale],
  );

  const onPress = useCallback(
    (event: GestureResponderEvent) => {
      if (haptic !== "none") {
        void triggerHaptic(
          haptic === "success"
            ? "success"
            : haptic === "warning"
              ? "warning"
              : "impactLight",
        );
      }
      props.onPress?.(event);
    },
    [haptic, props],
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityHint={props.accessibilityHint ?? `Activates ${label}`}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled: isUnavailable, busy: isLoading }}
        {...props}
        disabled={isUnavailable}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          variantStyle(pressed),
          { opacity: isUnavailable ? 0.62 : pressed ? 0.9 : 1 },
          {
            marginTop: resolveSpacingValue(mt, theme),
            marginBottom: resolveSpacingValue(mb, theme),
            marginLeft: resolveSpacingValue(ml, theme),
            marginRight: resolveSpacingValue(mr, theme),
          },
          style,
        ]}
      >
        {isLoading ? <ActivityIndicator color={textColor} /> : leftIcon}
        {!isLoading && typeof children === "string" ? (
          <Text
            color={textColor}
            fontSize={sizes.fontSize}
            fontWeight="700"
            ml={leftIcon ? "sm" : undefined}
            mr={rightIcon ? "sm" : undefined}
            variant="button"
          >
            {children}
          </Text>
        ) : isLoading ? null : (
          children
        )}
        {!isLoading ? rightIcon : null}
      </Pressable>
    </Animated.View>
  );
}
