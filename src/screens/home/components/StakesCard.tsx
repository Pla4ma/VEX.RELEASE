import React from 'react';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { HomeStakes } from '../../../features/home-spine/priority-schemas';

interface StakesCardProps {
  stakes: HomeStakes;
}

export function StakesCard({ stakes }: StakesCardProps): JSX.Element {
  return (
    <GlassCard
      variant="subtle"
      padding={16}
      radius={20}
      size="sm"
      style={{ marginBottom: 16, marginTop: 12 }}
    >
      <Text
        style={{
          color: vexLightGlass.mint[700],
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          marginBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        What matters now
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 15,
          lineHeight: 21,
          fontWeight: '600',
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
            fontWeight: '600',
          }}
        >
          At risk: {stakes.atRisk}
        </Text>
      ) : null}
    </GlassCard>
  );
}

export default StakesCard;
