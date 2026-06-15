import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { EmptyStateLens } from '../../../components/glass/EmptyStateLens';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
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
}: FocusScoreDashboardProps): React.ReactNode {
  if (model.isPending) {
    return loadingSkeleton(
      12,
      'rgba(16, 35, 31, 0.15)',
      vexLightGlass.background.pageMid,
    );
  }
  if (model.isError) {
    return (
      <GlassCard padding={16} radius={24} variant="warning">
        <View style={{ flexDirection: 'row', gap: 12, zIndex: 2 }}>
          <LiquidGlassSphere
            color="pearl"
            icon={
              <Icon color="#DFA44A" name="exclamation-triangle" size="md" variant="solid" />
            }
            intensity={0.65}
            size={44}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 14,
                fontWeight: '800',
              }}
            >
              Focus Score couldn't load
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                lineHeight: 17,
              }}
            >
              {model.error?.message ?? 'Your score data is temporarily unavailable.'}
            </Text>
            <View style={{ marginTop: 4, maxWidth: 120 }}>
              <LiquidButton
                accessibilityHint="Retry loading Focus Score"
                label="Retry"
                onPress={onRetry}
                size="sm"
                variant="outline"
              />
            </View>
          </View>
        </View>
      </GlassCard>
    );
  }
  if (!model.current) {
    return (
      <GlassCard padding={16} radius={24} variant="hero">
        <View style={{ flexDirection: 'row', gap: 12, zIndex: 2 }}>
          <LiquidGlassSphere
            color="cyan"
            icon={
              <Icon color="#0E7490" name="bolt" size="md" variant="solid" />
            }
            intensity={0.7}
            size={44}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 14,
                fontWeight: '800',
              }}
            >
              Focus Score
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <EmptyStateLens sessionsNeeded={3} size={56} />
              <Text
                style={{
                  color: vexLightGlass.text.tertiary,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                3 sessions needed
              </Text>
            </View>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                lineHeight: 17,
              }}
            >
              Finish three sessions and VEX will start reading your focus rhythm.
            </Text>
            <View style={{ marginTop: 4, maxWidth: 150 }}>
              <LiquidButton
                accessibilityHint="Starts a focus session to build your Focus Score"
                label="Start session"
                onPress={onStartSession}
                size="sm"
                variant="primary"
                rightIcon={
                  <Icon color="#FFFFFF" name="arrowRight" size="sm" variant="solid" />
                }
              />
            </View>
          </View>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={28} />
      </View>
      <ScoreCard score={model.current?.currentScore ?? 0} />
      <FactorMap model={model} />
      <WhatChanged model={model} onOpenMonthlyReport={onOpenMonthlyReport} />
    </View>
  );
}

export { loadingSkeleton } from './loading-skeleton';
export { ScoreCard } from './score-card';
export { FactorMap } from './factor-map';
export { WhatChanged } from './what-changed';
