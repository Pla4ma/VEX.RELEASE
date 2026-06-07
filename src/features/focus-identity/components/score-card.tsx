import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { StatusBanner } from '@/shared/ui/components/StatusFeedback';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassPill } from '@/components/glass/GlassPill';
import { FocusScoreSparkline } from './score-sparkline';
import { MAX_FOCUS_SCORE } from '../schemas';
import type { FocusScoreDashboardModel } from '../types';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

interface ScoreCardProps {
  model: FocusScoreDashboardModel;
}

export function ScoreCard({ model }: ScoreCardProps): JSX.Element | null {
  if (!model.current) {return null;}

  const latestDelta =
    model.history[model.history.length - 1]?.delta ??
    model.current.currentScore - model.current.previousScore;
  const trendStart = model.history[0]?.score ?? model.current.previousScore;
  const trendDelta = model.current.currentScore - trendStart;

  return (
    <View style={{ gap: 12 }}>
      {model.isOffline ? (
        <StatusBanner
          status="offline"
          message="Offline mode is active"
          description="Showing cached Focus Score data. Updates will sync when your connection is back."
        />
      ) : null}
      {model.isRefetching ? (
        <StatusBanner
          status="loading"
          message="Refreshing Focus Score"
          description="Updating your latest score signals."
        />
      ) : null}
      <GlassCard variant="hero" padding={14} radius={18}>
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.08)',
            borderRadius: 200,
            height: 120,
            position: 'absolute',
            right: -60,
            top: -40,
            width: 120,
          }}
        />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 0.2,
            }}
          >
            Focus Score
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Last session
            </Text>
            <Text
              style={{
                color: latestDelta >= 0 ? vexLightGlass.mint[600] : '#B91C1C',
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {latestDelta >= 0 ? `+${latestDelta}` : `${latestDelta}`}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 6,
              }}
            >
              30-day trend
            </Text>
            <Text
              style={{
                color: trendDelta >= 0 ? vexLightGlass.mint[600] : '#B91C1C',
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              {trendDelta >= 0 ? `+${trendDelta}` : `${trendDelta}`}
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: 'flex-end',
            flexDirection: 'row',
            gap: 12,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 48,
              fontWeight: '800',
              letterSpacing: -1.2,
              lineHeight: 52,
            }}
          >
            {model.current.currentScore}
          </Text>
          <View style={{ paddingBottom: 10 }}>
            <GlassPill label={model.current.band} variant="success" size="md" />
          </View>
        </View>
        <View style={{ marginTop: 4 }}>
          <FocusScoreSparkline
            color={vexLightGlass.mint[500]}
            data={model.history.map((h) => h.score)}
            height={42}
            max={MAX_FOCUS_SCORE}
          />
        </View>
      </GlassCard>
    </View>
  );
}
