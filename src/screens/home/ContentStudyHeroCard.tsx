import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassProgressBar } from '../../components/glass/GlassProgressBar';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { LearningExecutionCopy } from '../../features/learning-execution';
import { ContentStudyStates } from './ContentStudyStates';

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

/**
 * ContentStudyHeroCard — progress-led composition.
 * The progress bar is the dominant element at the top; meta sits below the
 * title in a single row; the CTA spans the bottom. This is structurally
 * different from the previous 5-line stack.
 */
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
  if (isLoading || hasError) {
    return (
      <ContentStudyStates
        isLoading={isLoading}
        hasError={hasError}
        copy={copy}
        onRetry={onRetry}
        onSeeHowItWorks={onSeeHowItWorks}
        onStart={onStart}
      />
    );
  }

  if (activePlan) {
    return (
      <GlassCard variant="premium" padding={0} radius={26}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
            gap: 10,
          }}
        >
          <GlassProgressBar
            value={activePlan.progressPercent}
            height={6}
            variant="premium"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                color: vexLightGlass.mint[700],
                fontSize: 12,
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
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.5,
              }}
            >
              {activePlan.completedTasks}/{activePlan.totalTasks}
            </Text>
          </View>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.2,
              lineHeight: 24,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {activePlan.title}
          </Text>
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: vexLightGlass.glass.borderSubtle,
            paddingHorizontal: 20,
            paddingVertical: 14,
          }}
        >
          <LiquidButton
            label={`${copy.homeCta} · ${formatRemaining(activePlan.remainingMinutes)} left`}
            onPress={onContinue}
            variant="primary"
            fullWidth
            accessibilityLabel={copy.homeCta}
            accessibilityHint="Double tap to continue your plan"
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
            fontSize: 12,
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
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: -0.3,
            lineHeight: 28,
          }}
        >
          {copy.emptyTitle}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <LiquidButton label={copy.emptyCta} onPress={onStart} variant="primary" />
          <LiquidButton
            label="See How It Works"
            onPress={onSeeHowItWorks}
            variant="outline"
          />
        </View>
      </View>
    </GlassCard>
  );
}

function formatRemaining(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}
