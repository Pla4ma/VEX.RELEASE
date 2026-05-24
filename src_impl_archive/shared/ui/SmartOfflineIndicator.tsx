import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/shared/feedback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/theme';
import { semanticOpacity } from '@/theme/tokens/opacity';
import { spacing } from '@/theme/tokens/spacing';
import { sizing } from '@/theme/tokens/sizing';
import { SyncQueueDetails } from './smart-offline/SyncQueueDetails';
import type { PendingAction } from './smart-offline/types';

interface SmartOfflineIndicatorProps { syncQueue: PendingAction[]; onManualSync?: () => void; onDismiss?: () => void; }

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ago` : `${seconds}s ago`;
}

export const SmartOfflineIndicator: React.FC<SmartOfflineIndicatorProps> = ({ syncQueue, onManualSync, onDismiss }) => {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenOffset = -(sizing.height['2xl'] + insets.top + spacing[12]);
  const translateY = useSharedValue(hiddenOffset);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const grouped = useMemo(() => ({
    high: syncQueue.filter((item) => item.priority === 'high'),
    medium: syncQueue.filter((item) => item.priority === 'medium'),
    low: syncQueue.filter((item) => item.priority === 'low'),
  }), [syncQueue]);

  const statusColor = !isConnected
    ? theme.colors.error.DEFAULT
    : grouped.high.length > 0
      ? theme.colors.warning.DEFAULT
      : theme.colors.success.DEFAULT;

  const statusText = !isConnected
    ? syncQueue.length > 0
      ? `Offline - ${syncQueue.length} pending`
      : 'Offline'
    : syncQueue.length > 0
      ? `${syncQueue.length} items waiting to sync`
      : lastSyncTime
        ? `Online - synced ${formatTime(lastSyncTime)}`
        : 'Online';

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const animateIn = useCallback(() => {
    clearHideTimer();
    translateY.value = isReducedMotion ? 0 : withSpring(0, { damping: 18, stiffness: 260 });
    opacity.value = withTiming(1, { duration: isReducedMotion ? 0 : theme.animation.normal });
  }, [clearHideTimer, isReducedMotion, opacity, theme.animation.normal, translateY]);

  const animateOut = useCallback(() => {
    translateY.value = withTiming(hiddenOffset, {
      duration: isReducedMotion ? 0 : theme.animation.fast,
    });
    opacity.value = withTiming(0, { duration: isReducedMotion ? 0 : theme.animation.fast });
  }, [hiddenOffset, isReducedMotion, opacity, theme.animation.fast, translateY]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (connected) {
        void haptics.success('light');
        setLastSyncTime(Date.now());
      } else {
        void haptics.warning('light');
      }
    });
    return () => {
      clearHideTimer();
      unsubscribe();
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (!isConnected || syncQueue.length > 0) {
      animateIn();
      return;
    }
    if (lastSyncTime) {
      animateIn();
      hideTimer.current = setTimeout(animateOut, theme.animation.verySlow);
    }
  }, [animateIn, animateOut, isConnected, lastSyncTime, syncQueue.length, theme.animation.verySlow]);

  const handleDismiss = useCallback(() => {
    animateOut();
    onDismiss?.();
  }, [animateOut, onDismiss]);

  const handleSync = useCallback(() => {
    void haptics.impact('medium');
    scale.value = isReducedMotion ? 1 : withSpring(1, { damping: 16, stiffness: 300 });
    onManualSync?.();
  }, [isReducedMotion, onManualSync, scale]);

  if (isConnected && syncQueue.length === 0 && !lastSyncTime) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.toast,
          backgroundColor: theme.colors.surface.card,
          borderBottomWidth: theme.borderRadius.xs,
          borderColor: statusColor,
          paddingTop: insets.top + spacing[2],
        },
        animatedStyle,
      ]}
    >
      <Animated.View style={[{ paddingHorizontal: spacing[4], paddingBottom: spacing[3] }, contentStyle]}>
        <Pressable
          accessibilityHint="Expands offline and sync details. Long press dismisses the banner."
          accessibilityLabel={isConnected ? 'Open sync queue details' : 'Open offline sync details'}
          accessibilityRole="button"
          onLongPress={handleDismiss}
          onPress={() => {
            setIsExpanded((value) => !value);
            void haptics.selection();
          }}
          style={({ pressed }) => ({
            minHeight: sizing.touchTarget.min,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? semanticOpacity.pressed : semanticOpacity.hover,
          })}
        >
          <View
            style={{
              width: spacing[3],
              height: spacing[3],
              borderRadius: theme.borderRadius.full,
              marginRight: spacing[3],
              backgroundColor: statusColor,
            }}
          />
          <Text style={{ flex: 1, color: theme.colors.text.primary, ...theme.typography.body.small }}>
            {statusText}
          </Text>
          <Text style={{ color: theme.colors.text.secondary, ...theme.typography.ui.caption }}>
            {isExpanded ? 'Hide' : 'Details'}
          </Text>
        </Pressable>

        {isExpanded && syncQueue.length > 0 ? (
          <SyncQueueDetails
            grouped={grouped}
            isConnected={isConnected}
            onSync={handleSync}
            syncQueue={syncQueue}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};

export default SmartOfflineIndicator;
