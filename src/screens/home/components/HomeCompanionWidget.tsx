import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { lightColors } from '../../../theme/tokens/colors';
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
  if (status.kind === 'loading') {
    return <SkeletonCard />;
  }

  if (status.kind === 'empty') {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
          }}
        >
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
        <GlassCard variant="warning" padding={16} radius={20}>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: lightColors.semantic.danger,
                fontSize: 14,
              }}
            >
              Companion did not load.
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Tap to retry.
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  }

  if (status.kind === 'offline') {
    return (
      <GlassCard variant="subtle" padding={16} radius={20}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
            }}
          >
            Companion data is offline. It will appear when you reconnect.
          </Text>
        </View>
      </GlassCard>
    );
  }

  return <CompanionCard state={status.state} onPress={onPress} />;
}
