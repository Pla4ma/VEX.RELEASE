import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import { styles } from './progress-state.styles';
import { ProgressBar } from './progress-indicators';
import { lightColors } from '@/theme/tokens/colors';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  progress?: number;
  showProgress?: boolean;
}

export function LoadingState({
  message = 'Loading...',
  submessage,
  progress,
  showProgress = false,
}: LoadingStateProps) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={lightColors.accent.teal} />
      <Text style={styles.loadingMessage}>{message}</Text>
      {submessage && <Text style={styles.loadingSubmessage}>{submessage}</Text>}
      {showProgress && progress !== undefined && (
        <ProgressBar
          progress={progress}
          style={styles.loadingProgress}
          showPercentage
        />
      )}
    </View>
  );
}

function LoadingDot({ index }: { index: number }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }, index * 150);
    return () => clearTimeout(timer);
  }, [index, scale]);
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export function LoadingDots({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingDot key={`item-${i}`} index={i} />
      ))}
    </View>
  );
}
