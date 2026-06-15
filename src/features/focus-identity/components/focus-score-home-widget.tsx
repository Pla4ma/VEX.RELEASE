import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@components/primitives/Text'; // Use alias
import { Skeleton } from '@components/ui/Skeleton'; // Use alias
import { StatusBanner } from '@/shared/ui/components/StatusFeedback'; // Use alias
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { EmptyStateLens } from '../../../components/glass/EmptyStateLens';
import { Icon } from '../../../icons/components/Icon';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { FocusScoreDashboardModel } from '../types'; // Import from types.ts

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
  if (model.isPending) {
    return (
      <GlassCard
        testID="focus-score-home-widget-skeleton"
        variant="default"
        padding={16}
        radius={24}
      >
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
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              Focus Score
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 14,
                fontWeight: '800',
              }}
            >
              3 sessions needed
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
              }}
            >
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
      >
        <GlassCard variant="default" padding={14} radius={22}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
            <LiquidGlassSphere
              color="cyan"
              icon={
                <Icon color="#0E7490" name="bolt" size="sm" variant="solid" />
              }
              intensity={0.88}
              size={52}
            />
            <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                fontWeight: '800',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              Focus Score
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.3,
              }}
            >
              {model.current.currentScore} · {model.current.band}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
              }}
            >
              {delta >= 0 ? `+${delta}` : delta} since last session
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 12,
              }}
              numberOfLines={2}
            >
              {reason}
            </Text>
            </View>
          </View>
        </GlassCard>
      </Pressable>
    </View>
  );
}
