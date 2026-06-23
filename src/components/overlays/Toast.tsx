import React, { useEffect, useCallback } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../primitives/Box'
import { Text } from '../primitives/Text';
import { Icon } from '../../icons/components/Icon';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

type IconName = string;
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top' | 'bottom' | 'center';
export interface ToastProps {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  icon?: IconName;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
const typeIconMap: Record<ToastType, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  error: 'alert',
};

const getToastTranslateY = (position: ToastPosition, visible: boolean): number => {
  if (position === 'top') { return visible ? 60 : -100; }
  if (position === 'bottom') { return visible ? -60 : 100; }
  return 0;
};

const getTypeColors = (theme: ReturnType<typeof useTheme>['theme']) => ({
  info: {
    bg: theme.colors.primary[50],
    border: theme.colors.primary[100],
    icon: theme.colors.primary[500],
  },
  success: {
    bg: lightColors.success[50],
    border: lightColors.success.light,
    icon: lightColors.semantic.success,
  },
  warning: {
    bg: lightColors.warning[50],
    border: lightColors.warning.light,
    icon: lightColors.semantic.warning,
  },
  error: {
    bg: lightColors.error[50],
    border: lightColors.error.light,
    icon: lightColors.semantic.danger,
  },
});
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  position = 'top',
  visible,
  duration = 3000,
  onHide,
  icon,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const colors = getTypeColors(theme);
  const typeColors = colors[type];
  const toastIcon = icon || typeIconMap[type];
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const scale = useSharedValue(0.8);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
  const show = useCallback(() => {
    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      translateY.value = getToastTranslateY(position, true);
      return;
    }
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    const targetY = getToastTranslateY(position, true);
    translateY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
  }, [opacity, scale, translateY, position, reducedMotion]);
  const hide = useCallback(() => {
    if (reducedMotion) {
      opacity.value = 0;
      scale.value = 0.8;
      translateY.value = getToastTranslateY(position, false);
      if (onHide) {
        runOnJS(onHide)();
      }
      return;
    }
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.8, { duration: 150 });
    const targetY = getToastTranslateY(position, false);
    translateY.value = withTiming(targetY, { duration: 200 }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  }, [opacity, scale, translateY, position, onHide, reducedMotion]);
  useEffect(() => {
    if (visible) {
      show();
      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    }
    hide();
    return undefined;
  }, [visible, show, hide, duration]);
  if (!visible) {
    return null;
  }
  const positionStyle: ViewStyle = {
    position: 'absolute',
    left: 16,
    right: 16,
    ...(position === 'top' && { top: 0 }),
    ...(position === 'center' && { top: '50%', marginTop: -50 }),
    ...(position === 'bottom' && { bottom: 100 }),
  };
  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          backgroundColor: typeColors.bg,
          borderColor: typeColors.border,
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg,
        },
        animatedStyle,
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? message}
      accessibilityLiveRegion="polite"
    >
      <Box flexDirection="row" alignItems="center">
        <View style={{ marginRight: 8 }}>
          <Icon name={toastIcon} size="md" color={typeColors.icon} />
        </View>
        <Text variant="body" style={{ flex: 1 }}>
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
};
const styles = createSheet({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: `0px 2px 4px ${rgbaColors.rgb_0_0_0_0_1}`,
    elevation: 4,
    zIndex: 2000,
  },
});