import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/shared/feedback';
import { useTheme } from '@/theme';
import { semanticOpacity } from '@/theme/tokens/opacity';
import { spacing } from '@/theme/tokens/spacing';
import { sizing } from '@/theme/tokens/sizing';
import { SyncQueueDetails } from './smart-offline/SyncQueueDetails';
import type { PendingAction } from './smart-offline/types';
import { useOfflineAnimation } from './smart-offline/useOfflineAnimation';

interface SmartOfflineIndicatorProps {
  syncQueue: PendingAction[];
  onManualSync?: () => void;
  onDismiss?: () => void;
}

function formatTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ago` : `${seconds}s ago`;
}

export const SmartOfflineIndicator: React.FC<SmartOfflineIndicatorProps> = ({
  syncQueue,
  onManualSync,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const hiddenOffset = -(sizing.height['2xl'] + insets.top + spacing[12]);

  const grouped = useMemo(
    () => ({
      high: syncQueue.filter((item) => item.priority === 'high'),
      medium: syncQueue.filter((item) => item.priority === 'medium'),
      low: syncQueue.filter((item) => item.priority === 'low'),
    }),
    [syncQueue],
  );

  const { animatedStyle, contentStyle, animateOut, handleScale } =
    useOfflineAnimation({
      hiddenOffset,
      animationNormal: theme.animation.normal,
      animationFast: theme.animation.fast,
      animationVerySlow: theme.animation.verySlow,
      isConnected,
      syncQueueLength: syncQueue.length,
      lastSyncTime,
    });

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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (connected) {
        haptics.success('light');
        setLastSyncTime(Date.now());
      } else {
        haptics.warning('light');
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleDismiss = useCallback(() => {
    animateOut();
    onDismiss?.();
  }, [animateOut, onDismiss]);

  const handleSync = useCallback(() => {
    haptics.impact('medium');
    handleScale();
    onManualSync?.();
  }, [handleScale, onManualSync]);

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
      <Animated.View
        style={[
          { paddingHorizontal: spacing[4], paddingBottom: spacing[3] },
          contentStyle,
        ]}
      >
        <Pressable
          accessibilityHint="Expands offline and sync details. Long press dismisses the banner."
          accessibilityLabel={
            isConnected
              ? 'Open sync queue details'
              : 'Open offline sync details'
          }
          accessibilityRole="button"
          onLongPress={handleDismiss}
          onPress={() => {
            setIsExpanded((value) => !value);
            haptics.selection();
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
          <Text
            style={{
              flex: 1,
              color: theme.colors.text.primary,
              ...theme.typography.body.small,
            }}
          >
            {statusText}
          </Text>
          <Text
            style={{
              color: theme.colors.text.secondary,
              ...theme.typography.ui.caption,
            }}
          >
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
