import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { HomeStakes } from '../../../features/home-spine/priority-schemas';

interface StakesCardProps {
  stakes: HomeStakes;
}

export function StakesCard({ stakes }: StakesCardProps): JSX.Element {
  return (
    <GlassCard variant="subtle" padding={14} radius={20} size="sm" style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: vexLightGlass.mint[700],
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          marginBottom: 4,
          textTransform: 'uppercase',
        }}
      >
        What matters now
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {stakes.what}
      </Text>
      {stakes.atRisk ? (
        <Text
          style={{
            color: '#A04A12',
            fontSize: 12,
            marginTop: 6,
          }}
        >
          At risk: {stakes.atRisk}
        </Text>
      ) : null}
    </GlassCard>
  );
}

export default StakesCard;
