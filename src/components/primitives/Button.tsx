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
import {
  getButtonSizes,
  getButtonVariantStyle,
  getButtonTextColor,
} from "./button-styles";

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
  const sizes = getButtonSizes(size, theme);
  const textColor = getButtonTextColor(variant, theme);

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
          getButtonVariantStyle(variant, sizes, pressed, fullWidth, theme),
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
