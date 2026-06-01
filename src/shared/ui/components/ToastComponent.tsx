import React, { useEffect, useRef, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  SlideInUp,
  SlideOutUp,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { styles, getToastTypeStyle } from './Toast.styles';
import type { ToastProps } from './Toast.types';

export const ToastComponent: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { theme } = useTheme();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const progress = useSharedValue(1);
  const scale = useSharedValue(1);
  const handleDismissRef = useRef<() => void>(() => undefined);
  const toastAction = toast.action;

  useEffect(() => {
    if (toast.persistent) {
      return;
    }
    const duration = toast.duration || 5000;
    progress.value = withTiming(0, { duration });
    const timer = setTimeout(() => {
      handleDismissRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [progress, toast.id, toast.duration, toast.persistent]);

  const handleDismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)(toast.id);
        toast.onDismiss?.();
      }
    });
  }, [toast, onDismiss, opacity]);

  handleDismissRef.current = handleDismiss;

  const gestureHandler = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
      opacity.value = interpolate(
        Math.abs(event.translationY),
        [0, 100],
        [1, 0.5],
        Extrapolation.CLAMP,
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationY) > 80) {
        translateY.value = withSpring(event.translationY * 2, {}, () => {
          runOnJS(handleDismiss)();
        });
      } else {
        translateY.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    });

  const typeStyles = getToastTypeStyle(
    toast.type,
    toast.icon,
    theme.colors,
  );
  const iconColor = theme.colors.text.inverse;
  const rgaOverlay = `${iconColor}33`;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const enteringAnimation = toast.position === 'top' ? SlideInUp : SlideInDown;
  const exitingAnimation = toast.position === 'top' ? SlideOutUp : SlideOutDown;

  return (
    <Animated.View
      entering={enteringAnimation.duration(300)}
      exiting={exitingAnimation.duration(200)}
      style={[
        styles.toastContainer,
        animatedStyle,
        { shadowColor: theme.colors.background.primary },
      ]}
    >
      <GestureDetector gesture={gestureHandler}>
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: typeStyles.backgroundColor },
          ]}
        >
          <View style={styles.iconContainer}>
            <Icon name={typeStyles.icon} size="md" color={iconColor} />
          </View>
          <View style={styles.content}>
            <Text variant="body" color="text.inverse" style={styles.title}>
              {toast.title}
            </Text>
            {toast.message && (
              <Text
                variant="caption"
                color="text.inverse"
                style={styles.message}
              >
                {toast.message}
              </Text>
            )}
          </View>
          {toastAction && (
            <Pressable
              onPress={() => {
                toastAction.onPress();
                handleDismiss();
              }}
              style={({ pressed }) => [
                styles.action,
                { backgroundColor: rgaOverlay },
                toastAction.variant === 'destructive' && {
                  backgroundColor: `${theme.colors.error.dark}4D`,
                },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Dismiss notification"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              <Text variant="caption" color="text.inverse">
                {toastAction.label}
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Dismiss toast"
            accessibilityRole="button"
            accessibilityHint="Dismisses this notification"
          >
            <Icon name="x" size="sm" color={iconColor} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
      {!toast.persistent && (
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: rgaOverlay },
            progressStyle,
          ]}
        />
      )}
    </Animated.View>
  );
};
