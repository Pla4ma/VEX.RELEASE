/**
 * Modal Component
 *
 * Full-screen modal with animations and gesture support.
 */

import React, { useEffect, useCallback, type ReactNode } from "react";
import { View, StyleSheet, TouchableWithoutFeedback, BackHandler, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, type SharedValue } from "react-native-reanimated";

import { useTheme } from "../../theme";
import { Box, Text } from "../primitives";
import { IconButton } from "../../icons";
import { createSheet } from "@/shared/ui/create-sheet";

/**
 * Modal props
 */
export interface ModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Modal content */
  children: ReactNode;
  /** Modal title */
  title?: string;
  /** Called when modal should close */
  onClose: () => void;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to close on backdrop press */
  closeOnBackdropPress?: boolean;
  /** Whether to close on back button (Android) */
  closeOnBackButton?: boolean;
  /** Custom header content */
  header?: ReactNode;
  /** Custom footer content */
  footer?: ReactNode;
  /** Modal animation type */
  animation?: "fade" | "slide" | "scale";
  /** Custom styles */
  style?: ViewStyle;
  /** Content container style */
  contentStyle?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Modal component
 */
export const Modal: React.FC<ModalProps> = ({ visible, children, title, onClose, showCloseButton = true, closeOnBackdropPress = true, closeOnBackButton = true, header, footer, animation = "slide", style, contentStyle, testID }) => {
  const { theme } = useTheme();

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(500);
  const scale = useSharedValue(0.9);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    switch (animation) {
      case "fade":
        return { opacity: opacity.value };
      case "scale":
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }],
        };
      case "slide":
      default:
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }],
        };
    }
  });

  // Open animation
  const open = useCallback(() => {
    opacity.value = withTiming(1, { duration: 200 });

    switch (animation) {
      case "scale":
        scale.value = withSpring(1, { damping: 20, stiffness: 200 });
        break;
      case "slide":
      default:
        translateY.value = withSpring(0, { damping: 25, stiffness: 300 });
        break;
    }
  }, [animation, opacity, scale, translateY]);

  // Close animation
  const close = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onClose)();
    });

    switch (animation) {
      case "scale":
        scale.value = withTiming(0.9, { duration: 150 });
        break;
      case "slide":
      default:
        translateY.value = withTiming(500, { duration: 200 });
        break;
    }
  }, [animation, onClose, opacity, scale, translateY]);

  // Handle visibility change
  useEffect(() => {
    if (visible) {
      open();
    }
  }, [visible, open]);

  // Handle Android back button
  useEffect(() => {
    if (!visible || !closeOnBackButton) {
      return;
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, closeOnBackButton, close]);

  // Handle backdrop press
  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdropPress) {
      close();
    }
  }, [closeOnBackdropPress, close]);

  // Handle close button press
  const handleClosePress = useCallback(() => {
    close();
  }, [close]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.5)" }, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.lg,
          },
          contentAnimatedStyle,
          style,
        ]}
      >
        {/* Header */}
        {(title || showCloseButton || header) && (
          <View style={styles.header}>
            {header || (
              <>
                <Box flex={1}>{title && <Text variant="h3">{title}</Text>}</Box>
                {showCloseButton && <IconButton name="close" size="md" onPress={handleClosePress} testID={`${testID}-close`} />}
              </>
            )}
          </View>
        )}

        {/* Body */}
        <View style={styles.body}>{children}</View>

        {/* Footer */}
        {footer && <View style={styles.footer}>{footer}</View>}
      </Animated.View>
    </View>
  );
};

const styles = createSheet({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  body: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
});

export default Modal;
