import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { ErrorState } from '../../../components/states/ErrorState';
import { Icon } from '../../../icons';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { FocusScoreDashboardModel } from '../types';
import { loadingSkeleton } from './loading-skeleton';
import { ScoreCard } from './score-card';
import { FactorMap } from './factor-map';
import { WhatChanged } from './what-changed';

interface FocusScoreDashboardProps {
  model: FocusScoreDashboardModel;
  onRetry: () => void;
  onStartSession: () => void;
  onOpenMonthlyReport: () => void;
}

export function FocusScoreDashboard({
  model,
  onRetry,
  onStartSession,
  onOpenMonthlyReport,
}: FocusScoreDashboardProps): JSX.Element {
  if (model.isPending) {
    return loadingSkeleton(
      12,
      'rgba(16, 35, 31, 0.15)',
      vexLightGlass.background.pageMid,
    );
  }
  if (model.isError) {
    return (
      <ErrorState
        title="Focus Score couldn't load"
        description={
          model.error?.message ?? 'Your score data is temporarily unavailable.'
        }
        retryLabel="Retry"
        onRetry={onRetry}
      />
    );
  }
  if (!model.current) {
    return (
      <GlassCard padding={24} radius={32} variant="hero">
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(95, 230, 197, 0.20)',
            borderRadius: 280,
            height: 220,
            position: 'absolute',
            right: -60,
            top: -80,
            width: 220,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(132, 228, 229, 0.18)',
            borderRadius: 200,
            height: 130,
            position: 'absolute',
            right: 30,
            top: 30,
            width: 130,
          }}
        />
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8, zIndex: 2 }}>
          <GlassIconOrb size={72} variant="cyan">
            <Icon color="#0E7490" name="bolt" size="lg" variant="solid" />
          </GlassIconOrb>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 22,
              fontWeight: '800',
              letterSpacing: -0.4,
              lineHeight: 28,
              textAlign: 'center',
            }}
          >
            Your Focus Score needs three sessions
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              lineHeight: 19,
              maxWidth: 280,
              textAlign: 'center',
            }}
          >
            Finish three sessions and VEX will start reading your focus rhythm.
          </Text>
          <View style={{ marginTop: 4 }}>
            <LiquidButton
              accessibilityHint="Starts a focus session to build your Focus Score"
              label="Start session"
              onPress={onStartSession}
              size="md"
              variant="primary"
              rightIcon={
                <Icon color="#FFFFFF" name="arrowRight" size="sm" variant="solid" />
              }
            />
          </View>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <ScoreCard model={model} />
      <FactorMap model={model} />
      <WhatChanged model={model} onOpenMonthlyReport={onOpenMonthlyReport} />
    </View>
  );
}

export { loadingSkeleton } from './loading-skeleton';
export { ScoreCard } from './score-card';
export { FactorMap } from './factor-map';
export { WhatChanged } from './what-changed';
