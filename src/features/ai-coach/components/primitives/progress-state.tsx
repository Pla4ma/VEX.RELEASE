import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { styles } from './progress-state.styles';
import { lightColors } from '@/theme/tokens/colors';

export { ProgressBar, SegmentedProgress, CircularProgress } from './progress-indicators';
export { LoadingState, LoadingDots } from './loading-states';

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isCompleted && styles.stepCircleCompleted,
                isCurrent && styles.stepCircleCurrent,
              ]}
            >
              {isCompleted ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    (isCurrent || isCompleted) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                isCompleted && styles.stepLabelCompleted,
                isCurrent && styles.stepLabelCurrent,
              ]}
            >
              {step}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

interface SuccessStateProps {
  title?: string;
  message: string;
  onComplete?: () => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export function SuccessState({
  title = 'Success!',
  message,
  onComplete,
  autoDismiss = false,
  dismissDelay = 2000,
}: SuccessStateProps) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    if (autoDismiss && onComplete) {
      const timer = setTimeout(onComplete, dismissDelay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [scale, autoDismiss, dismissDelay, onComplete]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[styles.successContainer, animatedStyle]}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.successTitle}>{title}</Text>
      <Text style={styles.successMessage}>{message}</Text>
    </Animated.View>
  );
}

interface ProcessingStateProps {
  steps: {
    label: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
  }[];
}

export function ProcessingState({ steps }: ProcessingStateProps) {
  return (
    <View style={styles.processingContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.processingItem}>
          <View
            style={[
              styles.processingDot,
              step.status === 'completed' && styles.processingDotCompleted,
              step.status === 'error' && styles.processingDotError,
              step.status === 'processing' && styles.processingDotProcessing,
            ]}
          >
            {step.status === 'completed' && (
              <Text style={styles.processingCheck}>✓</Text>
            )}
            {step.status === 'error' && (
              <Text style={styles.processingError}>✕</Text>
            )}
            {step.status === 'processing' && (
              <ActivityIndicator size="small" color={lightColors.text.inverse} />
            )}
          </View>
          <Text
            style={[
              styles.processingLabel,
              step.status === 'completed' && styles.processingLabelCompleted,
              step.status === 'error' && styles.processingLabelError,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
