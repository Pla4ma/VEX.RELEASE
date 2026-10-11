import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@components/primitives/Text';
import { Skeleton } from '@components/ui/Skeleton';
import { StatusBanner } from '@/shared/ui/components/StatusFeedback';
import { GlassCard } from '../../../components/glass/GlassCard';
import { EmptyStateLens } from '../../../components/glass/EmptyStateLens';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import type { FocusScoreDashboardModel } from '../types';


interface FocusScoreHomeWidgetProps {
  model: FocusScoreDashboardModel;
  onPress: () => void;
  onRetry: () => void;
}

export function FocusScoreHomeWidget({
  model,
  onPress,
  onRetry,
}: FocusScoreHomeWidgetProps): React.ReactNode {
  const { theme } = useTheme();
  if (model.isPending) {
    return (
      <GlassCard testID="focus-score-home-widget-skeleton" variant="default" padding={16} radius={24}>
        <View style={{ gap: 8 }}>
          <Skeleton width={100} height={16} />
          <Skeleton width={200} height={24} />
          <Skeleton width={150} height={16} />
        </View>
      </GlassCard>
    );
  }

  if (model.isError) {
    return (
      <StatusBanner
        status="error"
        message="Focus Score is unavailable"
        description={model.error?.message ?? 'Retry to load your score widget.'}
        onRetry={onRetry}
      />
    );
  }

  if (!model.current) {
    return (
      <GlassCard variant="hero" padding={14} radius={22}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
          <EmptyStateLens sessionsNeeded={3} size={52} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text color="text.secondary" variant="label">Focus Score</Text>
            <Text variant="h4">3 sessions needed</Text>
            <Text color="text.secondary" variant="bodySmall">
              Finish three sessions and VEX will start reading your focus rhythm.
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  }

  const delta = model.current.currentScore - model.current.previousScore;
  const reason = model.history.at(-1)?.reason ?? model.current.lastChangeReason;

  return (
    <View style={{ gap: 8 }}>
      {model.isOffline ? (
        <StatusBanner
          status="offline"
          message="Offline focus mode"
          description="Cached score shown while VEX waits to sync."
        />
      ) : null}
      <Pressable
        onPress={onPress}
        accessibilityLabel="Open focus score dashboard"
        accessibilityRole="button"
        accessibilityHint="Opens the full focus dashboard with trends and factor details"
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <GlassCard variant="default" padding={14} radius={22}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.primary[100],
                borderRadius: theme.borderRadius.full,
                height: 52,
                justifyContent: 'center',
                width: 52,
              }}
            >
              <Icon color={theme.colors.primary[700]} name="bolt" size="sm" variant="solid" />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text color="text.secondary" variant="label">Focus Score</Text>
              <Text variant="h2">
                {model.current.currentScore} · {model.current.band}
              </Text>
              <Text color="text.secondary" variant="bodySmall">
                {delta >= 0 ? `+${delta}` : delta} since last session
              </Text>
              <Text color="text.tertiary" variant="bodySmall" numberOfLines={2}>
                {reason}
              </Text>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </View>
  );
}
