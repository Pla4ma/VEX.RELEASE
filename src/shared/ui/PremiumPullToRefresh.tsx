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
  Animated,
  PanResponder,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { useTheme } from '@/theme';
import { useReducedMotion } from '@/hooks';
import { haptics } from '@/shared/feedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const pullY = useRef(new Animated.Value(0)).current;
  const indicatorRotation = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;

  // Track if haptic was triggered
  const hapticTriggered = useRef(false);

  // Update state based on prop
  React.useEffect(() => {
    if (controlledRefreshing !== undefined) {
      setRefreshState(controlledRefreshing ? 'refreshing' : 'idle');
    }
  }, [controlledRefreshing]);

  // Animate to refreshing state
  const animateToRefreshing = useCallback(() => {
    setRefreshState('refreshing');

    Animated.parallel([
      Animated.spring(pullY, {
        toValue: pullDistance * 0.6,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Start rotation animation
    Animated.loop(
      Animated.timing(indicatorRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [pullY, indicatorRotation, indicatorOpacity, pullDistance]);

  // Animate back to idle
  const animateToIdle = useCallback(() => {
    Animated.parallel([
      Animated.spring(pullY, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRefreshState('idle');
      hapticTriggered.current = false;
    });
  }, [pullY, indicatorOpacity]);

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
        pullY.setValue(easedProgress * pullDistance * 0.8);

        // Update indicator opacity
        indicatorOpacity.setValue(Math.min(pullProgress * 1.5, 1));

        // Update rotation based on pull
        indicatorRotation.setValue(pullProgress * 0.5);

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

  // Interpolated rotation for indicator
  const rotation = indicatorRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Indicator styles
  const indicatorStyle = {
    transform: [
      { rotate: rotation },
      { scale: indicatorScale },
    ],
    opacity: indicatorOpacity,
  };

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
          {
            transform: [{ translateY: pullY }],
            height: pullY,
          },
        ]}
      >
        {renderIndicator()}
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={{
          transform: [{ translateY: pullY }],
        }}
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
