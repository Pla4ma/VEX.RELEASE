import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FirstContractCardProps {
  suggestedDurationMinutes: number;
  rhythmLabel?: string;
}

export function FirstContractCard({
  suggestedDurationMinutes,
  rhythmLabel,
}: FirstContractCardProps): JSX.Element {
  return (
    <GlassCard
      padding={14}
      radius={20}
      size="md"
      style={{ marginBottom: 16 }}
      variant="subtle"
    >
      <View>
        <Text
          style={{
            color: vexLightGlass.mint[700],
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 1.4,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          First contract
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.primary,
            fontSize: 14,
            fontWeight: '700',
            lineHeight: 20,
          }}
        >
          {suggestedDurationMinutes} minutes, one clean start.
        </Text>
        {rhythmLabel ? (
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {rhythmLabel}
          </Text>
        ) : null}
      </View>
    </GlassCard>
  );
}
