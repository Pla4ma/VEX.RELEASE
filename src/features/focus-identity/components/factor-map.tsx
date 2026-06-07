import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassProgressBar } from '@/components/glass/GlassProgressBar';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import type { FocusScoreDashboardModel } from '../types';

interface FactorMapProps {
  model: FocusScoreDashboardModel;
}

export function FactorMap({ model }: FactorMapProps): JSX.Element | null {
  const entries = useMemo(() => {
    if (!model.current) {
      return null;
    }
    return [
      ['Consistency', model.current.factors.consistency.score],
      ['Streak stability', model.current.factors.streakStability.score],
      ['Session quality', model.current.factors.sessionQuality.score],
      ['Intentional difficulty', model.current.factors.intentionalDifficulty.score],
      ['Recency', model.current.factors.recency.score],
    ] as const;
  }, [model]);

  if (!entries) {
    return null;
  }

  return (
    <GlassCard variant="default" padding={14} radius={18}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 14,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          Factor map
        </Text>
        <Text style={{ color: vexLightGlass.text.tertiary, fontSize: 11 }}>
          i
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        {entries.map(([label, score]) => (
          <View key={label} style={{ gap: 4 }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 11,
                  fontWeight: '600',
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 11,
                  fontWeight: '700',
                }}
              >
                {score}
              </Text>
            </View>
            <GlassProgressBar value={score} height={5} variant="mint" />
          </View>
        ))}
      </View>
    </GlassCard>
  );
}
