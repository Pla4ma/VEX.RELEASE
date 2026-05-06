/**
 * Progress Steps Component
 * Premium step indicator with rich visual states and animations
 *
 * Features:
 * - Horizontal and vertical layouts
 * - Step states: pending, active, completed, error
 * - Animated transitions between steps
 * - Optional step descriptions and tooltips
 * - Connector line between steps
 * - Clickable steps for navigation
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

// ============================================================================
// Types
// ============================================================================

export type StepStatus = 'pending' | 'active' | 'completed' | 'error' | 'disabled';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  status: StepStatus;
  errorMessage?: string;
  disabled?: boolean;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'numbers' | 'dots';
  showDescriptions?: boolean;
  allowClick?: boolean;
  onStepPress?: (stepIndex: number, step: Step) => void;
  style?: ViewStyle;
}

export interface StepIndicatorProps {
  status: StepStatus;
  index: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'numbers' | 'dots';
  icon?: string;
  title?: string;
  description?: string;
  showDescription?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

// ============================================================================
// Step Indicator Component
// ============================================================================

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
  const progress = useSharedValue(status === 'completed' ? 1 : status === 'active' ? 0.5 : 0);

  // Update animation when status changes
  React.useEffect(() => {
    progress.value = withSpring(
      status === 'completed' ? 1 : status === 'active' ? 0.5 : 0,
      { damping: 15, stiffness: 150 }
    );
  }, [status, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.5, 1],
          [1, 1.1, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Size configurations
  const sizeConfig = {
    sm: { width: 24, fontSize: 12, iconSize: 'sm' as const },
    md: { width: 32, fontSize: 14, iconSize: 'md' as const },
    lg: { width: 40, fontSize: 16, iconSize: 'lg' as const },
  };

  const { width, fontSize, iconSize } = sizeConfig[size];

  // Status-based colors
  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          background: theme.colors.success.DEFAULT,
          border: theme.colors.success.DEFAULT,
          text: '#FFFFFF',
        };
      case 'active':
        return {
          background: theme.colors.primary[500],
          border: theme.colors.primary[500],
          text: '#FFFFFF',
        };
      case 'error':
        return {
          background: theme.colors.error.DEFAULT,
          border: theme.colors.error.DEFAULT,
          text: '#FFFFFF',
        };
      case 'disabled':
        return {
          background: theme.colors.background.tertiary,
          border: theme.colors.border.DEFAULT,
          text: theme.colors.text.tertiary,
        };
      default:
        return {
          background: theme.colors.background.secondary,
          border: theme.colors.border.DEFAULT,
          text: theme.colors.text.secondary,
        };
    }
  };

  const colors = getStatusColors();

  // Render content based on variant and status
  const renderContent = () => {
    if (status === 'completed' && !icon) {
      return <Icon name="check" size={iconSize} color="#FFFFFF" />;
    }
    if (status === 'error') {
      return <Icon name="alert-circle" size={iconSize} color="#FFFFFF" />;
    }
    if (icon) {
      return <Icon name={icon} size={iconSize} color={colors.text} />;
    }
    if (variant === 'numbers') {
      return (
        <Text style={[styles.stepNumber, { fontSize, color: colors.text }]}>
          {index + 1}
        </Text>
      );
    }
    if (variant === 'dots') {
      return null; // Just the colored circle
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
      {renderContent()}
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

    accessibilityLabel="Interactive control"
    accessibilityRole="button"
    accessibilityHint="Activates this control">
      {indicatorContent}

      {(title || (description && showDescription)) && (
        <View style={styles.stepTextContainer}>
          {title && (
            <Text
              variant="body"
              style={[
                styles.stepTitle,
                {
                  color: status === 'active'
                    ? theme.colors.text.primary
                    : status === 'disabled' || status === 'pending'
                    ? theme.colors.text.tertiary
                    : theme.colors.text.secondary,
                },
              ]}
            >
              {title}
            </Text>
          )}
          {description && showDescription && (
            <Text
              variant="caption"
              color={status === 'error' ? 'error.DEFAULT' : 'text.tertiary'}
              style={styles.stepDescription}
            >
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

// ============================================================================
// Connector Component
// ============================================================================

const Connector: React.FC<{
  completed: boolean;
  orientation: 'horizontal' | 'vertical';
  theme: DynamicValue;
}> = ({ completed, orientation, theme }) => {
  const progress = useSharedValue(completed ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(completed ? 1 : 0, { duration: 300 });
  }, [completed, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border.DEFAULT, theme.colors.success.DEFAULT]
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.connector,
        orientation === 'horizontal'
          ? styles.connectorHorizontal
          : styles.connectorVertical,
        animatedStyle,
      ]}
    />
  );
};

// ============================================================================
// Main Progress Steps Component
// ============================================================================

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  showDescriptions = true,
  allowClick = false,
  onStepPress,
  style,
}) => {
  const { theme } = useTheme();

  const handleStepPress = useCallback((index: number) => {
    if (allowClick && onStepPress) {
      onStepPress(index, steps[index]);
    }
  }, [allowClick, onStepPress, steps]);

  const containerStyle = [
    styles.container,
    orientation === 'horizontal'
      ? styles.containerHorizontal
      : styles.containerVertical,
    style,
  ];

  return (
    <View style={containerStyle}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = index < currentStep || step.status === 'completed';
        const isActive = index === currentStep || step.status === 'active';

        // Determine effective status
        let effectiveStatus: StepStatus = step.status;
        if (!effectiveStatus || effectiveStatus === 'pending') {
          if (isCompleted) {effectiveStatus = 'completed';}
          else if (isActive) {effectiveStatus = 'active';}
          else {effectiveStatus = 'pending';}
        }

        return (
          <React.Fragment key={step.id}>
            <StepIndicator
              status={effectiveStatus}
              index={index}
              size={size}
              variant={variant}
              icon={step.icon}
              title={step.title}
              description={step.description}
              showDescription={showDescriptions}
              onPress={allowClick ? () => handleStepPress(index) : undefined}
              disabled={step.disabled}
            />

            {!isLast && (
              <Connector
                completed={isCompleted}
                orientation={orientation}
                theme={theme}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ============================================================================
// Utility: Interpolate color for connector
// ============================================================================

function interpolateColor(
  progress: number,
  _inputRange: [number, number],
  [start, end]: [string, string]
): string {
  'worklet';
  // Simple fallback - in real implementation, use proper color interpolation
  return progress > 0.5 ? end : start;
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flexDirection: 'row',
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  containerVertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  stepContainer: {
    alignItems: 'center',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  dotIndicator: {
    borderWidth: 0,
    width: 8,
    height: 8,
  },
  stepNumber: {
    fontWeight: '700',
  },
  stepTextContainer: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  stepTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  stepDescription: {
    marginTop: 4,
    textAlign: 'center',
  },
  connector: {
    backgroundColor: '#E5E7EB',
  },
  connectorHorizontal: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: 15, // Center with md size indicator
  },
  connectorVertical: {
    width: 2,
    height: 24,
    marginVertical: 4,
    marginLeft: 15,
  },
});

export default ProgressSteps;
