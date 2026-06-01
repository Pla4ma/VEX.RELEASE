import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { semanticOpacity } from '@/theme/tokens/opacity';
import { spacing } from '@/theme/tokens/spacing';
import { sizing } from '@/theme/tokens/sizing';
import { QueueSection } from './QueueSection';
import type { GroupedPendingActions, PendingAction } from './types';

export function SyncQueueDetails({
  grouped,
  isConnected,
  onSync,
  syncQueue,
}: {
  grouped: GroupedPendingActions;
  isConnected: boolean;
  onSync: () => void;
  syncQueue: PendingAction[];
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={{
        marginTop: spacing[2],
        borderTopWidth: theme.borderRadius.xs,
        borderTopColor: theme.colors.border.light,
      }}
    >
      {grouped.high.length > 0 ? (
        <QueueSection
          title="High priority"
          items={grouped.high}
          color={theme.colors.error.DEFAULT}
        />
      ) : null}
      {grouped.medium.length > 0 ? (
        <QueueSection
          title="Medium priority"
          items={grouped.medium}
          color={theme.colors.warning.DEFAULT}
        />
      ) : null}
      {grouped.low.length > 0 ? (
        <QueueSection
          title="Low priority"
          items={grouped.low}
          color={theme.colors.info.DEFAULT}
        />
      ) : null}
      {isConnected ? (
        <Pressable
          accessibilityHint="Retries every pending sync item now"
          accessibilityLabel={`Retry ${syncQueue.length} pending sync items`}
          accessibilityRole="button"
          onPress={onSync}
          style={({ pressed }) => ({
            minHeight: sizing.touchTarget.min,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.primary[500],
            opacity: pressed ? semanticOpacity.pressed : theme.opacity[100],
          })}
        >
          <Text
            style={{
              color: theme.colors.text.inverse,
              ...theme.typography.ui.button,
            }}
          >
            Sync Now ({syncQueue.length})
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
