import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassProgressBar } from '../../components/glass/GlassProgressBar';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { LearningExecutionCopy } from '../../features/learning-execution';
import { formatMinutes } from './homeScreenCardStyles';

export interface ContentStudyHeroCardProps {
  activePlan: {
    title: string;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    remainingMinutes: number;
  } | null;
  copy: LearningExecutionCopy;
  hasError: boolean;
  isLoading: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onSeeHowItWorks: () => void;
  onStart: () => void;
}

export function ContentStudyHeroCard({
  activePlan,
  hasError,
  isLoading,
  onContinue,
  onRetry,
  onSeeHowItWorks,
  onStart,
  copy,
}: ContentStudyHeroCardProps) {
  if (isLoading) {
    return (
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {copy.layerName}
          </Text>
          <Skeleton width={180} height={20} borderRadius={8} />
          <Skeleton width="100%" height={16} borderRadius={6} />
          <Skeleton width={132} height={40} borderRadius={12} />
        </View>
      </GlassCard>
    );
  }
  if (hasError) {
    return (
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {copy.layerName}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
            }}
          >
            We could not load your execution progress right now.
          </Text>
          <LiquidButton
            label="Retry"
            onPress={onRetry}
            variant="outline"
            accessibilityLabel="Retry loading"
            accessibilityHint="Double tap to activate"
          />
        </View>
      </GlassCard>
    );
  }
  if (activePlan) {
    return (
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            {`${copy.homeTitle}: "${activePlan.title}"`}
          </Text>
          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                {`Step ${Math.min(activePlan.completedTasks + 1, activePlan.totalTasks)}/${activePlan.totalTasks}`}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 13,
                }}
              >
                {formatMinutes(activePlan.remainingMinutes)}
              </Text>
            </View>
            <GlassProgressBar
              value={activePlan.progressPercent}
              height={8}
              variant="premium"
            />
          </View>
          <LiquidButton
            label={`${copy.homeCta}: ${activePlan.title}`}
            onPress={onContinue}
            variant="primary"
            fullWidth
            accessibilityLabel={copy.homeCta}
            accessibilityHint="Double tap to activate"
          />
        </View>
      </GlassCard>
    );
  }
  return (
    <GlassCard variant="premium" padding={20} radius={26}>
      <View style={{ gap: 12 }}>
        <Text
          style={{
            color: vexLightGlass.mint[700],
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {copy.layerName}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 16,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {copy.emptyTitle}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <LiquidButton
            label={copy.emptyCta}
            onPress={onStart}
            variant="primary"
            accessibilityLabel="Get started"
            accessibilityHint="Double tap to activate"
          />
          <LiquidButton
            label="See How It Works"
            onPress={onSeeHowItWorks}
            variant="outline"
            accessibilityLabel="See how it works"
            accessibilityHint="Double tap to activate"
          />
        </View>
      </View>
    </GlassCard>
  );
}
