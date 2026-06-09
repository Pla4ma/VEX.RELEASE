import React from 'react';
import { View } from 'react-native';

import { Text } from '../../components/primitives/Text';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassProgressBar } from '../../components/glass/GlassProgressBar';
import { LiquidButton } from '../../components/glass/LiquidButton';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import type { LearningExecutionCopy } from '../../features/learning-execution';
import { formatMinutes } from './homeScreenCardStyles';
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
      <GlassCard variant="premium" padding={20} radius={26}>
        <View style={{ gap: 12 }}>
          <Text style={{
            color: vexLightGlass.mint[700], fontSize: 11,
            fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{copy.layerName}</Text>
          <Text style={{
            color: vexLightGlass.text.primary, fontSize: 16,
            fontWeight: '800', letterSpacing: -0.2,
          }}>{activePlan.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: vexLightGlass.text.secondary, fontSize: 13 }}>
              {activePlan.completedTasks}/{activePlan.totalTasks} tasks
            </Text>
            <Text style={{ color: vexLightGlass.text.secondary, fontSize: 13 }}>
              {formatMinutes(activePlan.remainingMinutes)}
            </Text>
          </View>
          <GlassProgressBar value={activePlan.progressPercent} height={8} variant="premium" />
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
        <Text style={{
          color: vexLightGlass.mint[700], fontSize: 11,
          fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase',
        }}>{copy.layerName}</Text>
        <Text style={{
          color: vexLightGlass.text.primary, fontSize: 16,
          fontWeight: '800', letterSpacing: -0.2,
        }}>{copy.emptyTitle}</Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <LiquidButton label={copy.emptyCta} onPress={onStart} variant="primary" />
          <LiquidButton label="See How It Works" onPress={onSeeHowItWorks} variant="outline" />
        </View>
      </View>
    </GlassCard>
  );
}
