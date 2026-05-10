/**
 * Premium Pull-to-Refresh
 *
 * Beautiful pull-to-refresh with custom animations and haptic feedback.
 * Works with FlashList and ScrollView.
 *
 * Features:
 * - Elastic pull physics
 * - Custom refresh indicator animations
 * - Haptic feedback at threshold
 * - Smart refresh state management
 * - Reduced motion support
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '@/theme';
import { useReducedMotion } from '@/hooks';
import { haptics } from '@/shared/feedback';

// ============================================================================
// Types
// ============================================================================

interface PremiumPullToRefreshProps {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  children: React.ReactNode;
  pullDistance?: number;
  triggerDistance?: number;
  indicatorSize?: number;
  enabled?: boolean;
}

type RefreshState = 'idle' | 'pulling' | 'willRefresh' | 'refreshing';

// ============================================================================
// Component
// ============================================================================

export const PremiumPullToRefresh: React.FC<PremiumPullToRefreshProps> = ({
  onRefresh,
  refreshing: controlledRefreshing,
  children,
  pullDistance = 120,
  triggerDistance = 80,
  indicatorSize = 40,
  enabled = true,
}) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');

  // Animation values
  const pullY = useSharedValue(0);
  const indicatorRotation = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(0);

  // Track if haptic was triggered
  const hapticTriggered = useRef(false);

  const resetHapticTriggered = useCallback(() => {
    setRefreshState('idle');
    hapticTriggered.current = false;
  }, []);

  // Update state based on prop
  React.useEffect(() => {
    if (controlledRefreshing !== undefined) {
      setRefreshState(controlledRefreshing ? 'refreshing' : 'idle');
    }
  }, [controlledRefreshing]);

  // Animate to refreshing state
  const animateToRefreshing = useCallback(() => {
    setRefreshState('refreshing');

    pullY.value = withSpring(pullDistance * 0.6, {
      damping: 16,
      stiffness: 150,
    });
    indicatorOpacity.value = withTiming(1, { duration: 200 });

    // Start rotation animation
    indicatorRotation.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [pullY, indicatorRotation, indicatorOpacity, pullDistance]);

  // Animate back to idle
  const animateToIdle = useCallback(() => {
    cancelAnimation(indicatorRotation);
    indicatorRotation.value = 0;
    pullY.value = withSpring(0, {
      damping: 16,
      stiffness: 150,
    });
    indicatorOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(resetHapticTriggered)();
    });
  }, [pullY, indicatorRotation, indicatorOpacity, resetHapticTriggered]);

  // Handle refresh complete
  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
    } finally {
      animateToIdle();
    }
  }, [onRefresh, animateToIdle]);

  // Pan responder for pull gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled || refreshState === 'refreshing') { return false; }
        // Only respond to downward pulls
        return gestureState.dy > 0 && gestureState.vy > 0;
      },

      onPanResponderMove: (_, gestureState) => {
        if (refreshState === 'refreshing') { return; }

        const pullProgress = Math.min(gestureState.dy / pullDistance, 1);
        const easedProgress = 1 - Math.pow(1 - pullProgress, 3); // Ease out cubic

        // Update pull position
        pullY.value = easedProgress * pullDistance * 0.8;

        // Update indicator opacity
        indicatorOpacity.value = Math.min(pullProgress * 1.5, 1);

        // Update rotation based on pull
        indicatorRotation.value = pullProgress * 0.5;

        // Update state
        if (gestureState.dy >= triggerDistance && refreshState !== 'willRefresh') {
          setRefreshState('willRefresh');
          // Haptic feedback
          if (!hapticTriggered.current && !isReducedMotion) {
            haptics.impact('light');
            hapticTriggered.current = true;
          }
        } else if (gestureState.dy < triggerDistance && refreshState !== 'pulling') {
          setRefreshState('pulling');
          hapticTriggered.current = false;
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy >= triggerDistance) {
          // Trigger refresh
          haptics.success('light');
          animateToRefreshing();
          handleRefresh();
        } else {
          // Cancel - animate back
          animateToIdle();
        }
      },
    })
  ).current;

  // Indicator styles
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${indicatorRotation.value * 360}deg` },
      { scale: indicatorScale.value },
    ],
    opacity: indicatorOpacity.value,
  }));

  const indicatorContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
    height: pullY.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullY.value }],
  }));

  // Get indicator content based on state
  const renderIndicator = () => {
    if (refreshState === 'refreshing') {
      return (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary[500]}
        />
      );
    }

    return (
      <Animated.View style={[
        styles.indicator,
        {
          width: indicatorSize,
          height: indicatorSize,
          borderColor: theme.colors.primary[500],
        },
        indicatorStyle,
      ]}>
        <View style={[
          styles.indicatorArrow,
          { borderTopColor: theme.colors.primary[500] },
        ]} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Pull Indicator */}
      <Animated.View
        style={[
          styles.indicatorContainer,
          indicatorContainerStyle,
        ]}
      >
        {renderIndicator()}
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={contentStyle}
      >
        {children}
      </Animated.View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  indicator: {
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  indicatorArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 2,
  },
});

export default PremiumPullToRefresh;
