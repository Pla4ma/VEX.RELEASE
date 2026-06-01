import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { progressStepsStyles as styles } from './progress-steps-styles';
import type { StepIndicatorProps } from './progress-steps-types';

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  status,
  index,
  size = 'md',
  variant = 'default',
  icon,
  title,
  description,
  showDescription = true,
  onPress,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const progress = useSharedValue(
    status === 'completed' ? 1 : status === 'active' ? 0.5 : 0,
  );
  React.useEffect(() => {
    progress.value = withSpring(
      status === 'completed' ? 1 : status === 'active' ? 0.5 : 0,
      { damping: 15, stiffness: 150 },
    );
  }, [status, progress]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.5, 1],
          [1, 1.1, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));
  const sizeConfig = {
    sm: { width: 24, fontSize: 12, iconSize: 'sm' as const },
    md: { width: 32, fontSize: 14, iconSize: 'md' as const },
    lg: { width: 40, fontSize: 16, iconSize: 'lg' as const },
  };
  const { width, fontSize, iconSize } = sizeConfig[size];
  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          background: theme.colors.success.DEFAULT,
          border: theme.colors.success.DEFAULT,
          text: theme.colors.text.inverse,
        };
      case 'active':
        return {
          background: theme.colors.primary[500],
          border: theme.colors.primary[500],
          text: theme.colors.text.inverse,
        };
      case 'error':
        return {
          background: theme.colors.error[50],
          border: theme.colors.error.DEFAULT,
          text: theme.colors.error.DEFAULT,
        };
      case 'disabled':
        return {
          background: theme.colors.surface.button,
          border: theme.colors.border.DEFAULT,
          text: theme.colors.text.disabled,
        };
      case 'pending':
      default:
        return {
          background: 'transparent',
          border: theme.colors.border.DEFAULT,
          text: theme.colors.text.tertiary,
        };
    }
  };
  const colors = getStatusColors();
  const renderContent = () => {
    if (status === 'completed') {
      return (
        <Icon
          name={icon || 'check'}
          size={iconSize}
          color={theme.colors.text.inverse}
        />
      );
    }
    if (status === 'error') {
      return (
        <Text style={[styles.stepNumber, { fontSize, color: colors.text }]}>
          !
        </Text>
      );
    }
    if (status === 'active' && variant === 'numbers') {
      return (
        <Text style={[styles.stepNumber, { fontSize, color: colors.text }]}>
          {index + 1}
        </Text>
      );
    }
    if (variant === 'dots') {
      return null;
    }
    return (
      <Text style={[styles.stepNumber, { fontSize, color: colors.text }]}>
        {index + 1}
      </Text>
    );
  };
  const indicatorContent = (
    <Animated.View
      style={[
        styles.indicator,
        {
          width,
          height: width,
          borderRadius: width / 2,
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
        variant === 'dots' && status === 'pending' && styles.dotIndicator,
        animatedStyle,
      ]}
    >
      {' '}
      {renderContent()}{' '}
    </Animated.View>
  );
  if (variant === 'dots' && !title) {
    return indicatorContent;
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={styles.stepContainer}
      accessibilityLabel="Step indicator"
      accessibilityRole="button"
      accessibilityHint="Double tap to activate"
    >
      {' '}
      {indicatorContent}
      {(title || (description && showDescription)) && (
        <View style={styles.stepTextContainer}>
          {' '}
          {title && (
            <Text
              variant="body"
              style={[
                styles.stepTitle,
                {
                  color:
                    status === 'active'
                      ? theme.colors.text.primary
                      : status === 'disabled' || status === 'pending'
                        ? theme.colors.text.tertiary
                        : theme.colors.text.secondary,
                },
              ]}
            >
              {' '}
              {title}{' '}
            </Text>
          )}{' '}
          {description && showDescription && (
            <Text
              variant="caption"
              color={status === 'error' ? 'error.DEFAULT' : 'text.tertiary'}
              style={styles.stepDescription}
            >
              {' '}
              {description}{' '}
            </Text>
          )}{' '}
        </View>
      )}{' '}
    </Pressable>
  );
};
