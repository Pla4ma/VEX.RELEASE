import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme';
import { spacing } from '@/theme/tokens/spacing';
import { sizing } from '@/theme/tokens/sizing';
import type { PendingAction } from './types';

export function QueueSection({
  title,
  items,
  color,
}: {
  title: string;
  items: PendingAction[];
  color: string;
}): JSX.Element {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: spacing[3] }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing[2],
        }}
      >
        <View
          style={{
            width: spacing[2],
            height: spacing[2],
            borderRadius: theme.borderRadius.full,
            marginRight: spacing[2],
            backgroundColor: color,
          }}
        />
        <Text
          style={{
            color: theme.colors.text.secondary,
            ...theme.typography.ui.caption,
          }}
        >
          {title} ({items.length})
        </Text>
      </View>
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            minHeight: sizing.touchTarget.min,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing[2],
            paddingLeft: spacing[4],
          }}
        >
          <Text
            style={{
              color,
              minWidth: sizing.width.xs,
              ...theme.typography.ui.caption,
            }}
          >
            {item.type.toUpperCase()}
          </Text>
          <Text
            style={{
              flex: 1,
              color: theme.colors.text.primary,
              ...theme.typography.body.small,
            }}
          >
            {item.description}
          </Text>
          {item.retryCount > 0 ? (
            <Text
              style={{
                color: theme.colors.warning.DEFAULT,
                ...theme.typography.ui.caption,
              }}
            >
              Retry {item.retryCount}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
