import React, { useEffect, useCallback } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Box, Text } from '../primitives';
import { Icon } from '../../icons';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';
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
}
const typeIconMap: Record<ToastType, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  error: 'alert',
};
const getTypeColors = (theme: ReturnType<typeof useTheme>['theme']) => ({
  info: {
    bg: theme.colors.primary[50],
    border: theme.colors.primary[100],
    icon: theme.colors.primary[500],
  },
  success: {
    bg: launchColors.hex_dcfce7,
    border: launchColors.hex_86efac,
    icon: launchColors.hex_22c55e,
  },
  warning: {
    bg: launchColors.hex_fef3c7,
    border: launchColors.hex_fcd34d,
    icon: launchColors.hex_f59e0b,
  },
  error: {
    bg: launchColors.hex_fee2e2,
    border: launchColors.hex_fca5a5,
    icon: launchColors.hex_ef4444,
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
}) => {
  const { theme } = useTheme();
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
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    const targetY = position === 'top' ? 60 : position === 'center' ? 0 : -60;
    translateY.value = withSpring(targetY, { damping: 20, stiffness: 300 });
  }, [opacity, scale, translateY, position]);
  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: 150 });
    scale.value = withTiming(0.8, { duration: 150 });
    const targetY = position === 'top' ? -100 : position === 'bottom' ? 100 : 0;
    translateY.value = withTiming(targetY, { duration: 200 }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  }, [opacity, scale, translateY, position, onHide]);
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
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 4,
    zIndex: 2000,
  },
});
export default Toast;
