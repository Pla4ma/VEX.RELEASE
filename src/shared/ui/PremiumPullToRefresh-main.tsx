import React, { useRef, useState, useCallback } from 'react';
import { View, PanResponder, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { useReducedMotion } from '@/hooks';
import { haptics } from '@/shared/feedback';
import { useRefreshAnimations } from './PremiumPullToRefresh-animations';
import { styles } from './PremiumPullToRefresh-styles';

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
  const pullY = useSharedValue(0);
  const indicatorRotation = useSharedValue(0);
  const indicatorScale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(0);
  const hapticTriggered = useRef(false);

  const resetHapticTriggered = useCallback(() => {
    setRefreshState('idle');
    hapticTriggered.current = false;
  }, []);

  React.useEffect(() => {
    if (controlledRefreshing !== undefined) {
      setRefreshState(controlledRefreshing ? 'refreshing' : 'idle');
    }
  }, [controlledRefreshing]);

  const {
    animateToRefreshing,
    animateToIdle,
    indicatorStyle,
    indicatorContainerStyle,
    contentStyle,
  } = useRefreshAnimations(
    pullY,
    indicatorRotation,
    indicatorScale,
    indicatorOpacity,
    pullDistance,
    resetHapticTriggered,
  );

  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
    } finally {
      animateToIdle();
    }
  }, [onRefresh, animateToIdle]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled || refreshState === 'refreshing') {
          return false;
        }
        return gestureState.dy > 0 && gestureState.vy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (refreshState === 'refreshing') {
          return;
        }
        const pullProgress = Math.min(gestureState.dy / pullDistance, 1);
        const easedProgress = 1 - Math.pow(1 - pullProgress, 3);
        pullY.value = easedProgress * pullDistance * 0.8;
        indicatorOpacity.value = Math.min(pullProgress * 1.5, 1);
        indicatorRotation.value = pullProgress * 0.5;
        if (
          gestureState.dy >= triggerDistance &&
          refreshState !== 'willRefresh'
        ) {
          setRefreshState('willRefresh');
          if (!hapticTriggered.current && !isReducedMotion) {
            haptics.impact('light');
            hapticTriggered.current = true;
          }
        } else if (
          gestureState.dy < triggerDistance &&
          refreshState !== 'pulling'
        ) {
          setRefreshState('pulling');
          hapticTriggered.current = false;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy >= triggerDistance) {
          haptics.success('light');
          animateToRefreshing();
          handleRefresh();
        } else {
          animateToIdle();
        }
      },
    }),
  ).current;

  const renderIndicator = () => {
    if (refreshState === 'refreshing') {
      return (
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      );
    }
    return (
      <Animated.View
        style={[
          styles.indicator,
          {
            width: indicatorSize,
            height: indicatorSize,
            borderColor: theme.colors.primary[500],
          },
          indicatorStyle,
        ]}
      >
        <View
          style={[
            styles.indicatorArrow,
            { borderTopColor: theme.colors.primary[500] },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[styles.indicatorContainer, indicatorContainerStyle]}
      >
        {renderIndicator()}
      </Animated.View>
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
};

export { PremiumPullToRefresh }