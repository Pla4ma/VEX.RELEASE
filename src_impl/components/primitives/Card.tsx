/**
 * Premium Card Component
 *
 * Multi-variant card with rich states and motion support.
 */

import React, { forwardRef } from "react";
import { View, Pressable, StyleSheet, type AccessibilityRole, type AccessibilityState, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming, interpolate, useSharedValue } from "react-native-reanimated";
import { useTheme } from "../../theme";
import { createSheet } from "@/shared/ui/create-sheet";

export type CardVariant = "default" | "elevated" | "outlined" | "ghost" | "premium";
export type CardSize = "sm" | "md" | "lg";
export type CardState = "default" | "loading" | "disabled" | "error" | "success";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  state?: CardState;
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card = forwardRef<View, CardProps>(({ children, variant = "default", size = "md", state = "default", interactive = false, onPress, onLongPress, style, testID, accessibilityLabel, accessibilityHint, accessibilityRole, accessibilityState }, ref) => {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    return {
      transform: [{ scale }],
      opacity: state === "disabled" ? 0.6 : 1,
    };
  });

  const handlePressIn = () => {
    if (interactive) {
      pressed.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (interactive) {
      pressed.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
  };

  const variantStyles = {
    default: {
      backgroundColor: theme.colors.surface,
      borderWidth: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderWidth: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    outlined: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 0,
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    premium: {
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  };

  const sizeStyles = {
    sm: { padding: 12, borderRadius: 8 },
    md: { padding: 16, borderRadius: 12 },
    lg: { padding: 24, borderRadius: 16 },
  };

  const stateStyles = {
    default: {},
    loading: { opacity: 0.7 },
    disabled: { opacity: 0.5 },
    error: { borderColor: theme.colors.error, borderWidth: 2 },
    success: { borderColor: theme.colors.success, borderWidth: 2 },
  };

  const combinedStyles = [styles.base, variantStyles[variant], sizeStyles[size], stateStyles[state], style];

  if (interactive && onPress) {
    return (
      <AnimatedPressable ref={ref} style={[combinedStyles, animatedStyle]} onPress={onPress} onLongPress={onLongPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={state === "disabled"} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityRole={accessibilityRole ?? "button"} accessibilityState={{ ...accessibilityState, disabled: state === "disabled" }}>
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View ref={ref} style={combinedStyles} testID={testID} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} accessibilityRole={accessibilityRole} accessibilityState={accessibilityState}>
      {children}
    </View>
  );
});

Card.displayName = "Card";

const styles = createSheet({
  base: {
    overflow: "hidden",
  },
});

// ============================================================================
// Card Subcomponents
// ============================================================================

interface CardHeaderProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardHeader({ children, action, style }: CardHeaderProps) {
  return (
    <View style={[headerStyles.container, style]}>
      <View style={headerStyles.content}>{children}</View>
      {action && <View style={headerStyles.action}>{action}</View>}
    </View>
  );
}

const headerStyles = createSheet({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  action: {
    marginLeft: 8,
  },
});

interface CardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[footerStyles.container, style]}>{children}</View>;
}

const footerStyles = createSheet({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});

interface CardMediaProps {
  source: { uri: string } | number;
  aspectRatio?: number;
  overlay?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CardMedia({ source, aspectRatio = 16 / 9, overlay, style }: CardMediaProps) {
  return (
    <View style={[mediaStyles.container, { aspectRatio }, style]}>
      {/* Image would go here */}
      {overlay && <View style={mediaStyles.overlay}>{overlay}</View>}
    </View>
  );
}

const mediaStyles = createSheet({
  container: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
