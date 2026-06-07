import React from 'react';
import { View } from 'react-native';

import { ErrorState } from '../../../components/states/ErrorState';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useStreakMultiplier, useStreakSummary } from '../../streaks/hooks';
import { useProgressionSummary } from '../hooks';
import { ProgressionStatCard } from './progression-stat-card';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface ProgressionDashboardProps {
  userId: string;
  onStartSession?: () => void;
}

export function ProgressionDashboard({
  userId,
  onStartSession,
}: ProgressionDashboardProps): JSX.Element {
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakSummary(userId);
  const multiplierQuery = useStreakMultiplier(userId);

  if (progressionQuery.isPending) {
    return (
      <GlassCard variant="default" padding={20} radius={26}>
        <View style={{ gap: 12 }}>
          <Skeleton width="35%" height={16} borderRadius={6} />
          <Skeleton width="65%" height={28} borderRadius={10} />
          <Skeleton width="100%" height={10} borderRadius={5} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton width="48%" height={72} borderRadius={14} />
            <Skeleton width="48%" height={72} borderRadius={14} />
          </View>
        </View>
      </GlassCard>
    );
  }

  if (progressionQuery.isError || !progressionQuery.data) {
    return (
      <ErrorState
        title="Progress needs a sync"
        description="Your earned momentum is still safe. Retry to refresh the current level and next milestone."
        retryLabel="Retry progress"
        onRetry={() => progressionQuery.refetch()}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.62)',
          borderColor: 'rgba(255, 255, 255, 0.85)',
          borderRadius: 26,
          borderWidth: 1,
          minHeight: 220,
        }}
      />
    );
  }

  const progression = progressionQuery.data;
  const streak = streakQuery.data;
  const multiplier = multiplierQuery.data?.multiplier ?? 1;
  const remainingXp = Math.max(
    0,
    progression.nextLevelThreshold - progression.xp,
  );

  return (
    <GlassCard variant="premium" padding={20} radius={28}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 14,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            Progression
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.3,
            }}
          >
            {`Level ${progression.level}`}
          </Text>
        </View>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '600',
          }}
        >
          {`${remainingXp.toLocaleString()} XP to Level ${progression.level + 1}`}
        </Text>
      </View>

      <View style={{ gap: 8, marginTop: 12 }}>
        <GlassProgressBar
          value={progression.progressPercent}
          height={10}
          variant="premium"
        />
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 11,
            fontWeight: '600',
          }}
        >
          {`${progression.xp.toLocaleString()} / ${progression.nextLevelThreshold.toLocaleString()} XP`}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
        }}
      >
        <ProgressionStatCard
          label="Current streak"
          value={`${streak?.currentDays ?? 0} days`}
          detail={
            streak?.isAtRisk ? 'Needs a session today' : 'Protected by focus'
          }
          tone={streak?.isAtRisk ? 'warning' : 'default'}
        />
        <ProgressionStatCard
          label="XP multiplier"
          value={`x${multiplier.toFixed(2)}`}
          detail={
            multiplier > 1 ? 'Streak bonus active' : 'Build a 3-day streak'
          }
          tone={multiplier > 1 ? 'success' : 'default'}
        />
      </View>

      {onStartSession ? (
        <View style={{ marginTop: 12 }}>
          <LiquidButton
            label="Earn progress now"
            onPress={onStartSession}
            variant="primary"
            fullWidth
            accessibilityLabel="Start a focus session"
            accessibilityHint="Starts a session to earn XP and protect today's progress"
          />
        </View>
      ) : null}
    </GlassCard>
  );
}
