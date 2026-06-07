import React from 'react';
import { View } from 'react-native';
import { LiquidButton } from '@/components/glass/LiquidButton';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassIconOrb } from '@/components/glass/GlassIconOrb';
import { Icon } from '@/icons';
import { Text } from '@/components/primitives/Text';
import { MAX_FOCUS_SCORE } from '../schemas';
import type { FocusScoreDashboardModel } from '../types';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

interface WhatChangedProps {
  model: FocusScoreDashboardModel;
  onOpenMonthlyReport: () => void;
}

export function WhatChanged({
  model,
  onOpenMonthlyReport,
}: WhatChangedProps): JSX.Element | null {
  if (!model.current) {return null;}

  const nextTarget = Math.min(MAX_FOCUS_SCORE, model.current.currentScore + 20);

  return (
    <GlassCard variant="default" padding={20} radius={26}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 14,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 15,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            What changed
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {model.current.lastChangeReason}
          </Text>
          <Text
            style={{
              color: vexLightGlass.mint[700],
              fontSize: 12,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {`Next target: ${nextTarget}`}
          </Text>
        </View>
        <GlassIconOrb size={56} variant="pearl">
          <Icon color="#0C765F" name="sparkles" size="lg" variant="solid" />
        </GlassIconOrb>
      </View>
      <View style={{ marginTop: 12 }}>
        <LiquidButton
          label="Open monthly report"
          onPress={onOpenMonthlyReport}
          variant="outline"
          fullWidth
          accessibilityLabel="Open monthly focus report"
          accessibilityHint="Opens your monthly focus report details"
        />
      </View>
    </GlassCard>
  );
}
