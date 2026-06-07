import React from 'react';
import { View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { NextBestAction } from '../../../features/progression';

export function NextBestActionCard({
  action,
  onPress,
}: {
  action: NextBestAction;
  onPress: () => void;
}) {
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
          Next Best Action
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: -0.2,
          }}
        >
          {action.title}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          {action.description}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 12,
          }}
        >
          {action.rewardLabel}
        </Text>
        <LiquidButton
          label={action.ctaLabel}
          onPress={onPress}
          variant="primary"
          fullWidth
          accessibilityLabel="Perform action"
          accessibilityHint="Double tap to activate"
        />
      </View>
    </GlassCard>
  );
}
