import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { HomeCompanionStatus } from '../hooks/useHomeCompanion';
import { CompanionCard, SkeletonCard } from './HomeCompanionWidget.cards';

interface HomeCompanionWidgetProps {
  status: HomeCompanionStatus;
  onRetry: () => void;
  onPress?: () => void;
}

export function HomeCompanionWidget({
  status,
  onRetry,
  onPress,
}: HomeCompanionWidgetProps): JSX.Element | null {
  const { theme } = useTheme();

  if (status.kind === 'loading') {
    return <SkeletonCard />;
  }

  if (status.kind === 'empty') {
    return (
      <View style={{ padding: theme.spacing[4], alignItems: 'center' }}>
        <Text variant="caption" color="text.secondary">
          Your companion will appear after your first focus session.
        </Text>
      </View>
    );
  }

  if (status.kind === 'error') {
    return (
      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        accessibilityLabel="Retry loading companion"
        accessibilityRole="button"
      >
        <View
          style={{
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.spacing[4],
            borderWidth: 1,
            borderColor: theme.colors.error.light,
            padding: theme.spacing[4],
            alignItems: 'center',
          }}
        >
          <Text variant="body" color="error.DEFAULT">
            Companion did not load.
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            style={{ marginTop: theme.spacing[1] }}
          >
            Tap to retry.
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (status.kind === 'offline') {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderRadius: theme.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          padding: theme.spacing[4],
          alignItems: 'center',
          opacity: 0.7,
        }}
      >
        <Text variant="caption" color="text.secondary">
          Companion data is offline. It will appear when you reconnect.
        </Text>
      </View>
    );
  }

  return <CompanionCard state={status.state} onPress={onPress} />;
}
