import { useCallback, useEffect } from 'react';
import {
  BackHandler,
  type ViewStyle,
} from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type AnimationType = 'fade' | 'slide' | 'scale';

interface UseModalAnimationOptions {
  visible: boolean;
  animation: AnimationType;
  onClose: () => void;
  closeOnBackButton: boolean;
}

const fadeStyle: ViewStyle = {
  opacity: 0,
};

const scaleStyle: ViewStyle = {
  opacity: 0,
  transform: [{ scale: 0.9 }],
};

const slideStyle: ViewStyle = {
  opacity: 0,
  transform: [{ translateY: 500 }],
};

export function useModalAnimation({
  visible,
  animation,
  onClose,
  closeOnBackButton,
}: UseModalAnimationOptions) {
  const { isReducedMotion } = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(500);
  const scale = useSharedValue(0.9);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    switch (animation) {
      case 'fade':
        return { opacity: opacity.value };
      case 'scale':
        return { opacity: opacity.value, transform: [{ scale: scale.value }] };
      case 'slide':
      default:
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }],
        };
    }
  });

  const open = useCallback(() => {
    if (isReducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withTiming(1, { duration: 200 });
    switch (animation) {
      case 'scale':
        scale.value = withSpring(1, { damping: 20, stiffness: 200 });
        break;
      case 'slide':
      default:
        translateY.value = withSpring(0, { damping: 25, stiffness: 300 });
        break;
    }
  }, [animation, isReducedMotion, opacity, scale, translateY]);

  const close = useCallback(() => {
    if (isReducedMotion) {
      opacity.value = 0;
      scale.value = 0.9;
      translateY.value = 500;
      runOnJS(onClose)();
      return;
    }
    opacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onClose)();
    });
    switch (animation) {
      case 'scale':
        scale.value = withTiming(0.9, { duration: 150 });
        break;
      case 'slide':
      default:
        translateY.value = withTiming(500, { duration: 200 });
        break;
    }
  }, [animation, isReducedMotion, onClose, opacity, scale, translateY]);

  useEffect(() => {
    if (visible) {
      open();
    }
  }, [visible, open]);

  useEffect(() => {
    if (!visible || !closeOnBackButton) {
      return;
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        close();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [visible, closeOnBackButton, close]);

  return { backdropStyle, contentAnimatedStyle };
}
